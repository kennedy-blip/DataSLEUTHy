"""DataSleuth API - local-first data analytics backend."""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile
from pydantic import BaseModel, Field

DB_PATH = Path("data/datasets.db")

app = FastAPI(title="DataSleuth API", version="0.1.0")


def get_db_connection() -> sqlite3.Connection:
    """Return a SQLite connection, creating the data directory if needed."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


class ColumnSchema(BaseModel):
    """Schema for a single column."""

    name: str = Field(..., description="Column name")
    dtype: str = Field(..., description="Detected data type")
    null_count: int = Field(..., description="Number of null values")
    sample: Optional[List[Any]] = Field(
        default=None, description="Up to 5 sample values"
    )


class DatasetStats(BaseModel):
    """Descriptive statistics for a dataset."""

    rows: int = Field(..., description="Total row count")
    columns: int = Field(..., description="Total column count")
    column_count: int = Field(..., description="Number of columns")
    column_types: Dict[str, str] = Field(
        default_factory=dict, description="Column name -> dtype"
    )
    null_counts: Dict[str, int] = Field(
        default_factory=dict, description="Column name -> null count"
    )
    numeric_stats: Dict[str, Dict[str, Any]] = Field(
        default_factory=dict, description="Per-numeric-column stats"
    )
    categorical_distributions: Dict[str, Dict[str, int]] = Field(
        default_factory=dict, description="Per-categorical-column value counts"
    )
    sample_rows: List[Dict[str, Any]] = Field(
        default_factory=list, description="First 5 rows"
    )
    error: Optional[str] = Field(
        default=None, description="Error message if parsing failed"
    )


class QueryResult(BaseModel):
    """Result of a SQL query."""

    columns: List[str] = Field(..., description="Result column names")
    rows: List[List[Any]] = Field(..., description="Result rows")
    row_count: int = Field(..., description="Number of rows returned")
    error: Optional[str] = Field(
        default=None, description="Error message if query failed"
    )


class DatasetSchema(BaseModel):
    """Schema for a dataset."""

    name: str = Field(..., description="Dataset name")
    columns: List[ColumnSchema] = Field(..., description="Column schemas")


def init_db() -> None:
    """Initialize the SQLite database schema."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_db_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS datasets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )
        conn.commit()


def safe_cast(value: Any) -> Any:
    """Safely cast a value for JSON serialization."""
    if value is None:
        return None
    if isinstance(value, (int, float, str, bool)):
        return value
    return str(value)


@app.on_event("startup")
async def startup_event() -> None:
    """Initialize the database on startup."""
    init_db()


@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint."""
    return {"message": "DataSleuth API", "version": "0.1.0"}


@app.get("/health")
async def health() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/datasets")
async def upload_dataset(file: UploadFile) -> DatasetSchema:
    """Upload a CSV file, parse it, store it, and return its schema."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    try:
        contents = await file.read()
        df = pd.read_csv(pd.io.common.BytesIO(contents), dtype=str, keep_default_na=True)
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {exc}")

    if df.empty or len(df.columns) == 0:
        raise HTTPException(status_code=400, detail="CSV has no data")

    name = Path(file.filename).stem
    try:
        with get_db_connection() as conn:
            conn.execute(
                "INSERT OR IGNORE INTO datasets (name) VALUES (?)", (name,)
            )
            df.to_sql(name, conn, index=False, if_exists="replace")
            conn.commit()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Failed to store dataset: {exc}")

    column_schemas: List[ColumnSchema] = []
    for col in df.columns:
        col_data = df[col].dropna()
        if len(col_data) == 0:
            dtype = "null"
        elif col_data.apply(lambda x: isinstance(x, (int, float))).all():
            dtype = "numeric"
        elif col_data.apply(lambda x: isinstance(x, str) and x.isdigit()).all():
            dtype = "integer"
        else:
            dtype = "string"

        column_schemas.append(
            ColumnSchema(
                name=col,
                dtype=dtype,
                null_count=int(df[col].isna().sum()),
                sample=df[col].dropna().head(5).tolist(),
            )
        )

    return DatasetSchema(name=name, columns=column_schemas)


@app.get("/datasets")
async def list_datasets() -> Dict[str, List[str]]:
    """List all uploaded datasets."""
    with get_db_connection() as conn:
        rows = conn.execute("SELECT name FROM datasets").fetchall()
    return {"datasets": [row["name"] for row in rows]}


@app.get("/datasets/{name}/stats")
async def get_stats(name: str) -> DatasetStats:
    """Get descriptive statistics for a dataset."""
    with get_db_connection() as conn:
        exists = conn.execute(
            "SELECT name FROM datasets WHERE name = ?", (name,)
        ).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found")

        df = pd.read_sql_table(name, conn)

    stats = DatasetStats(
        rows=len(df),
        columns=len(df.columns),
        column_count=len(df.columns),
        column_types={},
        null_counts={},
        numeric_stats={},
        categorical_distributions={},
        sample_rows=[],
    )

    for col in df.columns:
        col_data = df[col]
        stats.column_types[col] = "numeric" if pd.api.types.is_numeric_dtype(
            col_data
        ) else "string"
        stats.null_counts[col] = int(col_data.isna().sum())

        if pd.api.types.is_numeric_dtype(col_data):
            stats.numeric_stats[col] = {
                "mean": float(col_data.mean()) if len(col_data) else None,
                "median": float(col_data.median()) if len(col_data) else None,
                "min": float(col_data.min()) if len(col_data) else None,
                "max": float(col_data.max()) if len(col_data) else None,
                "std": float(col_data.std()) if len(col_data) else None,
                "null_count": int(col_data.isna().sum()),
            }
        else:
            value_counts = col_data.value_counts(dropna=False).to_dict()
            stats.categorical_distributions[col] = {
                str(k): int(v) for k, v in value_counts.items()
            }

    stats.sample_rows = [
        {col: safe_cast(row[col]) for col in df.columns}
        for row in df.head(5).to_dict("records")
    ]

    return stats


@app.post("/datasets/{name}/query")
async def run_query(name: str, query: str) -> QueryResult:
    """Execute a parameterized SQL query against a dataset."""
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Safety checks: only SELECT allowed, no dangerous keywords
    normalized = query.strip().upper()
    if not normalized.startswith("SELECT"):
        raise HTTPException(
            status_code=400,
            detail="Only SELECT queries are allowed",
        )
    dangerous = [
        "DROP",
        "DELETE",
        "INSERT",
        "UPDATE",
        "CREATE",
        "ALTER",
        "TRUNCATE",
        "EXEC",
        "EXECUTE",
        "--",
        ";",
    ]
    for token in dangerous:
        if token in normalized:
            raise HTTPException(
                status_code=400, detail=f"Query contains disallowed keyword: {token}"
            )

    with get_db_connection() as conn:
        exists = conn.execute(
            "SELECT name FROM datasets WHERE name = ?", (name,)
        ).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found")

        try:
            result = pd.read_sql_query(query, conn)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Query error: {exc}")

    return QueryResult(
        columns=list(result.columns),
        rows=[list(map(safe_cast, row)) for row in result.values],
        row_count=len(result),
    )


@app.delete("/datasets/{name}")
async def delete_dataset(name: str) -> Dict[str, str]:
    """Delete a dataset."""
    with get_db_connection() as conn:
        exists = conn.execute(
            "SELECT name FROM datasets WHERE name = ?", (name,)
        ).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found")
        conn.execute("DELETE FROM datasets WHERE name = ?", (name,))
        conn.commit()
    return {"message": f"Dataset '{name}' deleted"}

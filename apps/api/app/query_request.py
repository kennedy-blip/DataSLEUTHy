class QueryRequest(BaseModel):
    """Request body for SQL query."""

    query: str = Field(..., description="SQL query to execute")

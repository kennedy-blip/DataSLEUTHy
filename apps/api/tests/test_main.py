"""Tests for DataSleuth API."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    """Health check should return ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_root() -> None:
    """Root endpoint should return a message."""
    response = client.get("/")
    assert response.status_code == 200
    assert "DataSleuth" in response.json()["message"]


def test_upload_and_stats() -> None:
    """Upload a small CSV and check stats."""
    csv_content = "a,b\n1,x\n2,y\n3,z\n"
    response = client.post(
        "/datasets",
        files={"file": ("test.csv", csv_content, "text/csv")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "test"
    assert len(data["columns"]) == 2

    stats_response = client.get("/datasets/test/stats")
    assert stats_response.status_code == 200
    stats = stats_response.json()
    assert stats["rows"] == 3
    assert stats["columns"] == 2
    assert stats["numeric_stats"]["a"]["mean"] == 2.0


def test_query() -> None:
    """Run a SELECT query."""
    response = client.post(
        "/datasets/test/query",
        json={"query": "SELECT * FROM test"},
    )
    assert response.status_code == 200
    result = response.json()
    assert result["row_count"] == 3


def test_query_rejects_non_select() -> None:
    """Non-SELECT queries should be rejected."""
    response = client.post(
        "/datasets/test/query",
        json={"query": "DROP TABLE test"},
    )
    assert response.status_code == 400


def test_stats_missing_dataset() -> None:
    """Stats for missing dataset should 404."""
    response = client.get("/datasets/does_not_exist/stats")
    assert response.status_code == 404

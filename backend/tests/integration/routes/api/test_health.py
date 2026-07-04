def test_health_endpoint(test_client):
    response = test_client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"api": True, "database": True}

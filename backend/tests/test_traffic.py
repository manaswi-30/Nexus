import pytest

def get_token(client, role="admin", suffix=""):
    """Helper to register and get auth token"""
    email = f"{role}{suffix}traffic@nexus.com"
    client.post("/api/v1/auth/register", json={
        "full_name": f"Test {role}",
        "email": email,
        "password": "testpass123",
        "role": role
    })
    response = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "testpass123"
    })
    return response.json()["access_token"]

# ── Test 14: Traffic status requires login ───────────────────────────────
def test_traffic_status_requires_auth(client):
    response = client.get("/api/v1/traffic/status")
    assert response.status_code == 401

# ── Test 15: Traffic status works with valid token ────────────────────────
def test_traffic_status_with_auth(client):
    token = get_token(client, "viewer", "1")
    response = client.get(
        "/api/v1/traffic/status",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert "accessed_by" in response.json()
    assert "role" in response.json()

# ── Test 16: Viewer cannot trigger emergency ──────────────────────────────
def test_viewer_cannot_trigger_emergency(client):
    token = get_token(client, "viewer", "2")
    response = client.post(
        "/api/v1/traffic/emergency",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403

# ── Test 17: Operator can trigger emergency ───────────────────────────────
def test_operator_can_trigger_emergency(client):
    token = get_token(client, "operator", "1")
    response = client.post(
        "/api/v1/traffic/emergency",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert "triggered_by" in response.json()

# ── Test 18: Admin can trigger emergency ──────────────────────────────────
def test_admin_can_trigger_emergency(client):
    token = get_token(client, "admin", "1")
    response = client.post(
        "/api/v1/traffic/emergency",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200

# ── Test 19: Admin can see logs ───────────────────────────────────────────
def test_admin_can_see_logs(client):
    token = get_token(client, "admin", "2")
    response = client.get(
        "/api/v1/traffic/logs",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert "logs" in response.json()

# ── Test 20: Viewer cannot see logs ──────────────────────────────────────
def test_viewer_cannot_see_logs(client):
    token = get_token(client, "viewer", "3")
    response = client.get(
        "/api/v1/traffic/logs",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403

# ── Test 21: Operator cannot see logs ────────────────────────────────────
def test_operator_cannot_see_logs(client):
    token = get_token(client, "operator", "2")
    response = client.get(
        "/api/v1/traffic/logs",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403

# ── Test 22: Admin can see emissions ─────────────────────────────────────
def test_admin_can_see_emissions(client):
    token = get_token(client, "admin", "3")
    response = client.get(
        "/api/v1/traffic/emissions",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert "emissions" in response.json()

# ── Test 23: Viewer cannot see emissions ─────────────────────────────────
def test_viewer_cannot_see_emissions(client):
    token = get_token(client, "viewer", "4")
    response = client.get(
        "/api/v1/traffic/emissions",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403

# ── Test 24: Admin can see emergency history ──────────────────────────────
def test_admin_can_see_emergency_history(client):
    token = get_token(client, "admin", "4")
    response = client.get(
        "/api/v1/traffic/emergency/history",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert "events" in response.json()

# ── Test 25: No token returns 403 ────────────────────────────────────────
def test_no_token_returns_401(client):
    response = client.get("/api/v1/traffic/emissions")
    assert response.status_code == 401

# ── Test 26: Fake token returns 401 ──────────────────────────────────────
def test_fake_token_returns_401(client):
    response = client.get(
        "/api/v1/traffic/status",
        headers={"Authorization": "Bearer fake.token.here"}
    )
    assert response.status_code == 401

# ── Test 27: Root endpoint works ──────────────────────────────────────────
def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "status" in response.json()

# ── Test 28: Intersections endpoint works ────────────────────────────────
def test_intersections_endpoint(client):
    response = client.get("/intersections")
    assert response.status_code == 200
    data = response.json()
    assert "intersections" in data
    assert len(data["intersections"]) == 16

# ── Test 29: Weather endpoint works ──────────────────────────────────────
def test_weather_endpoint(client):
    response = client.get("/weather")
    assert response.status_code == 200
    assert "condition" in response.json()

# ── Test 30: Metrics endpoint works ──────────────────────────────────────
def test_metrics_endpoint(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "avg_queue_length" in data
    assert "active_intersections" in data
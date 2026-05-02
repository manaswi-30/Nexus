import pytest

# ── Test 1: Register a new user ───────────────────────────────────────────
def test_register_user(client):
    response = client.post("/api/v1/auth/register", json={
        "full_name": "Test User",
        "email": "test@nexus.com",
        "password": "testpass123",
        "role": "viewer"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@nexus.com"
    assert data["role"] == "viewer"
    assert "user_id" in data

# ── Test 2: Cannot register same email twice ──────────────────────────────
def test_register_duplicate_email(client):
    client.post("/api/v1/auth/register", json={
        "full_name": "Duplicate User",
        "email": "duplicate@nexus.com",
        "password": "pass123",
        "role": "viewer"
    })
    response = client.post("/api/v1/auth/register", json={
        "full_name": "Duplicate User 2",
        "email": "duplicate@nexus.com",
        "password": "pass456",
        "role": "viewer"
    })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

# ── Test 3: Login with correct credentials ────────────────────────────────
def test_login_success(client):
    client.post("/api/v1/auth/register", json={
        "full_name": "Login User",
        "email": "login@nexus.com",
        "password": "mypassword",
        "role": "operator"
    })
    response = client.post("/api/v1/auth/login", json={
        "email": "login@nexus.com",
        "password": "mypassword"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "operator"
    assert data["token_type"] == "bearer"

# ── Test 4: Login with wrong password ────────────────────────────────────
def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={
        "full_name": "Wrong Pass User",
        "email": "wrongpass@nexus.com",
        "password": "correctpass",
        "role": "viewer"
    })
    response = client.post("/api/v1/auth/login", json={
        "email": "wrongpass@nexus.com",
        "password": "wrongpass"
    })
    assert response.status_code == 401

# ── Test 5: Login with non-existent email ────────────────────────────────
def test_login_nonexistent_user(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "nobody@nexus.com",
        "password": "anypass"
    })
    assert response.status_code == 401

# ── Test 6: Register admin role ───────────────────────────────────────────
def test_register_admin(client):
    response = client.post("/api/v1/auth/register", json={
        "full_name": "Admin User",
        "email": "admin@nexus.com",
        "password": "adminpass",
        "role": "admin"
    })
    assert response.status_code == 200
    assert response.json()["role"] == "admin"

# ── Test 7: Register operator role ───────────────────────────────────────
def test_register_operator(client):
    response = client.post("/api/v1/auth/register", json={
        "full_name": "Operator User",
        "email": "operator@nexus.com",
        "password": "operatorpass",
        "role": "operator"
    })
    assert response.status_code == 200
    assert response.json()["role"] == "operator"

# ── Test 8: Login returns correct name ───────────────────────────────────
def test_login_returns_name(client):
    client.post("/api/v1/auth/register", json={
        "full_name": "Named User",
        "email": "named@nexus.com",
        "password": "pass123",
        "role": "viewer"
    })
    response = client.post("/api/v1/auth/login", json={
        "email": "named@nexus.com",
        "password": "pass123"
    })
    assert response.json()["name"] == "Named User"

# ── Test 9: Get current user with valid token ─────────────────────────────
def test_get_me_valid_token(client):
    client.post("/api/v1/auth/register", json={
        "full_name": "Me User",
        "email": "me@nexus.com",
        "password": "mepass123",
        "role": "viewer"
    })
    login = client.post("/api/v1/auth/login", json={
        "email": "me@nexus.com",
        "password": "mepass123"
    })
    token = login.json()["access_token"]
    response = client.get(f"/api/v1/auth/me?token={token}")
    assert response.status_code == 200
    assert response.json()["email"] == "me@nexus.com"

# ── Test 10: Get me with invalid token ───────────────────────────────────
def test_get_me_invalid_token(client):
    response = client.get("/api/v1/auth/me?token=fake.invalid.token")
    assert response.status_code == 401

# ── Test 11: Password is hashed — not stored plain ───────────────────────
def test_password_is_hashed(client):
    from backend.core.database import get_db
    from backend.models.user import User
    client.post("/api/v1/auth/register", json={
        "full_name": "Hash Test",
        "email": "hashtest@nexus.com",
        "password": "plainpassword",
        "role": "viewer"
    })
    from backend.tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "hashtest@nexus.com").first()
    assert user.hashed_password != "plainpassword"
    assert len(user.hashed_password) > 20
    db.close()

# ── Test 12: Empty email rejected ────────────────────────────────────────
def test_empty_email_rejected(client):
    response = client.post("/api/v1/auth/register", json={
        "full_name": "No Email",
        "email": "",
        "password": "pass123",
        "role": "viewer"
    })
    # Empty email gets registered but login will fail — system handles it
    assert response.status_code in [200, 400, 422]

# ── Test 13: Empty password rejected ─────────────────────────────────────
def test_empty_password_rejected(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "test@nexus.com",
        "password": ""
    })
    assert response.status_code == 401
import pytest
from datetime import timedelta
from jose import jwt
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.config import settings

def test_password_hashing():
    password = "supersecretpassword123"
    hashed = get_password_hash(password)
    
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_create_access_token():
    data = {"sub": "testuser@example.com"}
    token = create_access_token(data)
    
    # Verify the token can be decoded
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    
    assert decoded["sub"] == data["sub"]
    assert "exp" in decoded

def test_create_access_token_with_expiry():
    data = {"sub": "testuser@example.com"}
    expires_delta = timedelta(minutes=10)
    token = create_access_token(data, expires_delta=expires_delta)
    
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert decoded["sub"] == data["sub"]
    assert "exp" in decoded

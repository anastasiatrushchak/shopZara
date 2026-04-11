import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

@pytest.fixture
def api_client():
    """Фікстура для клієнта API"""
    return APIClient()

@pytest.fixture
def user(db):
    """Фікстура для створення тестового користувача"""
    return get_user_model().objects.create_user(
        email='testuser@example.com',
        password='password123',
        name='Test User'
    )
import pytest
from django.urls import reverse
from rest_framework import status
from core.models import Category, Product

@pytest.mark.django_db
class TestShopLogic:
    
    # Unit Test: Перевірка логіки моделі
    def test_category_creation(self):
        category = Category.objects.create(name="Електроніка")
        assert str(category) == "Електроніка"

    # Integration Test: Перевірка API перегляду продуктів
    def test_get_products_list(self, api_client, user):
        api_client.force_authenticate(user=user)
        url = reverse('product:product-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    # Integration Test: Складний сценарій (Додавання в кошик)
    def test_add_to_cart_flow(self, api_client, user):
        api_client.force_authenticate(user=user)
        cat = Category.objects.create(name="Test")
        prod = Product.objects.create(name="Тест", price=100, quantity=10, category=cat)
        
        url = reverse('product:product-add-to-cart', args=[prod.id])
        response = api_client.post(url, {'quantity': 1}, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        prod.refresh_from_db()
        assert prod.quantity == 9 # Перевірка, що склад оновився
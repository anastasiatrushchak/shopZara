from locust import HttpUser, task, between
import random

class ShopPerformanceUser(HttpUser):
    wait_time = between(1, 4)
    token = None
    headers = {}

    def on_start(self):
        """Виконується при старті кожного віртуального користувача"""
        response = self.client.post("/api/user/token/", {
            "email": "admin@example.com",
            "password": "password123"
        })
        if response.status_code == 200:
            self.token = response.json().get('token')
            self.headers = {'Authorization': f'Token {self.token}'}
        else:
            print(f"Помилка авторизації: {response.status_code}")

    @task(10)
    def view_products(self):
        """Простий перегляд списку товарів (найчастіша дія)"""
        self.client.get("/api/product/products/", headers=self.headers, name="/products/list")

    @task(5)
    def filter_and_search(self):
        """Пошук та фільтрація за категорією"""
        # Експериментуємо з фільтрами
        categories = ["All", "Electronics", "Clothing"] # Додай свої реальні категорії
        cat = random.choice(categories)
        self.client.get(f"/api/product/products/?category={cat}&sort_order=desc", 
                        headers=self.headers, 
                        name="/products/filter")

    @task(3)
    def product_detail_and_feedback(self):
        """Перегляд деталей та додавання відгуку (складний сценарій)"""
        response = self.client.get("/api/product/products/", headers=self.headers)
        if response.status_code == 200:
            results = response.json().get('results', [])
            if results:
                product_id = random.choice(results)['id']
                # 1. Дивимось деталі продукту
                self.client.get(f"/api/product/products/{product_id}/", headers=self.headers)
                
                # 2. Додаємо відгук (результат першого виклику - ID - стає входом для другого)
                self.client.post(f"/api/product/products/{product_id}/add-feedback/", {
                    "rating": 5,
                    "comment": "Чудовий товар! Тест Locust."
                }, headers=self.headers, name="/products/add-feedback")

    @task(2)
    def full_shopping_cycle(self):
        """Повний цикл: від вибору до замовлення (найскладніший сценарій)"""
        # 1. Знаходимо товар
        response = self.client.get("/api/product/products/", headers=self.headers)
        if response.status_code == 200:
            results = response.json().get('results', [])
            if results:
                product_id = results[0]['id']
                
                # 2. Додаємо в кошик
                self.client.post(f"/api/product/products/{product_id}/add-to-cart/", 
                                 {"quantity": 1}, headers=self.headers)
                
                # 3. Переглядаємо кошик (перевірка cartitems)
                cart_response = self.client.get("/api/product/cartitems/", headers=self.headers)
                
                if cart_response.status_code == 200:
                    # 4. Оформлюємо замовлення (фінальний етап)
                    self.client.post("/api/product/cartitems/place-order/", 
                                     headers=self.headers, name="/cart/place-order")

    @task(1)
    def profile_management(self):
        """Перегляд та оновлення профілю"""
        self.client.get("/api/user/me/", headers=self.headers)
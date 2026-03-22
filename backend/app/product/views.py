from django.shortcuts import render
from rest_framework import viewsets, status, mixins
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework import filters
from product import serializers
from rest_framework.decorators import action
from django.db import transaction

from drf_spectacular.utils import (
    extend_schema_view,
    extend_schema,
    OpenApiParameter,
    OpenApiTypes,
)
from core.models import Product, Category, Cart, CartItem, Order, OrderItem

@extend_schema_view(
    list=extend_schema(
        parameters=[
            OpenApiParameter(
                'category',
                OpenApiTypes.STR,
                description='Filter by items category'
            ),
            OpenApiParameter(
                'sort_field',
                OpenApiTypes.STR,
                description='Sort items by...'
            ),
            OpenApiParameter(
                'sort_order',
                OpenApiTypes.STR, enum=['asc', 'desc'],
                description='Filter by items assigned tp recipes'
            ),
        ]
    )
)
class ProductView(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    queryset = Product.objects.all()
    serializer_class = serializers.DetailProductSerializer
    filter_backends = (filters.SearchFilter,)
    search_fields = ['name'] 

    def get_serializer_class(self):
        if self.action == 'list':
            return serializers.ListProductSerializer
        elif self.action == 'add-feedback':
            return serializers.ReviewSerializer
        elif self.action == 'add-to-cart':
            return serializers.CartItemSerializer
        else:
            return self.serializer_class

    def get_queryset(self):
        # Отримання назви категорії з параметрів запиту
        category_name = self.request.query_params.get('category', None)

        # Отримання поля сортування і порядку (asc/desc) з параметрів запиту
        sort_field = self.request.query_params.get('sort_field', 'name')  # Поле за замовчуванням - 'name'
        sort_order = self.request.query_params.get('sort_order', 'asc')   # За замовчуванням - за зростанням

        # Формування порядку сортування
        if sort_order == 'desc':
            sort_field = f'-{sort_field}'  # Додаємо '-' для спаду

        # Якщо не вказано категорію, повертаємо всі продукти
        if category_name is None or category_name == 'All':
            return self.queryset.order_by(sort_field).distinct()

        # Отримання категорії за назвою
        try:
            category = Category.objects.get(name=category_name)
            return self.queryset.filter(category=category).order_by(sort_field).distinct()
        except Category.DoesNotExist:
        # Якщо категорії не існує, повертаємо порожній queryset
            return self.queryset.none()
    @extend_schema(
        request=serializers.ReviewSerializer,
        responses={201: serializers.ReviewSerializer},
    )
    @action(methods=['POST'], detail=True, url_path='add-feedback')
    def add_feedback(self, request, pk=None):
        """Add feedback to product"""
        product = self.get_object()
        
        # Додаємо product_id до даних запиту
        data = request.data.copy()
        data['product'] = product.id
        
        serializer = serializers.ReviewSerializer(data=data)  # Явно вказуємо ReviewSerializer
        
        if serializer.is_valid():
            review = serializer.save(user=self.request.user)
            return Response(
                serializers.ReviewSerializer(review).data,  
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        request=serializers.CartItemSerializer,
        responses={201: serializers.CartItemSerializer},
    )
    @action(methods=['POST'], detail=True, url_path='add-to-cart')
    def add_to_cart(self, request, pk=None):
        """Add product to cart or update quantity if product already exists"""
        product = self.get_object()
        data = request.data.copy()
        
        # Check quantity requested is a positive integer
        quantity_requested = data.get('quantity', 0)
        if quantity_requested <= 0:
            return Response("Error: Quantity must be a positive integer", status=status.HTTP_400_BAD_REQUEST)

        # Check stock availability
        if product.quantity < quantity_requested:
            return Response("Error: Insufficient stock", status=status.HTTP_400_BAD_REQUEST)

        # Use a transaction to ensure stock is updated correctly
        with transaction.atomic():
            # Get or create cart for the user
            cart, _ = Cart.objects.get_or_create(user=self.request.user)
            
            # Try to get existing cart item
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={
                    'quantity': quantity_requested
                }
            )
            
            if not created:
                # If cart item exists, update the quantity
                cart_item.quantity += quantity_requested
                cart_item.save()
            
            # Decrease the product quantity
            product.quantity -= quantity_requested
            product.save()

            return Response(
                {
                    "cart_item": serializers.Cart1ItemSerializer(cart_item).data,
                    "message": "Product added to cart successfully."
                },
                status=status.HTTP_201_CREATED
            )


class CartView(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    queryset = Cart.objects.all()
    serializer_class = serializers.ListCartSerializer

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    @action(detail=True, methods=['delete'], url_path='delete-item')
    def delete_item(self, request, pk=None):
        try:
            # Знайдемо елемент CartItem для поточного користувача
            cart_item = CartItem.objects.get(pk=pk, cart__user=self.request.user)
            cart_item.product.quantity+=cart_item.quantity
            cart_item.product.save()
            cart_item.delete()
            return Response({"detail": "Item deleted from cart."}, status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response({"detail": "Item not found in cart."}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        request=serializers.ChangeQuantitySerializer,
        responses={200: serializers.ChangeQuantitySerializer},
    )
    @action(detail=True, methods=['patch'], url_path='update-quantity')
    def update_quantity(self, request, pk=None):
        try:
            # Знаходимо CartItem для поточного користувача
            cart_item = CartItem.objects.get(pk=pk, cart__user=self.request.user)
            product = cart_item.product  # Отримуємо об'єкт продукту, пов'язаний з CartItem
            
            # Отримуємо значення для зміни кількості
            change = request.data.get('change', 0)
            try:
                change = int(change)
            except ValueError:
                return Response({"detail": "Invalid value for change. It must be an integer."},
                                status=status.HTTP_400_BAD_REQUEST)

            # Розраховуємо нову кількість в кошику
            new_quantity = cart_item.quantity + change

            # Перевірка на доступну кількість
            if new_quantity < 1:
                return Response({"detail": "Quantity cannot be less than 1."},
                                status=status.HTTP_400_BAD_REQUEST)
            elif change > product.quantity:
                return Response({"detail": "Not enough items in stock."},
                                status=status.HTTP_400_BAD_REQUEST)

            # Оновлюємо кількість, якщо перевірка пройшла успішно
            print(product.quantity)
            print(change)
            print(product.quantity - change)
            cart_item.quantity = new_quantity
            cart_item.save()
            product.quantity = product.quantity - change
            product.save()

            print("++++++++++++++++++++++++++++++")
            print(product.quantity)
            print(cart_item.quantity)

            return Response({"detail": "Quantity updated.", "new_quantity": cart_item.quantity},
                            status=status.HTTP_200_OK)
        except CartItem.DoesNotExist:
            return Response({"detail": "Item not found in cart."}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=False, methods=['delete'], url_path='clear-cart')
    def clear_cart(self, request):
        try:
            # Знаходимо кошик поточного користувача
            cart = Cart.objects.get(user=self.request.user)
            cart_items = cart.items.all()  # Отримуємо всі елементи в кошику

            # Повертаємо кількість товарів для кожного елемента в кошику
            for cart_item in cart_items:
                product = cart_item.product
                product.quantity += cart_item.quantity  # Повертаємо кількість у склад
                product.save()

            # Видаляємо всі елементи з кошика
            cart_items.delete()

            return Response({"detail": "Cart cleared successfully."},
                            status=status.HTTP_204_NO_CONTENT)
        except Cart.DoesNotExist:
            return Response({"detail": "Cart not found."},
                            status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=False, methods=['post'], url_path='place-order')
    def place_order(self, request):
        try:
            # Отримуємо кошик користувача
            cart = Cart.objects.get(user=self.request.user)
            cart_items = cart.items.all()
            
            if not cart_items.exists():
                return Response({"detail": "Your cart is empty."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Розраховуємо загальну суму
            items_price=[]
            total_price=0
            for item in cart_items:
                if item.product.discount > 0:
                    if item.product.discount_type == 'percentage':
                        price = item.product.price * (1 - item.product.discount / 100)
                    else:
                        price = item.product.price - item.product.discount
                else:   
                    price = item.product.price
                items_price.append(price)
                total_price = total_price + (price * item.quantity)
            
            
            # Створюємо замовлення
            order = Order.objects.create(
                user=self.request.user,
                total_price=total_price,
                status='pending'
            )
            
            # Створюємо елементи замовлення
            order_items = []
            for i in range (cart_items.count()):
                order_item = OrderItem(
                    order=order,
                    product=cart_items[i].product,
                    quantity=cart_items[i].quantity,
                    price=items_price[i]
                )
                order_items.append(order_item)
            OrderItem.objects.bulk_create(order_items)
            
            # Очищуємо кошик
            cart_items.delete()
            
            return Response({"detail": "Order placed successfully.", "order_id": order.id},
                            status=status.HTTP_201_CREATED)
        
        except Cart.DoesNotExist:
            return Response({"detail": "Cart not found."}, status=status.HTTP_404_NOT_FOUND)
        
    
class CategoryView(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer
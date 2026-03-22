from rest_framework import serializers
from core.models import Product, Category, Review, Cart, CartItem

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']
        read_only_fields = ['id', 'name']

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'rating', 'comment', 'product', 'created_at']
        read_only_fields = ['id', 'created_at']

class ProductReviewSerializer(serializers.ModelSerializer):
    """Serializer для відображення відгуків у продукті"""
    class Meta:
        model = Review
        fields = ['id', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']



class ListProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'discount', 'category', 'quantity', 'image', 'discount_type']
        read_only_fields = ['id', 'name', 'price', 'discount', 'category', 'quantity', 'image', 'discount_type']

class DetailProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    reviews = ProductReviewSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = ListProductSerializer.Meta.fields + ['description', 'reviews']
        read_only_fields = ['id', 'name', 'price', 'discount', 'category', 'description', 'reviews']


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'quantity', 'category', 'discount', 'discount_type', 'created_at', 'updated_at', 'image']

class Cart1ItemSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CartItem
        fields = ['id', 'quantity', 'product']
        read_only_fields = ['id']

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    class Meta:
        model = CartItem
        fields = ['id', 'quantity', 'product']
        read_only_fields = ['id']


class ListCartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)  # Змінено ім'я на items

    class Meta:
        model = Cart
        fields = ['id', 'items']

class ChangeQuantitySerializer(serializers.Serializer):
    change = serializers.IntegerField(help_text="The amount to change the quantity by.")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['name']
        read_only_fields = ['name']
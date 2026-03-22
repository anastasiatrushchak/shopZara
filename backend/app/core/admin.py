from django.contrib import admin
from .models import User, Category, Product, Review, Order, OrderItem, Cart, CartItem

class UserAdmin(admin.ModelAdmin):
    """Admin panel for User management."""
    list_display = ['email', 'name', 'phone_number', 'address', 'is_active', 'is_staff', 'created_at', 'updated_at']
    list_filter = ['is_active', 'is_staff']
    search_fields = ['email', 'name']
    ordering = ['email']

class CategoryAdmin(admin.ModelAdmin):
    """Admin panel for Category management."""
    list_display = ['name']
    search_fields = ['name']

class ProductAdmin(admin.ModelAdmin):
    """Admin panel for Product management."""
    list_display = ['name', 'price', 'quantity', 'category', 'discount', 'discount_type', 'created_at', 'updated_at']
    list_filter = ['category', 'discount_type']
    search_fields = ['name', 'description']
    ordering = ['name']

class ReviewAdmin(admin.ModelAdmin):
    """Admin panel for Review management."""
    list_display = ['user', 'product', 'rating', 'created_at']
    list_filter = ['rating']
    search_fields = ['user__email', 'product__name']
    ordering = ['created_at']

class OrderItemAdmin(admin.TabularInline):
    """Inline admin for OrderItems."""
    model = OrderItem
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    """Admin panel for Order management."""
    list_display = ['id', 'user', 'user_address', 'status', 'total_price', 'created_at']  # Додано user_address
    list_filter = ['status', 'created_at']
    search_fields = ['user__email']
    ordering = ['created_at']
    inlines = [OrderItemAdmin]  # Додаємо OrderItemAdmin як інлайн

    def user_address(self, obj):
        return obj.user.address  # Відображаємо адресу користувача

    user_address.short_description = 'User Address'  # Заголовок стовпця

class CartAdmin(admin.ModelAdmin):
    """Admin panel for Cart management."""
    list_display = ['user']
    search_fields = ['user__email']
    
class CartItemAdmin(admin.TabularInline):
    """Inline admin for CartItems."""
    model = CartItem
    extra = 0

# Registering models with the admin site
admin.site.register(User, UserAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Review, ReviewAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(Cart, CartAdmin)

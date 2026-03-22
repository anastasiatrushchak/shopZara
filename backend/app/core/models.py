from django.conf import settings
from django import db
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
import uuid
import os 


def recipe_image_file_path(instance, filename):
    """Generate file path for new recipe image"""
    ext = os.path.splitext(filename)[1]
    filename = f'{uuid.uuid4()}{ext}'
    return os.path.join('uploads', 'recipe', filename)


class UserManager(BaseUserManager):
    """Manager for users."""

    def create_user(self, email, password=None, **extra_fields):
        """Create, save and return a new user."""
        if not email:
            raise ValueError('User must have an email address.')
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password):
        """Create and return a new superuser."""
        user = self.create_user(email, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    """User in the system."""
    email = db.models.EmailField(max_length=255, unique=True)
    name = db.models.CharField(max_length=255)
    phone_number = db.models.CharField(max_length=15, blank=True, null=True)
    address = db.models.CharField(max_length=255, blank=True, null=True)
    created_at = db.models.DateTimeField(auto_now_add=True)
    updated_at = db.models.DateTimeField(auto_now=True)
    is_active = db.models.BooleanField(default=True)
    is_staff = db.models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'

    def __str__(self):
        return self.email
    

class Category(db.models.Model):
    """Category product"""
    name = db.models.CharField(max_length=255)

    def __str__(self):
        return self.name





class Product(db.models.Model):
    """Product item"""
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]
    name = db.models.CharField(max_length=255)
    description = db.models.TextField(blank=True)
    price = db.models.DecimalField(max_digits=10, decimal_places=2)
    quantity = db.models.IntegerField()
    category = db.models.ForeignKey(Category, on_delete=db.models.CASCADE)
    discount = db.models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_type = db.models.CharField(max_length=10, choices=DISCOUNT_TYPE_CHOICES, default='percentage')
    created_at = db.models.DateTimeField(auto_now_add=True)
    updated_at = db.models.DateTimeField(auto_now=True)
    image = db.models.ImageField(null=True, upload_to=recipe_image_file_path)
    
    def __str__(self):
        return self.name

class Review(db.models.Model):
    """Review model"""
    user = db.models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=db.models.CASCADE,
        related_name='reviews'
    )
    product = db.models.ForeignKey(
        Product,
        on_delete=db.models.CASCADE,
        related_name='reviews'
    )
    rating = db.models.IntegerField()
    comment = db.models.TextField()
    created_at = db.models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.product.name} by {self.user.email}"

class Order(db.models.Model):
    """Order"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    ]
    status = db.models.CharField(
        max_length=255,
        choices=STATUS_CHOICES,
        default='pending',
    )
    total_price = db.models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = db.models.DateTimeField(auto_now_add=True)
    user = db.models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=db.models.CASCADE,
    )

    def __str__(self):
        return "Order"
    


class OrderItem(db.models.Model):
    """Order item"""
    order = db.models.ForeignKey(Order, on_delete=db.models.CASCADE)
    product = db.models.ForeignKey(Product, on_delete=db.models.CASCADE)
    quantity = db.models.IntegerField()
    price = db.models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return "Order item"
    


class Cart(db.models.Model):
    """Cart"""
    user = db.models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=db.models.CASCADE,
    )

    def __str__(self):
        return f'{self.user}'


class CartItem(db.models.Model):
    """Cart item"""
    cart = db.models.ForeignKey(Cart, on_delete=db.models.CASCADE, related_name='items')  # Змінено related_name
    product = db.models.ForeignKey(
        Product,
        on_delete=db.models.CASCADE,
        related_name='cartitems'
    )
    quantity = db.models.IntegerField()

    def __str__(self):
        return f'{self.product}'

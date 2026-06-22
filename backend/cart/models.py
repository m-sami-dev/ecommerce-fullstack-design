from django.conf import settings
from django.db import models
from django.utils import timezone
from products.models import Product


class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed amount'),
    ]
    code = models.CharField(max_length=30, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE_CHOICES, default='fixed')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.code

    def is_valid(self):
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return True


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    coupon = models.ForeignKey(Coupon, null=True, blank=True, on_delete=models.SET_NULL, related_name='carts')
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def active_items(self):
        return self.items.filter(saved_for_later=False)

    @property
    def saved_items(self):
        return self.items.filter(saved_for_later=True)

    @property
    def subtotal(self):
        return sum((item.subtotal for item in self.active_items), 0)

    @property
    def discount_amount(self):
        if not self.coupon or not self.coupon.is_valid():
            return 0
        if self.coupon.discount_type == 'percentage':
            return self.subtotal * (self.coupon.discount_value / 100)
        return min(self.coupon.discount_value, self.subtotal)

    @property
    def total(self):
        return self.subtotal - self.discount_amount

    def __str__(self):
        return f"Cart #{self.id} ({self.user})"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    saved_for_later = models.BooleanField(default=False)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('cart', 'product')

    @property
    def subtotal(self):
        return self.product.price * self.quantity

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'saved_for_later', 'subtotal']

    def get_subtotal(self, obj):
        return obj.subtotal


class CartSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    saved_items = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()
    discount_amount = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    coupon_code = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id', 'items', 'saved_items', 'subtotal',
            'discount_amount', 'total', 'total_items', 'coupon_code',
        ]

    def get_items(self, obj):
        return CartItemSerializer(obj.active_items, many=True).data

    def get_saved_items(self, obj):
        return CartItemSerializer(obj.saved_items, many=True).data

    def get_subtotal(self, obj):
        return obj.subtotal

    def get_discount_amount(self, obj):
        return obj.discount_amount

    def get_total(self, obj):
        return obj.total

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.active_items)

    def get_coupon_code(self, obj):
        return obj.coupon.code if obj.coupon else None
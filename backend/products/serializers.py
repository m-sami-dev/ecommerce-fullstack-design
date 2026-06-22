from rest_framework import serializers
from .models import (
    Category, Product, Wishlist, Inquiry,
    Brand, Feature, Supplier, PriceTier,
)


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'product_count']


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug']


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ['id', 'name']


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'avatar_letter', 'city', 'country',
            'country_flag_emoji', 'is_verified', 'worldwide_shipping',
        ]


class PriceTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceTier
        fields = ['id', 'min_qty', 'max_qty', 'price']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    category_slug = serializers.CharField(source='category.slug', read_only=True, default=None)
    brand_name = serializers.CharField(source='brand.name', read_only=True, default=None)
    brand_slug = serializers.CharField(source='brand.slug', read_only=True, default=None)
    supplier_detail = SupplierSerializer(source='supplier', read_only=True)
    in_stock = serializers.SerializerMethodField()
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    features = FeatureSerializer(many=True, read_only=True)
    feature_ids = serializers.PrimaryKeyRelatedField(
        source='features', queryset=Feature.objects.all(), many=True, write_only=True, required=False,
    )
    price_tiers = PriceTierSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'category_name', 'category_slug',
            'brand', 'brand_name', 'brand_slug', 'supplier', 'supplier_detail',
            'price', 'old_price', 'description', 'image', 'stock', 'rating',
            'reviews_count', 'is_featured', 'in_stock', 'created_at',
            'condition', 'condition_display', 'features', 'feature_ids',
            'material', 'design', 'customization', 'protection_policy', 'warranty',
            'model_number', 'style', 'certificate', 'size_spec', 'memory_spec',
            'min_order_qty', 'sold_count', 'price_tiers',
        ]
        read_only_fields = ['slug', 'created_at']

    def get_in_stock(self, obj):
        return obj.stock > 0


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'created_at']


class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = ['id', 'product', 'item_name', 'quantity', 'unit', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']
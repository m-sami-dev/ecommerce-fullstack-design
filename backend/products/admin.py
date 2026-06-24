from django.contrib import admin
from .models import Category, Product, Brand, Feature, Supplier, PriceTier, Wishlist, Inquiry, ProductImage


class PriceTierInline(admin.TabularInline):
    model = PriceTier
    extra = 1

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ['name']


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'country', 'is_verified', 'worldwide_shipping']
    list_filter = ['is_verified', 'worldwide_shipping']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'brand', 'price', 'stock', 'condition', 'is_featured', 'created_at']
    list_filter = ['category', 'brand', 'condition', 'is_featured']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    filter_horizontal = ['features']
    inlines = [PriceTierInline, ProductImageInline]


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'quantity', 'unit', 'created_at', 'is_read']
    list_filter = ['is_read']
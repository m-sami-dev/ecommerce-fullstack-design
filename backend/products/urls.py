from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, CategoryViewSet, BrandViewSet, FeatureViewSet,
    WishlistListView, WishlistToggleView, InquiryCreateView,
    ProductImageUploadView, ProductImageDeleteView,
)

router = DefaultRouter()
router.register('products', ProductViewSet, basename='product')
router.register('categories', CategoryViewSet, basename='category')
router.register('brands', BrandViewSet, basename='brand')
router.register('features', FeatureViewSet, basename='feature')

urlpatterns = router.urls + [
    path('wishlist/', WishlistListView.as_view(), name='wishlist-list'),
    path('wishlist/toggle/', WishlistToggleView.as_view(), name='wishlist-toggle'),
    path('inquiries/', InquiryCreateView.as_view(), name='inquiry-create'),
    path('products/<int:product_id>/images/', ProductImageUploadView.as_view(), name='product-image-upload'),
    path('product-images/<int:image_id>/', ProductImageDeleteView.as_view(), name='product-image-delete'),
]
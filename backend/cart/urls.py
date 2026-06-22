from django.urls import path
from .views import (
    CartDetailView, CartAddItemView, CartUpdateItemView,
    CartRemoveItemView, CartClearView,
    CartSaveForLaterView, CartMoveToCartView,
    CartApplyCouponView, CartRemoveCouponView,
)

urlpatterns = [
    path('', CartDetailView.as_view(), name='cart-detail'),
    path('add/', CartAddItemView.as_view(), name='cart-add'),
    path('items/<int:item_id>/', CartUpdateItemView.as_view(), name='cart-item-update'),
    path('items/<int:item_id>/remove/', CartRemoveItemView.as_view(), name='cart-item-remove'),
    path('items/<int:item_id>/save/', CartSaveForLaterView.as_view(), name='cart-item-save'),
    path('items/<int:item_id>/move-to-cart/', CartMoveToCartView.as_view(), name='cart-item-move-to-cart'),
    path('clear/', CartClearView.as_view(), name='cart-clear'),
    path('apply-coupon/', CartApplyCouponView.as_view(), name='cart-apply-coupon'),
    path('remove-coupon/', CartRemoveCouponView.as_view(), name='cart-remove-coupon'),
]
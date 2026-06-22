from django.shortcuts import get_object_or_404
from rest_framework import viewsets, filters, generics
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Product, Wishlist, Inquiry, Brand, Feature
from .serializers import (
    CategorySerializer, ProductSerializer,
    WishlistSerializer, InquirySerializer,
    BrandSerializer, FeatureSerializer,
)
from .filters import ProductFilter
from .permissions import IsAdminOrReadOnly


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer


class FeatureViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = (
        Product.objects.select_related('category', 'brand', 'supplier')
        .prefetch_related('features', 'price_tiers')
        .all()
    )
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'category__name', 'brand__name']
    ordering_fields = ['price', 'created_at', 'rating', 'name', 'sold_count']
    lookup_field = 'slug'

    @action(detail=False, methods=['get'])
    def featured(self, request):
        qs = self.filter_queryset(self.get_queryset().filter(is_featured=True))[:8]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class WishlistListView(generics.ListAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('product')


class WishlistToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        product = get_object_or_404(Product, id=product_id)
        existing = Wishlist.objects.filter(user=request.user, product=product).first()
        if existing:
            existing.delete()
            return Response({'wishlisted': False})
        Wishlist.objects.create(user=request.user, product=product)
        return Response({'wishlisted': True})


class InquiryCreateView(generics.CreateAPIView):
    serializer_class = InquirySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
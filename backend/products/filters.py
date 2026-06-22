import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name='category__slug', lookup_expr='iexact')
    brand = django_filters.CharFilter(method='filter_brand')
    supplier = django_filters.NumberFilter(field_name='supplier__id')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    condition = django_filters.CharFilter(field_name='condition', lookup_expr='iexact')
    min_rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    feature = django_filters.CharFilter(method='filter_feature')
    verified_only = django_filters.BooleanFilter(method='filter_verified')

    class Meta:
        model = Product
        fields = ['category', 'brand', 'min_price', 'max_price', 'in_stock', 'condition', 'min_rating']

    def filter_in_stock(self, queryset, name, value):
        return queryset.filter(stock__gt=0) if value else queryset.filter(stock=0)

    def filter_brand(self, queryset, name, value):
        # Accepts comma-separated brand slugs, e.g. "samsung,apple,poco"
        slugs = [v for v in value.split(',') if v]
        return queryset.filter(brand__slug__in=slugs).distinct() if slugs else queryset

    def filter_feature(self, queryset, name, value):
        # Accepts comma-separated feature ids, e.g. "1,3"
        ids = [v for v in value.split(',') if v.isdigit()]
        return queryset.filter(features__id__in=ids).distinct() if ids else queryset

    def filter_verified(self, queryset, name, value):
        return queryset.filter(supplier__is_verified=True) if value else queryset
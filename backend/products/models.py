from django.db import models
from django.utils.text import slugify
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        verbose_name_plural = 'categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Feature(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Supplier(models.Model):
    name = models.CharField(max_length=150)
    avatar_letter = models.CharField(max_length=2, blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    country_flag_emoji = models.CharField(max_length=10, blank=True)
    is_verified = models.BooleanField(default=False)
    worldwide_shipping = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    
    

class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    category = models.ForeignKey(
        Category, related_name='products', on_delete=models.SET_NULL,
        null=True, blank=True,
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True)
    image = models.URLField(max_length=500, blank=True)
    stock = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    reviews_count = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    CONDITION_CHOICES = [
        ('any', 'Any'),
        ('refurbished', 'Refurbished'),
        ('brand_new', 'Brand new'),
        ('old', 'Old items'),
    ]

    brand = models.ForeignKey(Brand, related_name='products', on_delete=models.SET_NULL, null=True, blank=True)
    supplier = models.ForeignKey(Supplier, related_name='products', on_delete=models.SET_NULL, null=True, blank=True)
    features = models.ManyToManyField(Feature, related_name='products', blank=True)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='brand_new')

    material = models.CharField(max_length=150, blank=True)
    design = models.CharField(max_length=150, blank=True)
    customization = models.CharField(max_length=200, blank=True)
    protection_policy = models.CharField(max_length=150, blank=True)
    warranty = models.CharField(max_length=100, blank=True)
    model_number = models.CharField(max_length=100, blank=True)
    style = models.CharField(max_length=100, blank=True)
    certificate = models.CharField(max_length=100, blank=True)
    size_spec = models.CharField(max_length=100, blank=True)
    memory_spec = models.CharField(max_length=100, blank=True)
    min_order_qty = models.PositiveIntegerField(default=1)
    sold_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class PriceTier(models.Model):
    """Quantity-based wholesale pricing — e.g. 50-100 pcs = $90, 700+ pcs = $78."""
    product = models.ForeignKey(Product, related_name='price_tiers', on_delete=models.CASCADE)
    min_qty = models.PositiveIntegerField()
    max_qty = models.PositiveIntegerField(null=True, blank=True)  # blank = no upper limit ("700+")
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ['min_qty']

    def __str__(self):
        upper = f"-{self.max_qty}" if self.max_qty else "+"
        return f"{self.product.name}: {self.min_qty}{upper} pcs @ ${self.price}"
    
class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user} - {self.product}"

class Inquiry(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inquiries', null=True, blank=True)
    item_name = models.CharField(max_length=200, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='inquiries')
    quantity = models.PositiveIntegerField(null=True, blank=True)
    unit = models.CharField(max_length=20, default='Pcs')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        target = self.product.name if self.product else (self.item_name or 'General inquiry')
        return f"Inquiry for {target} by {self.user}"
    
    
class ProductImage(models.Model):
    """Extra uploaded images for a product, shown as a gallery/thumbnail strip."""
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/gallery/')
    order = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Image for {self.product.name}"
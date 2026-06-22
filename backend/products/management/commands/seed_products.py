from django.core.management.base import BaseCommand
from products.models import Category, Product, Brand, Feature, Supplier, PriceTier

CATEGORIES = ['Electronics', 'Mobile Accessory', 'Clothing', 'Home & Outdoor', 'Sports & Outdoor']
BRANDS = ['Samsung', 'Apple', 'Huawei', 'Poco', 'Lenovo']
FEATURES = ['Metallic', 'Plastic cover', '8GB Ram', 'Super power', 'Large Memory']

SUPPLIERS = [
    {'name': 'Guanjoi Trading LLC', 'avatar_letter': 'G', 'city': 'Berlin', 'country': 'Germany',
     'country_flag_emoji': '🇩🇪', 'is_verified': True, 'worldwide_shipping': True},
    {'name': 'Artel Market', 'avatar_letter': 'A', 'city': 'Istanbul', 'country': 'Turkey',
     'country_flag_emoji': '🇹🇷', 'is_verified': True, 'worldwide_shipping': False},
    {'name': 'Best Factory LLC', 'avatar_letter': 'B', 'city': 'Shenzhen', 'country': 'China',
     'country_flag_emoji': '🇨🇳', 'is_verified': False, 'worldwide_shipping': True},
]

PRODUCTS = [
    {'name': 'Wireless Over-Ear Headphones', 'category': 'Electronics', 'price': 59.99, 'old_price': 79.99,
     'stock': 35, 'rating': 4.5, 'reviews_count': 154, 'is_featured': True,
     'description': 'Noise-cancelling wireless headphones with a 30-hour battery and deep bass.'},
    {'name': 'Smartwatch Fitness Tracker', 'category': 'Electronics', 'price': 89.50, 'old_price': 112.80,
     'stock': 42, 'rating': 4.2, 'reviews_count': 98, 'is_featured': True,
     'description': 'Track heart rate, sleep and workouts with a week-long battery life.'},
    {'name': 'Canon EOS 2000 DSLR Camera', 'category': 'Electronics', 'price': 498.00, 'old_price': 560.00,
     'stock': 12, 'rating': 4.7, 'reviews_count': 76, 'is_featured': True,
     'description': '10x zoom DSLR camera, great for travel and everyday photography.'},
    {'name': 'GoPro HERO6 4K Action Camera', 'category': 'Electronics', 'price': 99.50, 'old_price': 128.00,
     'stock': 20, 'rating': 4.4, 'reviews_count': 154, 'is_featured': True,
     'description': '4K action camera with image stabilization, waterproof up to 10m.'},
    {'name': 'Slim Aluminium Laptop 14"', 'category': 'Electronics', 'price': 699.00, 'old_price': 799.00,
     'stock': 8, 'rating': 4.6, 'reviews_count': 64,
     'description': 'Lightweight aluminium-body laptop with all-day battery life.'},
    {'name': 'Smart Coffee Maker', 'category': 'Home & Outdoor', 'price': 64.00, 'old_price': 78.00,
     'stock': 25, 'rating': 4.1, 'reviews_count': 41,
     'description': 'Programmable coffee maker with a thermal carafe that keeps coffee hot for hours.'},
    {'name': 'Ceramic Stand Mixer', 'category': 'Home & Outdoor', 'price': 120.00, 'old_price': 145.00,
     'stock': 15, 'rating': 4.3, 'reviews_count': 29,
     'description': 'Compact stand mixer for everyday baking, with three mixing speeds.'},
    {'name': 'Soft Indoor Sofa Chair', 'category': 'Home & Outdoor', 'price': 210.00, 'old_price': None,
     'stock': 6, 'rating': 4.0, 'reviews_count': 18,
     'description': 'A cozy single-seat sofa chair with a soft linen finish.'},
    {'name': 'Ceramic Table Lamp', 'category': 'Home & Outdoor', 'price': 34.00, 'old_price': None,
     'stock': 30, 'rating': 4.2, 'reviews_count': 22,
     'description': 'Warm ambient table lamp with a handmade ceramic base.'},
    {'name': 'Mens Long Sleeve Cotton T-Shirt', 'category': 'Clothing', 'price': 24.00, 'old_price': 32.00,
     'stock': 60, 'rating': 4.0, 'reviews_count': 32,
     'description': 'Slim-fit, soft cotton base layer t-shirt, available in multiple colors.'},
    {'name': 'Denim Casual Shorts', 'category': 'Clothing', 'price': 28.00, 'old_price': None,
     'stock': 50, 'rating': 3.9, 'reviews_count': 27,
     'description': 'Classic denim shorts with a comfortable mid-rise fit.'},
    {'name': 'Mens Blazer Set Elegant Formal', 'category': 'Clothing', 'price': 79.00, 'old_price': 99.50,
     'stock': 18, 'rating': 4.3, 'reviews_count': 19,
     'description': 'A two-piece formal blazer set, tailored for a sharp silhouette.'},
    {'name': 'Leather Bifold Wallet', 'category': 'Clothing', 'price': 34.00, 'old_price': None,
     'stock': 70, 'rating': 4.4, 'reviews_count': 53,
     'description': 'Genuine leather bifold wallet with six card slots and a coin pocket.'},
    {'name': 'Travel Backpack 30L', 'category': 'Sports & Outdoor', 'price': 69.00, 'old_price': 84.00,
     'stock': 40, 'rating': 4.5, 'reviews_count': 61,
     'description': 'Water-resistant 30L backpack with a padded laptop sleeve.'},
    {'name': 'Insulated Travel Mug', 'category': 'Sports & Outdoor', 'price': 19.00, 'old_price': None,
     'stock': 80, 'rating': 4.1, 'reviews_count': 38,
     'description': 'Double-walled stainless steel mug that keeps drinks hot for 8 hours.'},
    {'name': 'Basketball Crew Socks (3-Pack)', 'category': 'Sports & Outdoor', 'price': 12.00, 'old_price': None,
     'stock': 90, 'rating': 4.0, 'reviews_count': 12,
     'description': 'Breathable cushioned crew socks, sold as a pack of three.'},
    {'name': 'Smartphone 6.5" 128GB', 'category': 'Mobile Accessory', 'price': 399.00, 'old_price': 449.00,
     'stock': 22, 'rating': 4.3, 'reviews_count': 87, 'is_featured': True,
     'description': 'A 6.5 inch display smartphone with a triple camera and 128GB storage.'},
    {'name': 'Tablet 10.5" 64GB', 'category': 'Mobile Accessory', 'price': 289.00, 'old_price': 320.00,
     'stock': 14, 'rating': 4.2, 'reviews_count': 45,
     'description': 'Slim 10.5 inch tablet, perfect for media and light productivity.'},
    {'name': 'Fast Wireless Charger Pad', 'category': 'Mobile Accessory', 'price': 22.00, 'old_price': None,
     'stock': 65, 'rating': 4.0, 'reviews_count': 33,
     'description': '15W fast wireless charging pad compatible with most phones.'},
    {'name': 'Protective Phone Case', 'category': 'Mobile Accessory', 'price': 9.00, 'old_price': None,
     'stock': 120, 'rating': 3.8, 'reviews_count': 16,
     'description': 'Shockproof phone case with raised edges to protect the screen.'},
]

CONDITIONS = ['brand_new', 'brand_new', 'brand_new', 'refurbished', 'old']

SPECS = {
    'material': 'Premium mixed materials',
    'design': 'Modern, ergonomic design',
    'customization': 'Custom logo and packaging available',
    'protection_policy': 'Refund policy',
    'warranty': '1 year warranty',
    'style': 'Classic style',
    'certificate': 'ISO-898921212',
    'size_spec': '34mm x 450mm x 19mm',
    'memory_spec': '-',
}


class Command(BaseCommand):
    help = 'Seed categories, brands, suppliers, features and products for development'

    def handle(self, *args, **options):
        category_objs = {name: Category.objects.get_or_create(name=name)[0] for name in CATEGORIES}
        brand_objs = {name: Brand.objects.get_or_create(name=name)[0] for name in BRANDS}
        feature_objs = {name: Feature.objects.get_or_create(name=name)[0] for name in FEATURES}

        supplier_objs = []
        for s in SUPPLIERS:
            supplier, _ = Supplier.objects.get_or_create(name=s['name'], defaults=s)
            supplier_objs.append(supplier)

        for i, item in enumerate(PRODUCTS):
            category = category_objs[item['category']]
            is_tech = item['category'] in ('Electronics', 'Mobile Accessory')
            brand = brand_objs[BRANDS[i % len(BRANDS)]] if is_tech else None
            supplier = supplier_objs[i % len(supplier_objs)]
            condition = CONDITIONS[i % len(CONDITIONS)]

            product, _ = Product.objects.update_or_create(
                name=item['name'],
                defaults={
                    'category': category,
                    'brand': brand,
                    'supplier': supplier,
                    'price': item['price'],
                    'old_price': item.get('old_price'),
                    'description': item['description'],
                    'image': f'https://picsum.photos/seed/shopitem{i}/600/600',
                    'stock': item['stock'],
                    'rating': item['rating'],
                    'reviews_count': item['reviews_count'],
                    'is_featured': item.get('is_featured', False),
                    'condition': condition,
                    'material': SPECS['material'],
                    'design': SPECS['design'],
                    'customization': SPECS['customization'],
                    'protection_policy': SPECS['protection_policy'],
                    'warranty': SPECS['warranty'],
                    'model_number': f'#{1000 + i}',
                    'style': SPECS['style'],
                    'certificate': SPECS['certificate'],
                    'size_spec': SPECS['size_spec'],
                    'memory_spec': SPECS['memory_spec'],
                    'min_order_qty': 50,
                    'sold_count': item['reviews_count'] * 4,
                },
            )

            if is_tech:
                product.features.set([
                    feature_objs[FEATURES[i % len(FEATURES)]],
                    feature_objs[FEATURES[(i + 1) % len(FEATURES)]],
                ])
            else:
                product.features.clear()

            base_price = item['price']
            PriceTier.objects.filter(product=product).delete()
            PriceTier.objects.create(product=product, min_qty=50, max_qty=99, price=round(base_price * 1.15, 2))
            PriceTier.objects.create(product=product, min_qty=100, max_qty=699, price=round(base_price * 1.0, 2))
            PriceTier.objects.create(product=product, min_qty=700, max_qty=None, price=round(base_price * 0.85, 2))

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {len(PRODUCTS)} products, {len(BRANDS)} brands, '
            f'{len(SUPPLIERS)} suppliers, {len(FEATURES)} features, with price tiers.'
        ))
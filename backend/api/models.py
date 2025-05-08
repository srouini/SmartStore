import random
import string
from django.db import models
from django.contrib.auth.models import User

# --- Code Generation Function ---
def generate_unique_product_code():
    """
    Generates a unique 4-character code for a product.
    Codes are generated in uppercase and exclude visually similar characters.
    """
    # Define characters to use, excluding visually similar ones (0, O, 1, l, I)
    # Using uppercase only here since we will store codes in uppercase
    allowed_chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
    code_length = 4

    while True:
        code = ''.join(random.choice(allowed_chars) for _ in range(code_length))
        # Check if a product with this code already exists (comparison is case-sensitive in DB,
        # but since we only store uppercase, this effectively checks for uniqueness)
        if not Product.objects.filter(code=code).exists():
            return code

# --- Brand Model ---
class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    origin_country = models.CharField(max_length=100, blank=True, null=True)
    picture = models.ImageField(upload_to='brand_pictures/', blank=True, null=True) # Field for brand logo/picture
    description = models.TextField(blank=True, null=True) # Added description for brand
    website = models.URLField(max_length=200, blank=True, null=True) # Added website field

    def __str__(self):
        return self.name

# --- Model Model ---
class Model(models.Model):
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='models')
    name = models.CharField(max_length=100) # e.g., "iPhone 13 Pro", "Galaxy S22 Ultra"
    description = models.TextField(blank=True, null=True) # Added description for model
    release_date = models.DateField(blank=True, null=True) # Added release date

    class Meta:
        unique_together = ('brand', 'name') # A brand can't have two models with the same name

    def __str__(self):
        return f"{self.brand.name} - {self.name}"

# --- Product (Base Class - Concrete Inheritance) ---
class Product(models.Model):
    name = models.CharField(max_length=255, unique=True) # e.g., "iPhone 13 Pro 256GB Blue Global", "Samsung 65W USB-C Charger White"
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='all_products') # Link to Brand for all products
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    # Replaced selling_price with specific price fields
    selling_unite_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_semi_bulk_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True) # Optional for items not sold in semi-bulk
    selling_bulk_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True) # Optional for items not sold in bulk

    description = models.TextField(blank=True, null=True) # Description for the specific product variant
    note = models.TextField(blank=True, null=True) # Added a general note field for any product
    photo = models.ImageField(upload_to='product_photos/', blank=True, null=True) # Added photo field for the product
    created_at = models.DateTimeField(auto_now_add=True) # Added creation timestamp
    updated_at = models.DateTimeField(auto_now=True) # Added update timestamp

    # Added the 4-character code field
    # Storing in uppercase for case-insensitive lookup
    code = models.CharField(max_length=4, unique=True, blank=True, null=True)

    PRODUCT_TYPES = (
        ('phone', 'Phone'),
        ('accessory', 'Accessory'),
    )
    product_type = models.CharField(max_length=50, choices=PRODUCT_TYPES, editable=False) # Set automatically by child classes

    def save(self, *args, **kwargs):
        # Convert code to uppercase if it exists and is not already uppercase
        if self.code and not self.code.isupper():
            self.code = self.code.upper()
        # Generate code if it's not already set
        elif not self.code:
             self.code = generate_unique_product_code()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.code})" # Include code in string representation

# --- Phone (Child Class) ---
class Phone(Product):
    model = models.ForeignKey(Model, on_delete=models.CASCADE, related_name='phones') # Link to Model
    processor = models.CharField(max_length=100, blank=True, null=True)
    ram_gb = models.PositiveIntegerField(blank=True, null=True)
    storage_gb = models.PositiveIntegerField(blank=True, null=True)
    screen_size_inch = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)

    SCREEN_TYPE_CHOICES = (
        ('oled', 'OLED'),
        ('amoled', 'AMOLED'),
        ('lcd', 'LCD'),
        ('ips_lcd', 'IPS LCD'),
        ('retina', 'Retina'), # Apple specific, but common term
        ('dynamic_amoled', 'Dynamic AMOLED'), # Samsung specific
        ('other', 'Other'),
    )
    screen_type = models.CharField(max_length=50, choices=SCREEN_TYPE_CHOICES, blank=True, null=True)

    operating_system = models.CharField(max_length=50, blank=True, null=True)
    rear_camera_mp = models.CharField(max_length=100, blank=True, null=True) # e.g., "12MP + 12MP + 12MP"
    front_camera_mp = models.CharField(max_length=100, blank=True, null=True)
    battery_mah = models.PositiveIntegerField(blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True) # Added color for phone variants

    CONDITION_CHOICES = (
        ('new', 'New'),
        ('used', 'Used'),
        ('refurbished', 'Refurbished'),
        ('open_box', 'Open Box'),
    )
    condition = models.CharField(max_length=50, choices=CONDITION_CHOICES, default='new')

    VERSION_CHOICES = (
        ('global', 'Global'),
        ('chinese', 'Chinese'),
        ('indian', 'Indian'),
        ('european', 'European'),
        ('us', 'US'),
        ('other', 'Other'),
    )
    version = models.CharField(max_length=50, choices=VERSION_CHOICES, default='global')

    PHONE_TYPE_CHOICES = (
        ('ordinary', 'Ordinary'),
        ('foldable', 'Foldable'),
        ('flip', 'Flip'),
        ('tablet', 'Tablet'), # Can include tablets if they are part of the inventory
        ('gaming', 'Gaming Phone'),
        ('rugged', 'Rugged Phone'),
        ('other', 'Other'),
    )
    phone_type = models.CharField(max_length=50, choices=PHONE_TYPE_CHOICES, default='ordinary')


    # Add other phone-specific specs as needed

    def save(self, *args, **kwargs):
        self.product_type = 'phone' # Set the type automatically
        # Code generation and case conversion is handled in the base Product's save method
        super().save(*args, **kwargs)

    def __str__(self):
        # Include code from the base Product model and new fields
        return f"Phone: {self.name} ({self.code}) ({self.get_condition_display()}) - {self.get_version_display()} - {self.get_phone_type_display()}"

# --- Accessory (Child Class) ---
class Accessory(Product):
    ACCESSORY_CATEGORIES = (
        ('case', 'Phone Case'),
        ('charger', 'Charger'),
        ('wired_headphones', 'Wired Headphones'),
        ('wireless_headphones', 'Wireless Headphones'),
        ('cable', 'Charging Cable'),
        ('screen_protector', 'Screen Protector'),
        ('power_bank', 'Power Bank'),
        ('other', 'Other'),
    )

    accessory_category = models.CharField(max_length=50, choices=ACCESSORY_CATEGORIES)
    color = models.CharField(max_length=50, blank=True, null=True)
    material = models.CharField(max_length=100, blank=True, null=True) # e.g., for cases, cables
    compatible_phones = models.ManyToManyField(Phone, related_name='compatible_accessories', blank=True)

    # Charger/Power Bank Specific
    voltage_v = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True) # e.g., for chargers, power banks
    amperage_a = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True) # e.g., for chargers, power banks
    wattage_w = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True) # e.g., for chargers, power banks
    battery_capacity_mah = models.PositiveIntegerField(blank=True, null=True) # e.g., for power banks, wireless headphones case

    # Cable Specific
    cable_type = models.CharField(max_length=50, blank=True, null=True) # e.g., USB-C to USB-C, USB-A to Lightning
    length_cm = models.PositiveIntegerField(blank=True, null=True) # e.g., for cables

    # Headphone Specific
    connection_type = models.CharField(max_length=50, blank=True, null=True) # e.g., Bluetooth, 3.5mm jack, USB-C
    wireless_range_m = models.PositiveIntegerField(blank=True, null=True) # e.g., for wireless headphones
    noise_cancellation = models.BooleanField(default=False) # e.g., for headphones

    # Screen Protector Specific
    hardness_rating = models.CharField(max_length=10, blank=True, null=True) # e.g., "9H"
    finish = models.CharField(max_length=50, blank=True, null=True) # e.g., "Glossy", "Matte"

    # Keep JSONField for less common or highly variable specs
    additional_specs = models.JSONField(default=dict, blank=True, null=True)

    def save(self, *args, **kwargs):
        self.product_type = 'accessory' # Set the type automatically
        # Code generation and case conversion is handled in the base Product's save method
        super().save(*args, **kwargs)

    def __str__(self):
        # Include code from the base Product model
        return f"Accessory ({self.code}) ({self.get_accessory_category_display()}): {self.name}"

# --- Stock Model ---
class Stock(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='stock')
    quantity = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name} ({self.product.code}): {self.quantity} in stock" # Include code

# --- Sale Model ---
SALE_TYPES = (
    ('bulk', 'Bulk'),
    ('semi-bulk', 'Semi-Bulk'),
    ('particular', 'Particular'),
)

class Sale(models.Model):
    sale_date = models.DateTimeField(auto_now_add=True)
    sale_type = models.CharField(max_length=50, choices=SALE_TYPES)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    sold_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    has_invoice = models.BooleanField(default=False)
    customer_name = models.CharField(max_length=255, blank=True, null=True) # Added customer name

    def __str__(self):
        return f"Sale #{self.id} on {self.sale_date.strftime('%Y-%m-%d')}"

# --- SaleItem Model ---
class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE) # Links to the base Product
    quantity_sold = models.PositiveIntegerField()
    # The price per item in SaleItem should be the price at the time of sale,
    # which will be one of the selling prices from the Product model.
    price_per_item = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity_sold} x {self.product.name} ({self.product.code}) in Sale #{self.sale.id}" # Include code

# --- Invoice Model ---
class Invoice(models.Model):
    sale = models.OneToOneField(Sale, on_delete=models.CASCADE, related_name='invoice')
    invoice_date = models.DateTimeField(auto_now_add=True)
    invoice_number = models.CharField(max_length=100, unique=True)
    customer_info = models.TextField(blank=True, null=True) # Can still use this for more detailed info
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Invoice #{self.invoice_number} for Sale #{self.sale.id}"

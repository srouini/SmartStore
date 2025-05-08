from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Brand, Model, Product, Phone, Accessory, 
    Stock, Sale, SaleItem, Invoice, SALE_TYPES
)

# User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('email',)

# Brand Serializer
class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'

# Model Serializer
class ModelSerializer(serializers.ModelSerializer):
    brand_name = serializers.ReadOnlyField(source='brand.name')
    
    class Meta:
        model = Model
        fields = '__all__'

# Stock Serializer
class StockSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_code = serializers.ReadOnlyField(source='product.code')
    
    class Meta:
        model = Stock
        fields = '__all__'

# Base Product Serializer
class ProductSerializer(serializers.ModelSerializer):
    brand_name = serializers.ReadOnlyField(source='brand.name')
    stock_quantity = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = '__all__'
    
    def get_stock_quantity(self, obj):
        try:
            return obj.stock.quantity
        except Stock.DoesNotExist:
            return 0

# Phone Serializer
class PhoneSerializer(serializers.ModelSerializer):
    brand_name = serializers.ReadOnlyField(source='brand.name')
    model_name = serializers.ReadOnlyField(source='model.name')
    stock_quantity = serializers.SerializerMethodField()
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    version_display = serializers.CharField(source='get_version_display', read_only=True)
    phone_type_display = serializers.CharField(source='get_phone_type_display', read_only=True)
    screen_type_display = serializers.CharField(source='get_screen_type_display', read_only=True)
    
    # Explicitly define choice fields to use the choices from the model
    condition = serializers.ChoiceField(choices=Phone.CONDITION_CHOICES)
    version = serializers.ChoiceField(choices=Phone.VERSION_CHOICES)
    phone_type = serializers.ChoiceField(choices=Phone.PHONE_TYPE_CHOICES)
    screen_type = serializers.ChoiceField(choices=Phone.SCREEN_TYPE_CHOICES, required=False, allow_null=True)
    
    class Meta:
        model = Phone
        fields = '__all__'
    
    def get_stock_quantity(self, obj):
        try:
            return obj.stock.quantity
        except Stock.DoesNotExist:
            return 0

# Accessory Serializer
class AccessorySerializer(serializers.ModelSerializer):
    brand_name = serializers.ReadOnlyField(source='brand.name')
    accessory_category_display = serializers.CharField(source='get_accessory_category_display', read_only=True)
    stock_quantity = serializers.SerializerMethodField()
    compatible_phones_info = serializers.SerializerMethodField()
    
    # Explicitly define choice field to use the choices from the model
    accessory_category = serializers.ChoiceField(choices=Accessory.ACCESSORY_CATEGORIES)
    
    class Meta:
        model = Accessory
        fields = '__all__'
    
    def get_stock_quantity(self, obj):
        try:
            return obj.stock.quantity
        except Stock.DoesNotExist:
            return 0
    
    def get_compatible_phones_info(self, obj):
        return [
            {
                'id': phone.id,
                'name': phone.name,
                'code': phone.code
            } for phone in obj.compatible_phones.all()
        ]

# SaleItem Serializer
class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_code = serializers.ReadOnlyField(source='product.code')
    product_type = serializers.ReadOnlyField(source='product.product_type')
    
    class Meta:
        model = SaleItem
        fields = '__all__'

# Sale Serializer
class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    sold_by_username = serializers.ReadOnlyField(source='sold_by.username')
    sale_type_display = serializers.CharField(source='get_sale_type_display', read_only=True)
    
    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ('total_amount', 'has_invoice')

# Invoice Serializer
class InvoiceSerializer(serializers.ModelSerializer):
    sale_info = SaleSerializer(source='sale', read_only=True)
    
    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ('sale', 'invoice_date', 'total_amount')

# Serializer for recording a sale with multiple items
class RecordSaleSerializer(serializers.Serializer):
    sale_type = serializers.ChoiceField(choices=SALE_TYPES)
    customer_name = serializers.CharField(required=False, allow_blank=True)
    generate_invoice = serializers.BooleanField(default=False)
    items = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField(),
            allow_empty=False
        ),
        allow_empty=False
    )
    
    def validate_items(self, items):
        validated_items = []
        
        for item in items:
            # Validate required fields
            if 'product_id' not in item or 'quantity' not in item:
                raise serializers.ValidationError("Each item must have product_id and quantity")
            
            try:
                product_id = int(item['product_id'])
                quantity = int(item['quantity'])
            except (ValueError, TypeError):
                raise serializers.ValidationError("product_id and quantity must be valid integers")
            
            if quantity <= 0:
                raise serializers.ValidationError("Quantity must be greater than zero")
            
            # Check if product exists
            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product with id {product_id} does not exist")
            
            # Check if there's enough stock
            try:
                stock = Stock.objects.get(product=product)
                if stock.quantity < quantity:
                    raise serializers.ValidationError(
                        f"Not enough stock for {product.name} (Code: {product.code}). "
                        f"Available: {stock.quantity}, Requested: {quantity}"
                    )
            except Stock.DoesNotExist:
                raise serializers.ValidationError(
                    f"No stock record found for {product.name} (Code: {product.code})"
                )
            
            # Determine price based on sale type
            sale_type = self.initial_data.get('sale_type')
            if sale_type == 'bulk' and product.selling_bulk_price:
                price = product.selling_bulk_price
            elif sale_type == 'semi-bulk' and product.selling_semi_bulk_price:
                price = product.selling_semi_bulk_price
            else:  # Default to unit price for 'particular' or if specific price is not set
                price = product.selling_unite_price
            
            validated_items.append({
                'product': product,
                'quantity': quantity,
                'price': price
            })
        
        return validated_items

# Serializer for adding stock to an existing product
class AddStockSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    
    def validate_product_id(self, value):
        try:
            Product.objects.get(pk=value)
            return value
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product does not exist")

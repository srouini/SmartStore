from django.contrib import admin
from .models import (
    Brand, Model, Product, Phone, Accessory, 
    Stock, Sale, SaleItem, Invoice
)

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'origin_country', 'website')
    search_fields = ('name', 'origin_country')

@admin.register(Model)
class ModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'release_date')
    list_filter = ('brand',)
    search_fields = ('name', 'brand__name')

@admin.register(Phone)
class PhoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'brand', 'model', 'condition', 'version', 'selling_unite_price')
    list_filter = ('brand', 'condition', 'version', 'phone_type')
    search_fields = ('name', 'code', 'brand__name', 'model__name')
    readonly_fields = ('product_type', 'code')

@admin.register(Accessory)
class AccessoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'brand', 'accessory_category', 'selling_unite_price')
    list_filter = ('brand', 'accessory_category')
    search_fields = ('name', 'code', 'brand__name')
    readonly_fields = ('product_type', 'code')
    filter_horizontal = ('compatible_phones',)

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity', 'last_updated')
    search_fields = ('product__name', 'product__code')
    list_filter = ('product__product_type',)

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'sale_date', 'sale_type', 'total_amount', 'sold_by', 'has_invoice', 'customer_name')
    list_filter = ('sale_type', 'sale_date', 'sold_by', 'has_invoice')
    search_fields = ('customer_name',)
    date_hierarchy = 'sale_date'

@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):
    list_display = ('sale', 'product', 'quantity_sold', 'price_per_item')
    list_filter = ('sale__sale_type',)
    search_fields = ('product__name', 'product__code')

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'sale', 'invoice_date', 'total_amount')
    search_fields = ('invoice_number', 'customer_info')
    date_hierarchy = 'invoice_date'

from django.db import transaction
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Supplier, Purchase, PurchaseItem
from .serializers import (
    SupplierSerializer, PurchaseSerializer, PurchaseItemSerializer, 
    CreatePurchaseSerializer
)

# Supplier ViewSet
class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all().order_by('name')
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by name
        name = self.request.query_params.get('name', None)
        if name is not None:
            queryset = queryset.filter(name__icontains=name)
        
        # Filter by code
        code = self.request.query_params.get('code', None)
        if code is not None:
            queryset = queryset.filter(code__icontains=code)
        
        return queryset

# Purchase ViewSet
class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.all().order_by('-date')
    serializer_class = PurchaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date is not None:
            queryset = queryset.filter(date__gte=start_date)
        
        if end_date is not None:
            queryset = queryset.filter(date__lte=end_date)
        
        # Filter by supplier
        supplier_id = self.request.query_params.get('supplier_id', None)
        if supplier_id is not None:
            queryset = queryset.filter(supplier_id=supplier_id)
        
        # Filter by reference number
        reference_number = self.request.query_params.get('reference_number', None)
        if reference_number is not None:
            queryset = queryset.filter(reference_number__icontains=reference_number)
        
        # Filter by payment status
        payment_status = self.request.query_params.get('payment_status', None)
        if payment_status is not None:
            queryset = queryset.filter(payment_status=payment_status)
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def create_purchase(self, request):
        serializer = CreatePurchaseSerializer(data=request.data)
        
        if serializer.is_valid():
            with transaction.atomic():
                # Create the purchase
                supplier = Supplier.objects.get(pk=serializer.validated_data['supplier_id'])
                purchase_data = {
                    'supplier': supplier,
                    'reference_number': serializer.validated_data['reference_number'],
                    'date': serializer.validated_data['date'],
                    'payment_status': serializer.validated_data['payment_status'],
                    'payment_method': serializer.validated_data['payment_method'],
                    'notes': serializer.validated_data.get('notes', ''),
                    'soumis_tva': serializer.validated_data.get('soumis_tva', True),
                    'total_amount': 0  # Will be updated after adding items
                }
                
                purchase = Purchase.objects.create(**purchase_data)
                
                # Add items to the purchase
                for item_data in serializer.validated_data['items']:
                    item = PurchaseItem.objects.create(
                        purchase=purchase,
                        product_id=item_data['product_id'],
                        product_name=item_data['product_name'],
                        product_code=item_data['product_code'],
                        quantity=item_data['quantity'],
                        discount=item_data.get('discount', 0),
                        unit_price=item_data['unit_price'],
                        # ht, tva, and ttc will be calculated in the save method
                        ht=0,
                        tva=0,
                        ttc=0
                    )
                
                # Update purchase totals based on items
                purchase.update_totals()
                
                return Response(
                    PurchaseSerializer(purchase).data,
                    status=status.HTTP_201_CREATED
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

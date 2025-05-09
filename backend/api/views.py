from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from django.utils import timezone
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework.authtoken.models import Token

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination

from .models import (
    Brand, Model, Product, Phone, Accessory, 
    Stock, Sale, SaleItem, Invoice, SALE_TYPES,
    Purchase, PurchaseItem, PAYMENT_STATUS_CHOICES, PAYMENT_METHOD_CHOICES,
    Supplier, Caisse, CaisseOperation
)
from .serializers import (
    BrandSerializer, ModelSerializer, ProductSerializer,
    PhoneSerializer, AccessorySerializer, StockSerializer,
    SaleSerializer, SaleItemSerializer, InvoiceSerializer,
    RecordSaleSerializer, UserSerializer, AddStockSerializer,
    SupplierSerializer, PurchaseSerializer, PurchaseItemSerializer,
    CreatePurchaseSerializer, CaisseSerializer, CaisseOperationSerializer,
    CaisseDetailSerializer, CaisseDepositSerializer, CaisseWithdrawalSerializer
)
import random
import string

# Import pagination class from purchase_views.py
from .purchase_views import SupplierViewSet, PurchaseViewSet, StandardResultsSetPagination

# Authentication Views
@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        token = get_token(request)
        return JsonResponse({
            'success': 'CSRF cookie set',
            'csrfToken': token
        })

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        print(f"Login attempt with data: {request.data}")
        print(f"Request headers: {request.headers}")
        
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            print("Login failed: Missing username or password")
            return Response(
                {'error': 'Please provide both username and password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = authenticate(username=username, password=password)
            
            if user is not None:
                # Create or get the token for the user
                token, created = Token.objects.get_or_create(user=user)
                
                # Login the user (for session-based auth as well)
                login(request, user)
                
                print(f"User {username} logged in successfully with token")
                
                # Return user data and token
                user_data = UserSerializer(user).data
                user_data['token'] = token.key
                
                return Response(
                    user_data,
                    status=status.HTTP_200_OK
                )
            else:
                print(f"Login failed for user {username}: Invalid credentials")
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except Exception as e:
            print(f"Login error: {str(e)}")
            return Response(
                {'error': f'Login failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Delete the user's token
        try:
            request.user.auth_token.delete()
            print(f"Token deleted for user {request.user.username}")
        except Exception as e:
            print(f"Error deleting token: {str(e)}")
        
        # Logout from session-based auth
        logout(request)
        
        return Response(
            {'success': 'User logged out successfully'},
            status=status.HTTP_200_OK
        )

class UserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        print(f"User view accessed by: {request.user.username}")
        print(f"Auth header: {request.META.get('HTTP_AUTHORIZATION', 'None')}")
        
        # Get the user's token
        try:
            token = Token.objects.get(user=request.user)
            user_data = UserSerializer(request.user).data
            user_data['token'] = token.key
            return Response(user_data, status=status.HTTP_200_OK)
        except Token.DoesNotExist:
            # If no token exists, create one
            token = Token.objects.create(user=request.user)
            user_data = UserSerializer(request.user).data
            user_data['token'] = token.key
            return Response(user_data, status=status.HTTP_200_OK)

# Brand ViewSet
class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

# Model ViewSet
class ModelViewSet(viewsets.ModelViewSet):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = Model.objects.all()
        brand_id = self.request.query_params.get('brand_id', None)
        
        if brand_id is not None:
            queryset = queryset.filter(brand_id=brand_id)
        
        return queryset

# Phone ViewSet
class PhoneViewSet(viewsets.ModelViewSet):
    queryset = Phone.objects.all()
    serializer_class = PhoneSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = Phone.objects.all()
        
        # Filter by brand
        brand_id = self.request.query_params.get('brand_id', None)
        if brand_id is not None:
            queryset = queryset.filter(brand_id=brand_id)
        
        # Filter by model
        model_id = self.request.query_params.get('model_id', None)
        if model_id is not None:
            queryset = queryset.filter(model_id=model_id)
        
        # Filter by condition using model choices
        condition = self.request.query_params.get('condition', None)
        if condition is not None and condition in dict(Phone.CONDITION_CHOICES):
            queryset = queryset.filter(condition=condition)
        
        # Filter by version using model choices
        version = self.request.query_params.get('version', None)
        if version is not None and version in dict(Phone.VERSION_CHOICES):
            queryset = queryset.filter(version=version)
        
        # Filter by phone_type using model choices
        phone_type = self.request.query_params.get('phone_type', None)
        if phone_type is not None and phone_type in dict(Phone.PHONE_TYPE_CHOICES):
            queryset = queryset.filter(phone_type=phone_type)
            
        # Filter by screen_type using model choices
        screen_type = self.request.query_params.get('screen_type', None)
        if screen_type is not None and screen_type in dict(Phone.SCREEN_TYPE_CHOICES):
            queryset = queryset.filter(screen_type=screen_type)
        
        # Search by code
        code = self.request.query_params.get('code', None)
        if code is not None:
            queryset = queryset.filter(code__iexact=code)
        
        # Search by name
        name = self.request.query_params.get('name', None)
        if name is not None:
            queryset = queryset.filter(name__icontains=name)
        
        return queryset
    
    def perform_create(self, serializer):
        phone = serializer.save()
        # Create stock record with 0 quantity
        Stock.objects.create(product=phone, quantity=0)

# Accessory ViewSet
class AccessoryViewSet(viewsets.ModelViewSet):
    queryset = Accessory.objects.all()
    serializer_class = AccessorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = Accessory.objects.all()
        
        # Filter by brand
        brand_id = self.request.query_params.get('brand_id', None)
        if brand_id is not None:
            queryset = queryset.filter(brand_id=brand_id)
        
        # Filter by category using model choices
        category = self.request.query_params.get('category', None)
        if category is not None and category in dict(Accessory.ACCESSORY_CATEGORIES):
            queryset = queryset.filter(accessory_category=category)
        
        # Filter by compatible phone
        compatible_with = self.request.query_params.get('compatible_with', None)
        if compatible_with is not None:
            queryset = queryset.filter(compatible_phones__id=compatible_with)
        
        # Search by code
        code = self.request.query_params.get('code', None)
        if code is not None:
            queryset = queryset.filter(code__iexact=code)
        
        # Search by name
        name = self.request.query_params.get('name', None)
        if name is not None:
            queryset = queryset.filter(name__icontains=name)
        
        return queryset
    
    def perform_create(self, serializer):
        accessory = serializer.save()
        # Create stock record with 0 quantity
        Stock.objects.create(product=accessory, quantity=0)

# Stock ViewSet
class StockViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = Stock.objects.all()
        
        # Filter by product type
        product_type = self.request.query_params.get('product_type', None)
        if product_type is not None:
            queryset = queryset.filter(product__product_type=product_type)
        
        # Filter by low stock (quantity below threshold)
        low_stock = self.request.query_params.get('low_stock', None)
        if low_stock is not None:
            threshold = int(low_stock) if low_stock.isdigit() else 5
            queryset = queryset.filter(quantity__lt=threshold)
        
        # Filter by out of stock (quantity = 0)
        out_of_stock = self.request.query_params.get('out_of_stock', None)
        if out_of_stock is not None and out_of_stock.lower() == 'true':
            queryset = queryset.filter(quantity=0)
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def add(self, request):
        serializer = AddStockSerializer(data=request.data)
        
        if serializer.is_valid():
            product_id = serializer.validated_data['product_id']
            quantity = serializer.validated_data['quantity']
            
            product = get_object_or_404(Product, id=product_id)
            
            stock, created = Stock.objects.get_or_create(
                product=product,
                defaults={'quantity': 0}
            )
            
            stock.quantity += quantity
            stock.save()
            
            return Response(
                {'success': f'Added {quantity} units to {product.name} (Code: {product.code}). New stock level: {stock.quantity}'},
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Sale ViewSet
class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all().order_by('-sale_date')
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = Sale.objects.all().order_by('-sale_date')
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date is not None:
            queryset = queryset.filter(sale_date__gte=start_date)
        
        if end_date is not None:
            queryset = queryset.filter(sale_date__lte=end_date)
        
        # Filter by sale type
        sale_type = self.request.query_params.get('sale_type', None)
        if sale_type is not None:
            queryset = queryset.filter(sale_type=sale_type)
        
        # Filter by user who made the sale
        sold_by = self.request.query_params.get('sold_by', None)
        if sold_by is not None:
            queryset = queryset.filter(sold_by_id=sold_by)
        
        # Filter by customer name
        customer = self.request.query_params.get('customer', None)
        if customer is not None:
            queryset = queryset.filter(customer_name__icontains=customer)
        
        # Filter by has_invoice
        has_invoice = self.request.query_params.get('has_invoice', None)
        if has_invoice is not None:
            has_invoice_bool = has_invoice.lower() == 'true'
            queryset = queryset.filter(has_invoice=has_invoice_bool)
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def record(self, request):
        serializer = RecordSaleSerializer(data=request.data)
        
        if serializer.is_valid():
            with transaction.atomic():
                # Create the sale
                sale = Sale.objects.create(
                    sale_type=serializer.validated_data['sale_type'],
                    customer_name=serializer.validated_data.get('customer_name', ''),
                    total_amount=0,  # Will be calculated below
                    sold_by=request.user
                )
                
                total_amount = 0
                
                # Create sale items and update stock
                for item_data in serializer.validated_data['items']:
                    product = item_data['product']
                    quantity = item_data['quantity']
                    price = item_data['price']
                    
                    # Create sale item
                    SaleItem.objects.create(
                        sale=sale,
                        product=product,
                        quantity_sold=quantity,
                        price_per_item=price
                    )
                    
                    # Update stock
                    stock = Stock.objects.get(product=product)
                    stock.quantity -= quantity
                    stock.save()
                    
                    # Add to total amount
                    total_amount += price * quantity
                
                # Update sale total
                sale.total_amount = total_amount
                
                # Generate invoice if requested
                if serializer.validated_data.get('generate_invoice', False):
                    # Generate a unique invoice number
                    invoice_number = self._generate_invoice_number()
                    
                    # Create the invoice
                    Invoice.objects.create(
                        sale=sale,
                        invoice_number=invoice_number,
                        total_amount=total_amount,
                        customer_info=serializer.validated_data.get('customer_name', '')
                    )
                    
                    sale.has_invoice = True
                
                sale.save()
                
                return Response(
                    {
                        'success': 'Sale recorded successfully',
                        'sale_id': sale.id,
                        'total_amount': total_amount,
                        'has_invoice': sale.has_invoice
                    },
                    status=status.HTTP_201_CREATED
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _generate_invoice_number(self):
        # Generate a unique invoice number format: INV-YYYYMMDD-XXXX
        # Where XXXX is a random 4-digit number
        date_part = timezone.now().strftime('%Y%m%d')
        random_part = ''.join(random.choices(string.digits, k=4))
        invoice_number = f'INV-{date_part}-{random_part}'
        
        # Ensure uniqueness
        while Invoice.objects.filter(invoice_number=invoice_number).exists():
            random_part = ''.join(random.choices(string.digits, k=4))
            invoice_number = f'INV-{date_part}-{random_part}'
        
        return invoice_number

# Invoice ViewSet
class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Invoice.objects.all().order_by('-invoice_date')
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = Invoice.objects.all().order_by('-invoice_date')
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date is not None:
            queryset = queryset.filter(invoice_date__gte=start_date)
        
        if end_date is not None:
            queryset = queryset.filter(invoice_date__lte=end_date)
        
        # Filter by invoice number
        invoice_number = self.request.query_params.get('invoice_number', None)
        if invoice_number is not None:
            queryset = queryset.filter(invoice_number__icontains=invoice_number)
        
        # Filter by customer info
        customer_info = self.request.query_params.get('customer_info', None)
        if customer_info is not None:
            queryset = queryset.filter(customer_info__icontains=customer_info)
        
        return queryset

# Caisse (Cash Register) Views
class CaisseViewSet(viewsets.ModelViewSet):
    queryset = Caisse.objects.all().order_by('name')
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CaisseDetailSerializer
        return CaisseSerializer
    
    @action(detail=True, methods=['post'])
    def deposit(self, request, pk=None):
        caisse = self.get_object()
        serializer = CaisseDepositSerializer(data=request.data)
        
        if serializer.is_valid():
            amount = serializer.validated_data['amount']
            description = serializer.validated_data.get('description', 'Manual deposit')
            
            try:
                caisse.add_funds(amount, description, request.user)
                return Response({
                    'status': 'success',
                    'message': f'Successfully added {amount} to {caisse.name}',
                    'current_balance': caisse.current_balance
                })
            except ValueError as e:
                return Response({'status': 'error', 'message': str(e)}, 
                                status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        caisse = self.get_object()
        serializer = CaisseWithdrawalSerializer(data=request.data)
        
        if serializer.is_valid():
            amount = serializer.validated_data['amount']
            description = serializer.validated_data.get('description', 'Manual withdrawal')
            
            try:
                caisse.withdraw_funds(amount, description, request.user)
                return Response({
                    'status': 'success',
                    'message': f'Successfully withdrew {amount} from {caisse.name}',
                    'current_balance': caisse.current_balance
                })
            except ValueError as e:
                return Response({'status': 'error', 'message': str(e)}, 
                                status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CaisseOperationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CaisseOperation.objects.all().order_by('-timestamp')
    serializer_class = CaisseOperationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filterset_fields = ['caisse', 'operation_type', 'performed_by']
    search_fields = ['description', 'reference_id']
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Explicitly check for caisse filter to ensure it works
        caisse_id = self.request.query_params.get('caisse', None)
        if caisse_id:
            print(f"Filtering operations by caisse_id: {caisse_id}")
            queryset = queryset.filter(caisse_id=caisse_id)
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        print(f"CaisseOperation query: {queryset.query}")
        return queryset

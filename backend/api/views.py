from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.db import transaction, models
from django.utils import timezone
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.core.files.base import ContentFile
from django.conf import settings
from rest_framework.authtoken.models import Token
import re

import urllib.request
import urllib.error
import json
import tempfile

# Simple HTML parsing using string operations
def extract_image_urls_from_html(html_content):
    """Extract image URLs from HTML content using simple string operations"""
    image_urls = []
    # Look for img tags
    img_start = 0
    while True:
        # Find img tag
        img_start = html_content.find('<img', img_start)
        if img_start == -1:
            break
            
        # Find src attribute
        src_start = html_content.find('src="', img_start)
        if src_start == -1:
            img_start += 4
            continue
            
        src_start += 5  # Move to start of URL
        src_end = html_content.find('"', src_start)
        if src_end == -1:
            img_start = src_start
            continue
            
        # Extract URL
        img_url = html_content[src_start:src_end]
        if img_url.endswith('.jpg') or img_url.endswith('.png') or img_url.endswith('.jpeg'):
            # Convert thumbnail to gallery image if it's from GSMArena
            if '-t.jpg' in img_url:
                img_url = img_url.replace('-t.jpg', '-gal.jpg')
            if img_url not in image_urls:
                image_urls.append(img_url)
                
        img_start = src_end
    
    return image_urls

# Simple download image function using standard library
def download_image(url):
    """Download an image from a URL using only standard library or use local images for GSMArena"""
    # Check if this is a GSMArena URL and use local placeholder image to avoid CORS issues
    if 'gsmarena' in url or 'fdn.gsmarena' in url or 'cdn.gsmarena' in url:
        import os
        # Create a temporary file with placeholder image or default image from static folder
        placeholder_path = os.path.join(settings.BASE_DIR, '../static/images/placeholder.jpg')
        # If placeholder doesn't exist, use a sample phone image if available
        if not os.path.exists(placeholder_path):
            placeholder_path = os.path.join(settings.BASE_DIR, '../static/images/phone_sample.jpg')
        # If neither exists, create a very basic image
        if not os.path.exists(placeholder_path):
            # Make sure the directory exists
            os.makedirs(os.path.dirname(placeholder_path), exist_ok=True)
            # Create a simple placeholder
            from PIL import Image, ImageDraw, ImageFont
            img = Image.new('RGB', (300, 400), color=(240, 240, 240))
            d = ImageDraw.Draw(img)
            d.text((100, 200), "Phone Image", fill=(20, 20, 20))
            img.save(placeholder_path)
        
        # Create a copy of the placeholder in a temp file
        suffix = '.jpg'  # Default to jpg
        if url.endswith('.png'):
            suffix = '.png'
        elif url.endswith('.jpeg'):
            suffix = '.jpeg'
        
        # Create a temporary file
        temp_file = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
        with open(placeholder_path, 'rb') as src_file:
            temp_file.write(src_file.read())
        temp_file.close()
        
        return temp_file.name
        
    # For non-GSMArena URLs, use the original method
    try:
        # Set headers to avoid being blocked
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        # Create a request object
        req = urllib.request.Request(url, headers=headers)
        # Open the URL
        with urllib.request.urlopen(req, timeout=10) as response:
            # Read the content
            image_data = response.read()
            
            # Create a temporary file
            suffix = '.jpg'  # Default to jpg
            if url.endswith('.png'):
                suffix = '.png'
            elif url.endswith('.jpeg'):
                suffix = '.jpeg'
                
            # Create a temporary file
            temp_file = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
            temp_file.write(image_data)
            temp_file.close()
            
            return temp_file.name
    except Exception as e:
        print(f"Error downloading image: {str(e)}")
        return None
        
# Function to download a web page
def download_webpage(url):
    """Download a web page using only standard library or return local content for GSMArena"""
    # Check if this is a GSMArena URL and return local content to avoid CORS issues
    if 'gsmarena.com' in url:
        import os
        # Main GSMArena page content
        main_file = os.path.join(settings.BASE_DIR, '../frontend/src/components/modals/gsmarena_main.html')
        # Detail GSMArena page content
        detail_file = os.path.join(settings.BASE_DIR, '../frontend/src/components/modals/gsmarena.html')
        
        # Choose the appropriate file based on URL pattern
        target_file = detail_file if 'pictures' in url else main_file
        
        # Read the file content if it exists
        if os.path.exists(target_file):
            with open(target_file, 'r', encoding='utf-8') as f:
                return f.read()
        else:
            print(f"Local GSMArena file not found: {target_file}")
            return None
    
    # For non-GSMArena URLs, use the original method
    try:
        # Set headers to avoid being blocked
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        # Create a request object
        req = urllib.request.Request(url, headers=headers)
        # Open the URL
        with urllib.request.urlopen(req, timeout=10) as response:
            # Read the content
            return response.read().decode('utf-8')
    except Exception as e:
        print(f"Error downloading page: {str(e)}")
        return None

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination

from .models import (
    Brand, Model, Product, Phone, PhoneImage, Accessory, 
    Stock, Sale, SaleItem, Invoice, SALE_TYPES,
    Purchase, PurchaseItem, PAYMENT_STATUS_CHOICES, PAYMENT_METHOD_CHOICES,
    Supplier, Caisse, CaisseOperation
)
from .serializers import (
    BrandSerializer, ModelSerializer, ProductSerializer,
    PhoneSerializer, PhoneImageSerializer, AccessorySerializer, StockSerializer,
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
    
    def get_queryset(self):
        queryset = Brand.objects.all()
        name = self.request.query_params.get('name', None)
        all_param = self.request.query_params.get('all', 'false').lower() == 'true'

        if name:
            # Case-insensitive search (contains)
            queryset = queryset.filter(name__icontains=name)

        # If all=true, return all brands (pagination will be handled in the frontend or by custom logic)
        if all_param:
            self.pagination_class = None
        else:
            self.pagination_class = StandardResultsSetPagination

        return queryset.order_by('name')

# Model ViewSet
class ModelViewSet(viewsets.ModelViewSet):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = Model.objects.all()
        brand_id = self.request.query_params.get('brand_id', None)
        all_param = self.request.query_params.get('all', 'false').lower() == 'true'

        if brand_id is not None:
            queryset = queryset.filter(brand_id=brand_id)

        # If all=true, return all models (pagination will be handled in the frontend or by custom logic)
        if all_param:
            self.pagination_class = None
        else:
            self.pagination_class = StandardResultsSetPagination

        return queryset

# Phone Image ViewSet
class PhoneImageViewSet(viewsets.ModelViewSet):
    queryset = PhoneImage.objects.all()
    serializer_class = PhoneImageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Filter by phone if provided
        phone_id = self.request.query_params.get('phone', None)
        if phone_id:
            try:
                phone_id = int(phone_id)
                queryset = queryset.filter(phone_id=phone_id)
            except (ValueError, TypeError):
                pass
                
        # Filter by color variant if provided
        color = self.request.query_params.get('color', None)
        if color:
            queryset = queryset.filter(color_variant__icontains=color)
                
        return queryset

    @action(detail=False, methods=['post'])
    def upload_multiple(self, request):
        """Upload multiple images for a phone"""
        phone_id = request.data.get('phone')
        if not phone_id:
            return Response({'error': 'Phone ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            phone = Phone.objects.get(id=phone_id)
        except Phone.DoesNotExist:
            return Response({'error': 'Phone not found'}, status=status.HTTP_404_NOT_FOUND)
            
        images = request.FILES.getlist('images')
        if not images:
            return Response({'error': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Process color variant and primary status
        color_variant = request.data.get('color_variant', '')
        make_primary = request.data.get('is_primary', False)
        if make_primary:
            # If this is primary, update other images for this phone to non-primary
            PhoneImage.objects.filter(phone=phone, is_primary=True).update(is_primary=False)
            
        # Save all images
        phone_images = []
        for i, image_file in enumerate(images):
            # First image is primary if make_primary is True or no primary image exists
            is_primary = make_primary and i == 0
            if i == 0 and not PhoneImage.objects.filter(phone=phone, is_primary=True).exists():
                is_primary = True
                
            phone_image = PhoneImage.objects.create(
                phone=phone,
                image=image_file,
                color_variant=color_variant,
                is_primary=is_primary,
                sort_order=i
            )
            phone_images.append(phone_image)
            
        # Return serialized data
        serializer = PhoneImageSerializer(phone_images, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    @action(detail=False, methods=['post'])
    def fetch_from_gsmarena(self, request):
        """Extract image URLs from a GSMArena page and return them without downloading"""
        phone_id = request.data.get('phone')
        if not phone_id:
            return Response({'error': 'Phone ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            phone = Phone.objects.get(id=phone_id)
        except Phone.DoesNotExist:
            return Response({'error': 'Phone not found'}, status=status.HTTP_404_NOT_FOUND)
            
        # Get GSMArena URL - either from request or from phone model
        gsmarena_url = request.data.get('gsmarena_url') or phone.gsmarena_url
        if not gsmarena_url:
            return Response({'error': 'GSMArena URL is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Get the GSMArena HTML content from local files
            html_content = download_webpage(gsmarena_url)
            if not html_content:
                return Response({'error': 'Failed to get GSMArena page content'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Extract image URLs
            image_sources = extract_image_urls_from_html(html_content)
            
            # Check for picture gallery in HTML
            gallery_start = html_content.find('pictures-preview')
            if gallery_start > -1:
                # Try to find the pictures link
                href_start = html_content.find('href="', gallery_start) 
                if href_start > -1:
                    href_start += 6
                    href_end = html_content.find('"', href_start)
                    if href_end > -1:
                        href = html_content[href_start:href_end]
                        if href and 'pictures' in href:
                            # Get the pictures page content from our local HTML
                            pics_html = download_webpage('https://www.gsmarena.com/pictures.php3')
                            if pics_html:
                                # Extract image URLs from the pictures page
                                gallery_images = extract_image_urls_from_html(pics_html)
                                for img_url in gallery_images:
                                    if img_url not in image_sources:
                                        image_sources.append(img_url)
            
            # Look for 360 view images using regex
            img_360_pattern = re.compile(r'pic360url\s*=\s*["\'](.*?)["\']')
            match = img_360_pattern.search(html_content)
            if match:
                base_url = match.group(1)
                # Usually there are 36 images in a 360 view (one for each 10 degrees)
                for i in range(1, 37):  
                    img_src = f"{base_url}{i}.jpg"
                    if img_src not in image_sources:
                        image_sources.append(img_src)
            
            # Make sure we have absolute URLs
            for i, url in enumerate(image_sources):
                if not url.startswith('http'):
                    image_sources[i] = 'https://www.gsmarena.com' + url if not url.startswith('/') else 'https://www.gsmarena.com' + url
            
            # Extract additional information from the HTML
            specs = {}
            # Try to extract phone name
            name_start = html_content.find('<h1 class="specs-phone-name-title">')
            if name_start > -1:
                name_end = html_content.find('</h1>', name_start)
                if name_end > -1:
                    phone_name = html_content[name_start + len('<h1 class="specs-phone-name-title">'):name_end].strip()
                    specs['name'] = phone_name
            
            # Find the main phone image
            main_img = None
            if len(image_sources) > 0:
                main_img = image_sources[0]
            else:
                # Try to find it in the HTML
                img_start = html_content.find('<div class="specs-photo-main">')
                if img_start > -1:
                    img_tag_start = html_content.find('<img', img_start)
                    if img_tag_start > -1:
                        src_start = html_content.find('src="', img_tag_start)
                        if src_start > -1:
                            src_start += 5
                            src_end = html_content.find('"', src_start)
                            if src_end > -1:
                                main_img = html_content[src_start:src_end]
                                if not main_img.startswith('http'):
                                    main_img = 'https://www.gsmarena.com' + (main_img if main_img.startswith('/') else '/' + main_img)
                                image_sources.append(main_img)
            
            # Return the image URLs and specs without downloading or saving
            return Response({
                'status': 'success',
                'message': f'Successfully extracted {len(image_sources)} image URLs from GSMArena',
                'url': gsmarena_url,
                'images': image_sources[:10],  # Limit to 10 images
                'specs': specs,
                'main_image': main_img
            }, status=status.HTTP_200_OK)
                
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'status': 'error',
                'message': f'Error processing GSMArena content: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Phone ViewSet
class PhoneViewSet(viewsets.ModelViewSet):
    queryset = Phone.objects.all()
    serializer_class = PhoneSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Filter by brand if provided
        brand_id = self.request.query_params.get('brand', None)
        if brand_id:
            try:
                brand_id = int(brand_id)
                queryset = queryset.filter(brand_id=brand_id)
            except (ValueError, TypeError):
                # Handle case where brand_id is not a valid integer
                pass
                
        # Filter by model if provided
        model_id = self.request.query_params.get('model', None)
        if model_id:
            try:
                model_id = int(model_id)
                queryset = queryset.filter(model_id=model_id)
            except (ValueError, TypeError):
                # Handle case where model_id is not a valid integer
                pass
                
        # Search by name if provided
        name = self.request.query_params.get('name', None)
        if name:
            queryset = queryset.filter(name__icontains=name)
            
        # Search by code if provided
        code = self.request.query_params.get('code', None)
        if code:
            # Make case-insensitive search since we store codes in uppercase
            queryset = queryset.filter(code__iexact=code)
        
        # Search by GSMArena URL if provided 
        gsmarena_url = self.request.query_params.get('gsmarena_url', None)
        if gsmarena_url:
            queryset = queryset.filter(gsmarena_url__icontains=gsmarena_url)
            
        # Allow for additional filters by condition, version, and phone_type
        condition = self.request.query_params.get('condition', None)
        if condition:
            queryset = queryset.filter(condition=condition)
            
        version = self.request.query_params.get('version', None)
        if version:
            queryset = queryset.filter(version=version)
            
        phone_type = self.request.query_params.get('phone_type', None)
        if phone_type:
            queryset = queryset.filter(phone_type=phone_type)
            
        return queryset
    
    def perform_create(self, serializer):
        # Save the phone first
        phone = serializer.save()
        
        # Process the main photo and add it to PhoneImage if provided
        photo = self.request.data.get('photo')
        if photo and hasattr(photo, 'file'):
            # Create a primary image from the main photo
            PhoneImage.objects.create(
                phone=phone,
                image=photo,
                is_primary=True,
                sort_order=0
            )
        
        # Then create a stock entry for it with quantity 0
        Stock.objects.create(product=phone, quantity=0)
        
    def perform_update(self, serializer):
        # Get existing phone instance
        phone = self.get_object()
        
        # Handle photo field specially to avoid issues with updates
        photo = self.request.data.get('photo')
        
        # Only process photo if it's actually provided in the update data
        if photo and hasattr(photo, 'file'):
            # Create or update the primary image
            PhoneImage.objects.update_or_create(
                phone=phone,
                is_primary=True,
                defaults={
                    'image': photo,
                    'sort_order': 0
                }
            )
            
        # Save the phone with other fields
        serializer.save()
        
    @action(detail=True, methods=['get'])
    def images(self, request, pk=None):
        """Get all images for a phone"""
        phone = self.get_object()
        images = phone.images.all()
        serializer = PhoneImageSerializer(images, many=True)
        return Response(serializer.data)
        
    @action(detail=True, methods=['post'])
    def add_image(self, request, pk=None):
        """Add a single image to a phone"""
        phone = self.get_object()
        image = request.data.get('image')
        image_url = request.data.get('image_url')
        
        if not image and not image_url:
            return Response({'error': 'Either image file or image URL is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check if this should be the primary image
        is_primary = request.data.get('is_primary', False)
        if is_primary:
            # Update existing primary images to non-primary
            PhoneImage.objects.filter(phone=phone, is_primary=True).update(is_primary=False)
            
        # Get highest sort_order
        highest_order = PhoneImage.objects.filter(phone=phone).order_by('-sort_order').first()
        sort_order = highest_order.sort_order + 1 if highest_order else 0
        
        # Create new image
        color_variant = request.data.get('color_variant', '')
        source_url = request.data.get('source_url', '')
        
        try:
            # If URL is provided, download the image
            if image_url:
                file_obj, saved_path = download_image_from_url(image_url)
                if not file_obj:
                    return Response({'error': f'Failed to download image from {image_url}'}, 
                                    status=status.HTTP_400_BAD_REQUEST)
                    
                phone_image = PhoneImage.objects.create(
                    phone=phone,
                    image=file_obj,
                    color_variant=color_variant,
                    source_url=image_url,
                    is_primary=is_primary,
                    sort_order=sort_order
                )
            else:  # Use uploaded image
                phone_image = PhoneImage.objects.create(
                    phone=phone,
                    image=image,
                    color_variant=color_variant,
                    source_url=source_url,
                    is_primary=is_primary,
                    sort_order=sort_order
                )
            
            serializer = PhoneImageSerializer(phone_image)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': f'Error creating image: {str(e)}'}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                            
    @action(detail=True, methods=['post'])
    def fetch_images_from_gsmarena(self, request, pk=None):
        """Extract image URLs and information from GSMArena for this phone"""
        phone = self.get_object()
        
        # Get GSMArena URL - either from request or from phone model
        gsmarena_url = request.data.get('gsmarena_url') or phone.gsmarena_url
        if not gsmarena_url:
            return Response({'error': 'GSMArena URL is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Forward to the PhoneImageViewSet fetch_from_gsmarena action to get image URLs
        image_view = PhoneImageViewSet()
        image_view.request = request
        
        # Prepare the request data with the phone ID
        from django.http.request import QueryDict
        from django.utils.datastructures import MultiValueDict
        if isinstance(request.data, QueryDict):
            # If it's a QueryDict (form data), copy it to a mutable version
            updated_data = request.data.copy()
            updated_data['phone'] = str(phone.id)
            if gsmarena_url and gsmarena_url != phone.gsmarena_url:
                updated_data['gsmarena_url'] = gsmarena_url
        else:
            # If it's a regular dict (JSON), just modify it directly
            updated_data = dict(request.data)
            updated_data['phone'] = phone.id
            if gsmarena_url and gsmarena_url != phone.gsmarena_url:
                updated_data['gsmarena_url'] = gsmarena_url
        
        # Save the original request data
        original_data = request.data
        
        # Update the request data
        request._full_data = updated_data
        
        # Call the fetch_from_gsmarena action
        response = image_view.fetch_from_gsmarena(request)
        
        # Restore the original request data
        request._full_data = original_data
        
        # Process the response from fetch_from_gsmarena
        if response.status_code == 200 and response.data.get('status') == 'success':
            # Extract data from the response
            image_urls = response.data.get('images', [])
            specs = response.data.get('specs', {})
            main_image_url = response.data.get('main_image')
            
            # Update phone information if available
            phone_updated = False
            if specs.get('name') and not phone.name:
                phone.name = specs.get('name')
                phone_updated = True
            
            # If we don't have a GSMArena URL set, update it
            if gsmarena_url and not phone.gsmarena_url:
                phone.gsmarena_url = gsmarena_url
                phone_updated = True
                
            # Save phone changes if any were made
            if phone_updated:
                phone.save()
            
            # Return the image URLs so the frontend can display them
            return Response({
                'status': 'success',
                'message': f'Successfully extracted {len(image_urls)} image URLs from GSMArena',
                'phone_id': phone.id,
                'phone_name': phone.name,
                'image_urls': image_urls,
                'main_image_url': main_image_url
            })
        
        # Pass through any error response
        return response

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
        
        # Explicitly handle operation_type filter
        operation_type = self.request.query_params.get('operation_type', None)
        if operation_type:
            print(f"Filtering operations by operation_type: {operation_type}")
            queryset = queryset.filter(operation_type=operation_type)
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        # Add search parameter handling
        search = self.request.query_params.get('search', None)
        if search:
            # Include performed_by__username in search
            queryset = queryset.filter(
                models.Q(description__icontains=search) | 
                models.Q(reference_id__icontains=search) | 
                models.Q(performed_by__username__icontains=search)
            )
        
        print(f"CaisseOperation query: {queryset.query}")
        return queryset

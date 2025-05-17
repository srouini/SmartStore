from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'brands', views.BrandViewSet)
router.register(r'models', views.ModelViewSet)
router.register(r'phones', views.PhoneViewSet)
router.register(r'phone-images', views.PhoneImageViewSet)
router.register(r'accessories', views.AccessoryViewSet)
router.register(r'stock', views.StockViewSet)
router.register(r'sales', views.SaleViewSet)
router.register(r'invoices', views.InvoiceViewSet)
router.register(r'suppliers', views.SupplierViewSet)
router.register(r'purchases', views.PurchaseViewSet)
router.register(r'caisse', views.CaisseViewSet)
router.register(r'caisse-operations', views.CaisseOperationViewSet)

urlpatterns = [
    # Authentication endpoints
    path('auth/csrf/', views.GetCSRFToken.as_view(), name='csrf_token'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/user/', views.UserView.as_view(), name='user'),
    
    # API router
    path('', include(router.urls)),
]

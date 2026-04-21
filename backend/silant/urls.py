from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
# Добавь сюда импорт новых справочников
from service.api import (
    MachineViewSet, MaintenanceViewSet, ReclamationViewSet,
    FailureNodeViewSet, RecoveryMethodViewSet, MaintTypeViewSet, ServiceCompanyViewSet
)
from service.views import CustomLoginView, CustomLogoutView 
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect

# Настройка роутера для API
router = routers.DefaultRouter()
router.register(r'machines', MachineViewSet, basename='machine')
router.register(r'maintenance', MaintenanceViewSet, basename='maintenance')
router.register(r'reclamations', ReclamationViewSet, basename='reclamations')

router.register(r'failure_node', FailureNodeViewSet, basename='failure_node')
router.register(r'recovery_method', RecoveryMethodViewSet, basename='recovery_method')
router.register(r'maint_type', MaintTypeViewSet, basename='maint_type')
router.register(r'service_company', ServiceCompanyViewSet, basename='service_company')

def redirect_to_index(request):
    return redirect('/')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/login/', CustomLoginView.as_view(), name='custom_login'),
    path('api/logout/', CustomLogoutView.as_view(), name='custom_logout'),
    
    path('api/', include(router.urls)),
    
    path('', include('service.urls')),
    
    # Блокировка лишних страниц allauth
    path('accounts/signup/', redirect_to_index),
    path('accounts/password/change/', redirect_to_index),
    path('accounts/password/set/', redirect_to_index),
    path('accounts/password/reset/', redirect_to_index),
    path('accounts/', include('allauth.urls')),
    
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
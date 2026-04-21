from rest_framework import viewsets, permissions, filters
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Machine, Maintenance, Reclamation, 
    FailureNode, RecoveryMethod, ServiceCompany, MaintType
)
from .serializers import (
    MachineGuestSerializer, MachineFullSerializer, 
    MaintenanceSerializer, ReclamationSerializer, 
    DirectoryDetailSerializer
)
from .permissions import IsClientOrServiceOrManager

class MachineViewSet(viewsets.ModelViewSet):
    queryset = Machine.objects.all().select_related(
        'tech_model', 'engine_model', 'trans_model', 
        'drive_axle_model', 'steer_axle_model', 'service_company'
    )
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = {
        'machine_sn': ['exact'],
        'tech_model__name': ['exact'],
        'engine_model__name': ['exact'],
        'trans_model__name': ['exact'],
        'drive_axle_model__name': ['exact'],
        'steer_axle_model__name': ['exact'],
        'service_company__name': ['exact'],
    }
    ordering_fields = ['shipment_date']
    ordering = ['shipment_date']
    
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return MachineFullSerializer
        return MachineGuestSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return self.queryset
        if user.is_superuser or user.groups.filter(name='Менеджер').exists():
            return self.queryset
        if user.groups.filter(name='Клиент').exists():
            return self.queryset.filter(client=user)
        if user.groups.filter(name='Сервисная организация').exists():
            return self.queryset.filter(service_company__user=user)
        return self.queryset.none()

class MaintenanceViewSet(viewsets.ModelViewSet):
    queryset = Maintenance.objects.all().select_related('maint_type', 'maint_org', 'service_company', 'machine')
    serializer_class = MaintenanceSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsClientOrServiceOrManager]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]

    ordering_fields = ['maint_date']
    ordering = ['maint_date']
    
    filterset_fields = {
        'machine__machine_sn': ['exact'],
        'maint_type__name': ['exact'],
        'service_company__name': ['exact'],
    }
    
    def get_queryset(self):
        user = self.request.user
        qs = self.queryset 
        if user.is_superuser or user.groups.filter(name='Менеджер').exists():
            return qs
        if user.groups.filter(name='Клиент').exists():
            return qs.filter(machine__client=user)
        return qs.filter(service_company__user=user)

class ReclamationViewSet(viewsets.ModelViewSet):
    queryset = Reclamation.objects.all().select_related('failure_node', 'recovery_method', 'service_company', 'machine')
    serializer_class = ReclamationSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsClientOrServiceOrManager]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]

    ordering_fields = ['failure_date']
    ordering = ['failure_date']

    filterset_fields = {
        'machine__machine_sn': ['exact'],
        'failure_node__name': ['exact'],
        'recovery_method__name': ['exact'],
        'service_company__name': ['exact'],
    }

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset
        if user.is_superuser or user.groups.filter(name='Менеджер').exists():
            return qs
        if user.groups.filter(name='Клиент').exists():
            return qs.filter(machine__client=user)
        return qs.filter(service_company__user=user)

# --- СПРАВОЧНИКИ ---

class FailureNodeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FailureNode.objects.all()
    serializer_class = DirectoryDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

class RecoveryMethodViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RecoveryMethod.objects.all()
    serializer_class = DirectoryDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

class MaintTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MaintType.objects.all()
    serializer_class = DirectoryDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

class ServiceCompanyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ServiceCompany.objects.all()
    serializer_class = DirectoryDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
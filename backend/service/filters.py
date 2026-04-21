import django_filters
from .models import Machine, Maintenance, Reclamation

class MachineFilter(django_filters.FilterSet):
    class Meta:
        model = Machine
        fields = {
            'tech_model': ['exact'],
            'engine_model': ['exact'],
            'trans_model': ['exact'],
            'drive_axle_model': ['exact'],
            'steer_axle_model': ['exact'],
        }

class MaintenanceFilter(django_filters.FilterSet):
    class Meta:
        model = Maintenance
        fields = {
            'maint_type': ['exact'],
            'machine__machine_sn': ['icontains'],
            'service_company': ['exact'],
        }

class ReclamationFilter(django_filters.FilterSet):
    class Meta:
        model = Reclamation
        fields = {
            'failure_node': ['exact'],
            'recovery_method': ['exact'],
            'service_company': ['exact'],
        }
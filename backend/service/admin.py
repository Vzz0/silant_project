from django.contrib import admin
from .models import (
    TechModel, EngineModel, TransModel, DriveAxleModel, SteerAxleModel,
    MaintType, FailureNode, RecoveryMethod, ServiceCompany,
    Machine, Maintenance, Reclamation
)

# 1. РЕГИСТРАЦИЯ
@admin.register(
    TechModel, EngineModel, TransModel, DriveAxleModel, SteerAxleModel, 
    MaintType, FailureNode, RecoveryMethod, ServiceCompany
)
class DirectoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

# 2. ОТОБРАЖЕНИЕ МАШИН 
@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display = ('machine_sn', 'tech_model', 'shipment_date', 'client')
    search_fields = ('machine_sn',)
    list_filter = ('tech_model', 'service_company')

# 3. ОТОБРАЖЕНИЕ ТО
@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = ('machine', 'maint_type', 'maint_date', 'service_company')
    list_filter = ('maint_type', 'service_company')

# 4. ОТОБРАЖЕНИЕ РЕКЛАМАЦИЙ
@admin.register(Reclamation)
class ReclamationAdmin(admin.ModelAdmin):
    list_display = ('id', 'machine', 'failure_date', 'recovery_date', 'downtime')
    readonly_fields = ('downtime',)
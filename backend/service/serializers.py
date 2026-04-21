from rest_framework import serializers
from .models import (
    Machine, Maintenance, Reclamation, 
    TechModel
)
from django.contrib.auth.models import User



class UserSerializer(serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )
    class Meta:
        model = User
        fields = ['id', 'username', 'groups', 'is_superuser']

class DirectoryDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechModel
        fields = ['id', 'name', 'description']

# --- СЕРИАЛИЗАТОРЫ ДЛЯ ТО ---
class MaintenanceSerializer(serializers.ModelSerializer):
    machine_sn = serializers.ReadOnlyField(source='machine.machine_sn')
    maint_type_name = serializers.CharField(source='maint_type.name', read_only=True)
    service_company_name = serializers.CharField(source='service_company.name', read_only=True)

    maint_type_info = DirectoryDetailSerializer(source='maint_type', read_only=True)
    maint_org_info = DirectoryDetailSerializer(source='maint_org', read_only=True)
    service_company_info = DirectoryDetailSerializer(source='service_company', read_only=True)

    class Meta:
        model = Maintenance
        fields = '__all__'

# --- СЕРИАЛИЗАТОРЫ ДЛЯ РЕКЛАМАЦИЙ ---
class ReclamationSerializer(serializers.ModelSerializer):
    machine_sn = serializers.ReadOnlyField(source='machine.machine_sn')
    failure_node_name = serializers.CharField(source='failure_node.name', read_only=True)
    
    failure_node_info = DirectoryDetailSerializer(source='failure_node', read_only=True)
    recovery_method_info = DirectoryDetailSerializer(source='recovery_method', read_only=True)
    service_company_info = DirectoryDetailSerializer(source='service_company', read_only=True)

    class Meta:
        model = Reclamation
        fields = '__all__'

# --- СЕРИАЛИЗАТОРЫ ДЛЯ МАШИН ---
class MachineFullSerializer(serializers.ModelSerializer):
    tech_model_info = DirectoryDetailSerializer(source='tech_model', read_only=True)
    engine_model_info = DirectoryDetailSerializer(source='engine_model', read_only=True)
    trans_model_info = DirectoryDetailSerializer(source='trans_model', read_only=True)
    drive_axle_model_info = DirectoryDetailSerializer(source='drive_axle_model', read_only=True)
    steer_axle_model_info = DirectoryDetailSerializer(source='steer_axle_model', read_only=True)
    service_company_info = DirectoryDetailSerializer(source='service_company', read_only=True)

    tech_model = serializers.StringRelatedField()
    engine_model = serializers.StringRelatedField()
    trans_model = serializers.StringRelatedField()
    drive_axle_model = serializers.StringRelatedField()
    steer_axle_model = serializers.StringRelatedField()
    client = serializers.StringRelatedField()
    service_company = serializers.StringRelatedField()
    
    maintenance_history = MaintenanceSerializer(many=True, read_only=True, source='maintenances') 
    reclamation_history = ReclamationSerializer(many=True, read_only=True, source='reclamations')

    class Meta:
        model = Machine
        fields = '__all__' 
class MachineGuestSerializer(serializers.ModelSerializer):
    tech_model = serializers.StringRelatedField()
    engine_model = serializers.StringRelatedField()
    
    class Meta:
        model = Machine 
        fields = [
            'machine_sn', 'tech_model', 'engine_model', 'engine_sn', 
            'trans_model', 'trans_sn', 'drive_axle_model', 'drive_axle_sn', 
            'steer_axle_model', 'steer_axle_sn'
        ]
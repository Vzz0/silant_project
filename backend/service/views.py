from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions 

from .models import Machine, Maintenance, Reclamation
from .filters import MachineFilter, MaintenanceFilter, ReclamationFilter

def index(request):
    if request.headers.get('Accept') == 'application/json' or not request.user.is_authenticated:
        return JsonResponse({"status": "ok", "message": "Silant API is running"})

    search_query = request.GET.get('search')
    context = {}
    
    m_fields = ['tech_model', 'engine_model', 'trans_model', 'drive_axle_model', 'steer_axle_model', 'client', 'service_company']

    if request.user.is_authenticated:
        groups = request.user.groups.values_list('name', flat=True)
        
        if 'Менеджер' in groups or request.user.is_superuser:
            machines_qs = Machine.objects.select_related(*m_fields).all().order_by('shipment_date')
            maint_qs = Maintenance.objects.select_related('machine', 'maint_type', 'service_company').all().order_by('maint_date')
            reclam_qs = Reclamation.objects.select_related('machine', 'failure_node', 'service_company').all().order_by('failure_date')
        
        elif 'Клиент' in groups:
            machines_qs = Machine.objects.select_related(*m_fields).filter(client=request.user).order_by('shipment_date')
            maint_qs = Maintenance.objects.select_related('machine', 'maint_type').filter(machine__client=request.user).order_by('maint_date')
            reclam_qs = Reclamation.objects.select_related('machine', 'failure_node').filter(machine__client=request.user).order_by('failure_date')
        else:
            machines_qs = Machine.objects.none()
            maint_qs = Maintenance.objects.none()
            reclam_qs = Reclamation.objects.none()

        context['filter_machines'] = MachineFilter(request.GET, queryset=machines_qs)
        context['filter_maint'] = MaintenanceFilter(request.GET, queryset=maint_qs)
        context['filter_reclam'] = ReclamationFilter(request.GET, queryset=reclam_qs)
        
        context['machines'] = context['filter_machines'].qs
        context['maintenances'] = context['filter_maint'].qs
        context['reclamations'] = context['filter_reclam'].qs

    if search_query:
        context['search_result'] = Machine.objects.select_related(*m_fields).filter(machine_sn=search_query).first()
    
    try:
        return render(request, 'service/index.html', context)
    except:
        return JsonResponse({"status": "ok", "info": "Template index.html not found, using JSON instead"})

class CustomLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user is not None:
            login(request, user)
            request.session.modified = True
            user_groups = list(user.groups.values_list('name', flat=True))
            return Response({
                "status": "success", 
                "username": user.username,
                "groups": user_groups,
                "is_superuser": user.is_superuser
            })
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class CustomLogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response({"status": "success"})
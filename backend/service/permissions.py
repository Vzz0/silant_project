from rest_framework import permissions
from .models import Maintenance, Reclamation

class IsClientOrServiceOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        # 1.(GET)
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated

        # 2.(POST)
        if request.method == 'POST':
            user_groups = request.user.groups.values_list('name', flat=True)

            # Менеджер — может все
            if 'Менеджер' in user_groups:
                return True
            
            # Клиент — только ТО
            if 'Клиент' in user_groups:
                return isinstance(view.get_queryset().model(), Maintenance)
            
            # Сервисная организация — и ТО, и Рекламации
            if 'Сервисная организация' in user_groups:
                return isinstance(view.get_queryset().model(), (Maintenance, Reclamation))
        
        # 3.(PUT, PATCH, DELETE) — только Менеджеру
        return request.user.groups.filter(name='Менеджер').exists()
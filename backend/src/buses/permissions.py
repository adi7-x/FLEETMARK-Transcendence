from rest_framework.permissions import BasePermission


class CanCrudBus(BasePermission):
    """
    Allows superadmin and orgadmin to perform full CRUD operations on buses.
    Allows passenger and driver to only list and retrieve bus details.
    """
    
    def has_permission(self, request, view):
        # All authenticated users can list and retrieve
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user.is_authenticated
        
        # Only superadmin and orgadmin can create, update, delete
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return (
                request.user.is_authenticated
                and (
                    request.user.is_superuser
                    or request.user.is_org_admin
                )
            )
        
        return False

    def has_object_permission(self, request, view, obj):
        # All authenticated users can view
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user.is_authenticated
        
        # Only superadmin and orgadmin can modify or delete
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return (
                request.user.is_authenticated
                and (
                    request.user.is_superuser
                    or request.user.is_org_admin
                )
            )
        
        return False

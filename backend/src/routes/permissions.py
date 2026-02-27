from rest_framework.permissions import BasePermission


class CanCrudRoute(BasePermission):
    """
    Allows superadmin and orgadmin to perform full CRUD operations on routes.
    Allows passenger and driver to only list and retrieve route details.
    """
    
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user.is_authenticated
        
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
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user.is_authenticated
        
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return (
                request.user.is_authenticated
                and (
                    request.user.is_superuser
                    or request.user.is_org_admin
                )
            )
        
        return False

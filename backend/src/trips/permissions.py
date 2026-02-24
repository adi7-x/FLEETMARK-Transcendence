from rest_framework.permissions import BasePermission


class CanCrudTrip(BasePermission):
    """
    Allows superadmin and orgadmin to perform full CRUD operations on trips.
    Allows passenger and driver to only list and retrieve trip details.
    """
    
    def has_permission(self, request, view):
        # All authenticated users can list and retrieve (GET)
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
        # All authenticated users can view specific trips
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user.is_authenticated
        
        # Only superadmin and orgadmin can modify or delete trips
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return (
                request.user.is_authenticated
                and (
                    request.user.is_superuser
                    or request.user.is_org_admin
                )
            )
        
        return False


class CanManageTripLifecycle(BasePermission):
    """
    Allows superadmin, orgadmin, and drivers to start/end trips.
    This is for the lifecycle operations (start/end endpoints).
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.is_org_admin
                or request.user.is_driver
            )
        )

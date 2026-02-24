from rest_framework.permissions import BasePermission


class CanManageReservation(BasePermission):
    """
    Allows superadmin and orgadmin to perform full CRUD operations on reservations.
    Allows passengers to create and delete reservations.
    Allows drivers to only list and retrieve reservation details.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # All authenticated users can list and retrieve (GET)
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Admins and passengers can create reservations
        if request.method == 'POST':
            return (
                request.user.is_superuser
                or request.user.is_org_admin
                or request.user.is_passenger
            )
        
        # Only admins can update (though the view doesn't support update)
        if request.method in ['PUT', 'PATCH']:
            return (
                request.user.is_superuser
                or request.user.is_org_admin
            )
        
        # Admins and passengers can delete (checked further in has_object_permission)
        if request.method == 'DELETE':
            return (
                request.user.is_superuser
                or request.user.is_org_admin
                or request.user.is_passenger
            )
        
        return False

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # All authenticated users can view specific reservations
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Admins can always modify or delete
        if request.user.is_superuser or request.user.is_org_admin:
            return True
        
        # Passengers can delete reservations
        # Note: In a real system, you'd check if obj.passenger_name matches the user
        # For example: if request.user.is_passenger and obj.passenger_name == request.user.get_full_name()
        if request.method == 'DELETE' and request.user.is_passenger:
            return True
        
        return False

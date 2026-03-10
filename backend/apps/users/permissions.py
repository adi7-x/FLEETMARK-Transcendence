from rest_framework.permissions import BasePermission


class IsLogisticsStaff(BasePermission):
    """Allow access only to users with role=LOGISTICS_STAFF."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'LOGISTICS_STAFF'
        )


class IsStudent(BasePermission):
    """Allow access only to users with role=STUDENT."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'STUDENT'
        )


class IsDriver(BasePermission):
    """Allow access only to users with role=DRIVER."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'DRIVER'
        )

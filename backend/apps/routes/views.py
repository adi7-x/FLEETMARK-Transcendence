from django.apps import apps
from rest_framework import generics, status
from rest_framework.response import Response

from apps.routes.models import Route
from apps.routes.serializers import RouteSerializer
from apps.users.permissions import IsLogisticsStaffOrReadOnly
from rest_framework.permissions import IsAuthenticated


class BaseRouteQuerysetMixin:
	def get_queryset(self):
		return Route.objects.prefetch_related('route_stations__station')


class RouteListCreateView(BaseRouteQuerysetMixin, generics.ListCreateAPIView):
	serializer_class = RouteSerializer
	permission_classes = [IsAuthenticated, IsLogisticsStaffOrReadOnly]


class RouteDetailView(BaseRouteQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
	serializer_class = RouteSerializer
	permission_classes = [IsAuthenticated, IsLogisticsStaffOrReadOnly]

	def delete(self, request, *args, **kwargs):
		instance = self.get_object()
		Trip = apps.get_model('trips', 'Trip')
		if Trip.objects.filter(route=instance).exists():
			return Response(
				{'detail': 'Route is referenced by one or more trips.'},
				status=status.HTTP_400_BAD_REQUEST,
			)
		self.perform_destroy(instance)
		return Response(status=status.HTTP_204_NO_CONTENT)

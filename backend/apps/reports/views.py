from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count
from django.db.models.functions import TruncWeek
from apps.reports.models import IncidentReport
from apps.reports.serializers import ReportSerializer

STAFF_ROLE = 'LOGISTICS_STAFF'

class IncidentReportViewSet(viewsets.ModelViewSet):
	queryset = IncidentReport.objects.all()
	serializer_class = ReportSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		if user.role.upper() == STAFF_ROLE:
			return IncidentReport.objects.all()
		return IncidentReport.objects.filter(reporter=user)

	def perform_create(self, serializer):
		serializer.save(reporter=self.request.user)

	def _check_staff(self, request):
		if request.user.role.upper() != STAFF_ROLE:
			from rest_framework.response import Response as Resp
			from rest_framework import status as st
			return Resp(
				{"detail": "Only staff can update report status."}, 
				status=st.HTTP_403_FORBIDDEN
			)
		return None

	def update(self, request, *args, **kwargs):
		denied = self._check_staff(request)
		if denied:
			return denied
		kwargs['partial'] = True  # always allow partial to avoid requiring all fields
		return super().update(request, *args, **kwargs)

	def partial_update(self, request, *args, **kwargs):
		denied = self._check_staff(request)
		if denied:
			return denied
		return super().partial_update(request, *args, **kwargs)


class AnalyticsView(APIView):
	"""Aggregate analytics for the admin dashboard."""
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		from apps.reservations.models import Reservation
		from apps.routes.models import Route
		from apps.trips.models import Trip

		# Rides per route
		routes = Route.objects.all()
		rides_per_route = []
		for route in routes:
			count = Reservation.objects.filter(trip__route=route).count()
			rides_per_route.append({'route': route.name, 'rides': count})
		rides_per_route.sort(key=lambda x: x['rides'], reverse=True)

		# Weekly ridership (last 8 weeks)
		weekly_qs = (
			Reservation.objects
			.annotate(week=TruncWeek('created_at'))
			.values('week')
			.annotate(riders=Count('id'))
			.order_by('week')
		)[:8]
		weekly_ridership = [
			{'week': entry['week'].strftime('W%U') if entry['week'] else 'W00', 'riders': entry['riders']}
			for entry in weekly_qs
		]
		if not weekly_ridership:
			weekly_ridership = [{'week': 'W01', 'riders': 0}]

		# Stats
		total_rides = Reservation.objects.count()
		total_trips = Trip.objects.count()
		if total_trips > 0:
			avg_occ = int((total_rides / max(total_trips, 1)) * 100 / 50)  # rough %
		else:
			avg_occ = 0
		avg_occ = min(avg_occ, 100)

		most_used = rides_per_route[0]['route'] if rides_per_route else 'N/A'
		peak_hours = '22:00 - 02:00'

		return Response({
			'ridesPerRoute': rides_per_route,
			'weeklyRidership': weekly_ridership,
			'reportStats': {
				'totalRides': total_rides,
				'averageOccupancy': avg_occ,
				'mostUsedRoute': most_used,
				'peakHours': peak_hours,
			}
		})

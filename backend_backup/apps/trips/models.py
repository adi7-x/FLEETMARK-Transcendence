from uuid import uuid4

from django.db import models


class Trip(models.Model):
	"""Represents a scheduled bus trip for a specific route and driver."""

	id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
	route = models.ForeignKey('routes.Route', on_delete=models.PROTECT)
	bus = models.ForeignKey('buses.Bus', on_delete=models.PROTECT)
	driver = models.ForeignKey('drivers.Driver', on_delete=models.PROTECT)
	departure_datetime = models.DateTimeField()
	status = models.CharField(
		max_length=20,
		default='CREATED',
		choices=[('CREATED', 'Created'), ('STARTED', 'Started'), ('ENDED', 'Ended')]
	)
	archived_at = models.DateTimeField(null=True, blank=True, default=None)
	created_at = models.DateTimeField(auto_now_add=True)

	def start(self):
		if self.status != 'CREATED':
			from apps.core.exceptions import LifecycleError
			raise LifecycleError("Trip already started or ended.")
		if self.reservations.count() == 0:
			from apps.core.exceptions import LifecycleError
			raise LifecycleError("Cannot start trip with no reservations.")
		self.status = 'STARTED'
		self.save(update_fields=['status'])

	def end(self):
		if self.status != 'STARTED':
			from apps.core.exceptions import LifecycleError
			raise LifecycleError("Trip is not started or already ended.")
		self.status = 'ENDED'
		self.save(update_fields=['status'])

	def _check_structural_freeze(self):
		if self.status != 'CREATED':
			from apps.core.exceptions import FreezeError
			raise FreezeError("Cannot modify frozen trip.")

	class Meta:
		ordering = ['departure_datetime']

	@property
	def seats_left(self):
		return self.bus.seat_capacity - self.reservations.count()

	def __str__(self):
		return f"{self.route.name} @ {self.departure_datetime.isoformat()}"

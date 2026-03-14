import uuid
from django.db import models

class ScheduleConfig(models.Model):
    """Stores the organization's operating schedule configuration."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_name = models.CharField(max_length=255, default='1337 School')
    start_time = models.CharField(max_length=5, default='22:00')
    end_time = models.CharField(max_length=5, default='06:00')
    overnight = models.BooleanField(default=True)
    active_days = models.JSONField(default=list)  # [true, true, true, true, true, false, false]
    frequency_minutes = models.IntegerField(default=60)
    buses = models.JSONField(default=list)  # [{name, capacity}]
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Schedule: {self.organization_name}"


class StoppedPeriod(models.Model):
    """A break period within the operating schedule."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    schedule = models.ForeignKey(ScheduleConfig, on_delete=models.CASCADE, related_name='stopped_periods')
    start_time = models.CharField(max_length=5)
    end_time = models.CharField(max_length=5)
    reason = models.CharField(max_length=255, blank=True, default='')

    def __str__(self):
        return f"{self.start_time} - {self.end_time}: {self.reason}"

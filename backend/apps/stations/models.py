from uuid import uuid4

from django.db import models


class Station(models.Model):
    """Station model - full implementation will be added in the next session."""
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

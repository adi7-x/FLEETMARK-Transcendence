from rest_framework import status


class DomainError(Exception):
	"""Base class for all domain/business-logic errors."""
	default_message = 'Domain error'
	default_code = 'domain_error'
	status_code = status.HTTP_400_BAD_REQUEST

	def __init__(self, message=None, code=None, status_code=None):
		self.message = message or self.default_message
		self.code = code or self.default_code
		if status_code is not None:
			self.status_code = status_code
		super().__init__(self.message)


class CapacityError(DomainError):
	"""Raised when a trip has no seats left."""
	default_message = 'No seats available'
	default_code = 'capacity_error'
	status_code = status.HTTP_409_CONFLICT


class LifecycleError(DomainError):
	"""Raised when an operation is invalid for the current state."""
	default_message = 'Invalid lifecycle operation'
	default_code = 'lifecycle_error'
	status_code = status.HTTP_400_BAD_REQUEST


class FreezeError(DomainError):
	"""Raised when attempting to modify a frozen structure."""
	default_message = 'Structure is frozen and cannot be modified'
	default_code = 'freeze_error'
	status_code = status.HTTP_409_CONFLICT

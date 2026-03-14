import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ssbs.settings')
django.setup()
from apps.trips.views import TripListCreateView
print(TripListCreateView.permission_classes)

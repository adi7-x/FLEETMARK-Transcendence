from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from buses.models import Bus
from core.exceptions import FreezeError
from routes.models import Route


class BusModelTests(TestCase):
    def test_str_representation(self):
        bus = Bus.objects.create(matricule="BUS-01", capacity=40)
        self.assertEqual(str(bus), "Bus BUS-01")

    def test_can_update_when_not_assigned_to_any_route(self):
        bus = Bus.objects.create(matricule="BUS-02", capacity=20)
        bus.capacity = 30
        bus.save()
        bus.refresh_from_db()
        self.assertEqual(bus.capacity, 30)

    def test_cannot_update_when_assigned_to_route(self):
        bus = Bus.objects.create(matricule="BUS-03", capacity=20)
        Route.objects.create(bus=bus, direction="A -> B")

        bus.capacity = 25
        with self.assertRaises(FreezeError):
            bus.save()


class BusApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.bus = Bus.objects.create(matricule="BUS-10", capacity=50)

    def test_list_buses(self):
        response = self.client.get("/api/v1/buses/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_bus_success(self):
        response = self.client.post(
            "/api/v1/buses/",
            {"matricule": "BUS-11", "capacity": 45},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Bus.objects.filter(matricule="BUS-11").exists())

    def test_create_bus_rejects_non_positive_capacity(self):
        response = self.client.post(
            "/api/v1/buses/",
            {"matricule": "BUS-12", "capacity": 0},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("capacity", response.data)

    def test_retrieve_bus_success(self):
        response = self.client.get(f"/api/v1/buses/{self.bus.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.bus.id)

    def test_retrieve_bus_not_found(self):
        response = self.client.get("/api/v1/buses/999999/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_bus_success_when_free(self):
        response = self.client.put(
            f"/api/v1/buses/{self.bus.id}/",
            {"matricule": "BUS-10-NEW", "capacity": 60},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.bus.refresh_from_db()
        self.assertEqual(self.bus.capacity, 60)

    def test_update_bus_rejects_when_assigned(self):
        Route.objects.create(bus=self.bus, direction="C -> D")
        response = self.client.put(
            f"/api/v1/buses/{self.bus.id}/",
            {"matricule": "BUS-10", "capacity": 55},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data["code"], "freeze_error")

    def test_delete_bus_success_when_free(self):
        response = self.client.delete(f"/api/v1/buses/{self.bus.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Bus.objects.filter(id=self.bus.id).exists())

    def test_delete_bus_rejects_when_assigned(self):
        Route.objects.create(bus=self.bus, direction="X -> Y")
        response = self.client.delete(f"/api/v1/buses/{self.bus.id}/")
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data["code"], "protected_delete")


class BusPermissionTests(TestCase):
    """Test role-based access control for Bus endpoints."""
    
    def setUp(self):
        self.client = APIClient()
        
        # Create users with different roles
        self.superadmin = User.objects.create_superuser(
            username="superadmin", 
            password="pass123",
            role="admin"
        )
        self.orgadmin = User.objects.create_user(
            username="orgadmin",
            password="pass123",
            role="admin"
        )
        self.driver = User.objects.create_user(
            username="driver",
            password="pass123",
            role="driver"
        )
        self.passenger = User.objects.create_user(
            username="passenger",
            password="pass123",
            role="passenger"
        )
        
        # Create test bus
        self.bus = Bus.objects.create(matricule="TEST-BUS", capacity=50)
    
    def test_superadmin_can_list_buses(self):
        self.client.force_authenticate(user=self.superadmin)
        response = self.client.get("/api/v1/buses/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_orgadmin_can_list_buses(self):
        self.client.force_authenticate(user=self.orgadmin)
        response = self.client.get("/api/v1/buses/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_driver_can_list_buses(self):
        self.client.force_authenticate(user=self.driver)
        response = self.client.get("/api/v1/buses/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_passenger_can_list_buses(self):
        self.client.force_authenticate(user=self.passenger)
        response = self.client.get("/api/v1/buses/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_unauthenticated_cannot_list_buses(self):
        response = self.client.get("/api/v1/buses/")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
    
    def test_superadmin_can_create_bus(self):
        self.client.force_authenticate(user=self.superadmin)
        response = self.client.post(
            "/api/v1/buses/",
            {"matricule": "NEW-BUS-1", "capacity": 40},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_orgadmin_can_create_bus(self):
        self.client.force_authenticate(user=self.orgadmin)
        response = self.client.post(
            "/api/v1/buses/",
            {"matricule": "NEW-BUS-2", "capacity": 40},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_driver_cannot_create_bus(self):
        self.client.force_authenticate(user=self.driver)
        response = self.client.post(
            "/api/v1/buses/",
            {"matricule": "NEW-BUS-3", "capacity": 40},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_passenger_cannot_create_bus(self):
        self.client.force_authenticate(user=self.passenger)
        response = self.client.post(
            "/api/v1/buses/",
            {"matricule": "NEW-BUS-4", "capacity": 40},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_superadmin_can_update_bus(self):
        self.client.force_authenticate(user=self.superadmin)
        response = self.client.put(
            f"/api/v1/buses/{self.bus.id}/",
            {"matricule": "UPDATED-BUS", "capacity": 60},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_orgadmin_can_update_bus(self):
        self.client.force_authenticate(user=self.orgadmin)
        response = self.client.put(
            f"/api/v1/buses/{self.bus.id}/",
            {"matricule": "UPDATED-BUS-2", "capacity": 55},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_driver_cannot_update_bus(self):
        self.client.force_authenticate(user=self.driver)
        response = self.client.put(
            f"/api/v1/buses/{self.bus.id}/",
            {"matricule": "UPDATED-BUS-3", "capacity": 55},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_passenger_cannot_update_bus(self):
        self.client.force_authenticate(user=self.passenger)
        response = self.client.put(
            f"/api/v1/buses/{self.bus.id}/",
            {"matricule": "UPDATED-BUS-4", "capacity": 55},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_superadmin_can_delete_bus(self):
        bus = Bus.objects.create(matricule="DEL-BUS-1", capacity=30)
        self.client.force_authenticate(user=self.superadmin)
        response = self.client.delete(f"/api/v1/buses/{bus.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_orgadmin_can_delete_bus(self):
        bus = Bus.objects.create(matricule="DEL-BUS-2", capacity=30)
        self.client.force_authenticate(user=self.orgadmin)
        response = self.client.delete(f"/api/v1/buses/{bus.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_driver_cannot_delete_bus(self):
        self.client.force_authenticate(user=self.driver)
        response = self.client.delete(f"/api/v1/buses/{self.bus.id}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_passenger_cannot_delete_bus(self):
        self.client.force_authenticate(user=self.passenger)
        response = self.client.delete(f"/api/v1/buses/{self.bus.id}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


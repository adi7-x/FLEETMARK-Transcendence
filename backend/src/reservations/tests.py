from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from buses.models import Bus
from reservations.models import Reservation
from routes.models import Route
from trips.models import Trip


class ReservationModelTests(TestCase):
    def test_str_representation_uses_user(self):
        bus = Bus.objects.create(matricule="RS-01", capacity=5)
        route = Route.objects.create(bus=bus, direction="R1 -> R2")
        trip = Trip.objects.create(route=route, depart_time=timezone.now())
        user = get_user_model().objects.create_user(
            username="mina",
            first_name="Mina",
            last_name="Salah",
            password="password123",
        )
        reservation = Reservation.objects.create(trip=trip, user=user)
        self.assertEqual(str(reservation), f"Mina Salah (Passenger) -> Trip {trip.id}")


class ReservationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.bus = Bus.objects.create(matricule="RS-10", capacity=2)
        self.route = Route.objects.create(bus=self.bus, direction="Alpha -> Beta")
        self.trip = Trip.objects.create(route=self.route, depart_time=timezone.now())
        self.user = get_user_model().objects.create_user(
            username="sara",
            first_name="Sara",
            last_name="Omar",
            password="password123",
        )
        self.other_user = get_user_model().objects.create_user(
            username="ali",
            first_name="Ali",
            last_name="Karim",
            password="password123",
        )

    def test_list_reservations(self):
        Reservation.objects.create(trip=self.trip, user=self.user)
        response = self.client.get("/api/v1/reservations/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_reservation_success(self):
        response = self.client.post(
            "/api/v1/reservations/",
            {"trip": self.trip.id, "user": self.user.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Reservation.objects.filter(user=self.user).exists())

    def test_create_reservation_rejects_invalid_trip(self):
        response = self.client.post(
            "/api/v1/reservations/",
            {"trip": 999999, "user": self.user.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("trip", response.data)

    def test_create_reservation_rejects_missing_user(self):
        response = self.client.post(
            "/api/v1/reservations/",
            {"trip": self.trip.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("user", response.data)

    def test_create_reservation_rejects_started_trip(self):
        Reservation.objects.create(trip=self.trip, user=self.other_user)
        self.trip.start()
        response = self.client.post(
            "/api/v1/reservations/",
            {"trip": self.trip.id, "user": self.user.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["code"], "lifecycle_error")

    def test_create_reservation_rejects_ended_trip(self):
        Reservation.objects.create(trip=self.trip, user=self.other_user)
        self.trip.start()
        self.trip.end()
        response = self.client.post(
            "/api/v1/reservations/",
            {"trip": self.trip.id, "user": self.user.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["code"], "lifecycle_error")

    def test_create_reservation_rejects_full_trip(self):
        one_seat_bus = Bus.objects.create(matricule="RS-11", capacity=1)
        one_seat_route = Route.objects.create(bus=one_seat_bus, direction="One -> Two")
        one_seat_trip = Trip.objects.create(route=one_seat_route, depart_time=timezone.now())
        Reservation.objects.create(trip=one_seat_trip, user=self.other_user)

        response = self.client.post(
            "/api/v1/reservations/",
            {"trip": one_seat_trip.id, "user": self.user.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data["code"], "capacity_error")

    def test_create_reservation_rejects_duplicate_user_on_same_trip(self):
        Reservation.objects.create(trip=self.trip, user=self.user)
        response = self.client.post(
            "/api/v1/reservations/",
            {"trip": self.trip.id, "user": self.user.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data)

    def test_retrieve_reservation_success(self):
        reservation = Reservation.objects.create(trip=self.trip, user=self.user)
        response = self.client.get(f"/api/v1/reservations/{reservation.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], reservation.id)
        self.assertEqual(response.data["user"], self.user.id)
        self.assertEqual(response.data["user_name"], "Sara Omar")
        self.assertEqual(response.data["user_role"], "Passenger")

    def test_retrieve_reservation_shows_user_name_when_user_is_linked(self):
        reservation = Reservation.objects.create(
            trip=self.trip,
            user=self.user,
        )
        response = self.client.get(f"/api/v1/reservations/{reservation.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"], self.user.id)
        self.assertEqual(response.data["user_name"], "Sara Omar")
        self.assertEqual(response.data["user_role"], "Passenger")

    def test_retrieve_reservation_not_found(self):
        response = self.client.get("/api/v1/reservations/999999/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_reservation_success(self):
        reservation = Reservation.objects.create(trip=self.trip, user=self.user)
        response = self.client.delete(f"/api/v1/reservations/{reservation.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Reservation.objects.filter(id=reservation.id).exists())

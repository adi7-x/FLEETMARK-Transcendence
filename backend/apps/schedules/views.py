from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.schedules.models import ScheduleConfig, StoppedPeriod
from apps.schedules.serializers import ScheduleConfigSerializer, StoppedPeriodSerializer
from apps.users.permissions import IsLogisticsStaff


class ScheduleConfigView(APIView):
    """GET the current schedule, PUT/PATCH to update it."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        config = ScheduleConfig.objects.first()
        if not config:
            # Auto-create default 1337 config
            config = ScheduleConfig.objects.create(
                organization_name='1337 School',
                start_time='22:00',
                end_time='06:00',
                overnight=True,
                active_days=[True, True, True, True, True, False, False],
                frequency_minutes=60,
                buses=[
                    {'name': '1337 Express A', 'capacity': 50},
                    {'name': '1337 Express B', 'capacity': 50},
                ],
            )
            StoppedPeriod.objects.create(
                schedule=config,
                start_time='02:00',
                end_time='03:00',
                reason='Low demand break',
            )
        serializer = ScheduleConfigSerializer(config)
        return Response(serializer.data)

    def put(self, request):
        config = ScheduleConfig.objects.first()
        if not config:
            config = ScheduleConfig()
        serializer = ScheduleConfigSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    patch = put  # alias


class StoppedPeriodListCreateView(generics.ListCreateAPIView):
    serializer_class = StoppedPeriodSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        config = ScheduleConfig.objects.first()
        if not config:
            return StoppedPeriod.objects.none()
        return StoppedPeriod.objects.filter(schedule=config)

    def perform_create(self, serializer):
        config = ScheduleConfig.objects.first()
        serializer.save(schedule=config)


class StoppedPeriodDeleteView(generics.DestroyAPIView):
    serializer_class = StoppedPeriodSerializer
    permission_classes = [IsAuthenticated]
    queryset = StoppedPeriod.objects.all()

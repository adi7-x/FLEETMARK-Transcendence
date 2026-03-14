from rest_framework import serializers
from apps.schedules.models import ScheduleConfig, StoppedPeriod


class StoppedPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoppedPeriod
        fields = ['id', 'start_time', 'end_time', 'reason']


class ScheduleConfigSerializer(serializers.ModelSerializer):
    stopped_periods = StoppedPeriodSerializer(many=True, read_only=True)

    class Meta:
        model = ScheduleConfig
        fields = [
            'id', 'organization_name',
            'start_time', 'end_time', 'overnight',
            'active_days', 'frequency_minutes', 'buses',
            'stopped_periods', 'updated_at',
        ]

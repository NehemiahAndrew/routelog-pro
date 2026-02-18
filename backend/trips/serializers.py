from rest_framework import serializers
from .models import Trip, DriverProfile


class DriverProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverProfile
        fields = '__all__'


class TripInputSerializer(serializers.Serializer):
    current_location = serializers.CharField(max_length=300)
    pickup_location = serializers.CharField(max_length=300)
    dropoff_location = serializers.CharField(max_length=300)
    current_cycle_used = serializers.FloatField(min_value=0, max_value=70)


class TripSerializer(serializers.ModelSerializer):
    route_data = serializers.SerializerMethodField()
    stops_data = serializers.SerializerMethodField()
    timeline_data = serializers.SerializerMethodField()
    log_sheets_data = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = '__all__'

    def get_route_data(self, obj):
        return obj.get_route_data()

    def get_stops_data(self, obj):
        return obj.get_stops_data()

    def get_timeline_data(self, obj):
        return obj.get_timeline_data()

    def get_log_sheets_data(self, obj):
        return obj.get_log_sheets_data()

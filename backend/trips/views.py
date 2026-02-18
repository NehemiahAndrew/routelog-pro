from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import json

from .models import Trip, DriverProfile
from .serializers import TripSerializer, TripInputSerializer, DriverProfileSerializer
from .route_engine import calculate_trip


class DriverProfileViewSet(viewsets.ModelViewSet):
    queryset = DriverProfile.objects.all()
    serializer_class = DriverProfileSerializer

    def list(self, request):
        profile = DriverProfile.objects.first()
        if not profile:
            profile = DriverProfile.objects.create()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    def update(self, request, pk=None):
        profile = DriverProfile.objects.first()
        if not profile:
            profile = DriverProfile.objects.create()
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer


@api_view(['POST'])
def generate_trip(request):
    """Generate a complete trip with route, timeline, and ELD logs."""
    serializer = TripInputSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    result = calculate_trip(
        current_location=data['current_location'],
        pickup_location=data['pickup_location'],
        dropoff_location=data['dropoff_location'],
        current_cycle_used=data['current_cycle_used'],
    )

    # Save trip to database
    trip = Trip.objects.create(
        current_location=result['current_location'],
        pickup_location=result['pickup_location'],
        dropoff_location=result['dropoff_location'],
        current_cycle_used=result['current_cycle_used'],
        current_lat=result['current_lat'],
        current_lng=result['current_lng'],
        pickup_lat=result['pickup_lat'],
        pickup_lng=result['pickup_lng'],
        dropoff_lat=result['dropoff_lat'],
        dropoff_lng=result['dropoff_lng'],
        total_distance=result['total_distance'],
        estimated_driving_hours=result['estimated_driving_hours'],
        total_days=result['total_days'],
        fuel_stops=result['fuel_stops'],
        remaining_cycle_hours=result['remaining_cycle_hours'],
        route_data=json.dumps(result['route_data']),
        stops_data=json.dumps(result['stops_data']),
        timeline_data=json.dumps(result['timeline_data']),
        log_sheets_data=json.dumps(result['log_sheets_data']),
        status='active',
    )

    trip_serializer = TripSerializer(trip)
    return Response(trip_serializer.data, status=status.HTTP_201_CREATED)

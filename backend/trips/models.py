from django.db import models
import json


class DriverProfile(models.Model):
    driver_name = models.CharField(max_length=200, default='John Doe')
    license_number = models.CharField(max_length=50, blank=True)
    carrier_name = models.CharField(max_length=200, default='ABC Trucking Co.')
    carrier_dot = models.CharField(max_length=20, blank=True)
    truck_number = models.CharField(max_length=50, default='T-1001')
    trailer_number = models.CharField(max_length=50, blank=True)
    home_terminal = models.CharField(max_length=200, blank=True)
    cycle_rule = models.CharField(max_length=20, default='70hr/8day')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.driver_name} - {self.carrier_name}"


class Trip(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]

    current_location = models.CharField(max_length=300)
    pickup_location = models.CharField(max_length=300)
    dropoff_location = models.CharField(max_length=300)
    current_cycle_used = models.FloatField(default=0)

    current_lat = models.FloatField(null=True, blank=True)
    current_lng = models.FloatField(null=True, blank=True)
    pickup_lat = models.FloatField(null=True, blank=True)
    pickup_lng = models.FloatField(null=True, blank=True)
    dropoff_lat = models.FloatField(null=True, blank=True)
    dropoff_lng = models.FloatField(null=True, blank=True)

    total_distance = models.FloatField(null=True, blank=True)
    estimated_driving_hours = models.FloatField(null=True, blank=True)
    total_days = models.IntegerField(null=True, blank=True)
    fuel_stops = models.IntegerField(null=True, blank=True)
    remaining_cycle_hours = models.FloatField(null=True, blank=True)

    route_data = models.TextField(blank=True, default='[]')
    stops_data = models.TextField(blank=True, default='[]')
    timeline_data = models.TextField(blank=True, default='[]')
    log_sheets_data = models.TextField(blank=True, default='[]')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Trip: {self.current_location} → {self.dropoff_location}"

    def get_route_data(self):
        return json.loads(self.route_data) if self.route_data else []

    def get_stops_data(self):
        return json.loads(self.stops_data) if self.stops_data else []

    def get_timeline_data(self):
        return json.loads(self.timeline_data) if self.timeline_data else []

    def get_log_sheets_data(self):
        return json.loads(self.log_sheets_data) if self.log_sheets_data else []

    class Meta:
        ordering = ['-created_at']

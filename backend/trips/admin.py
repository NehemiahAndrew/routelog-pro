from django.contrib import admin
from .models import Trip, DriverProfile

@admin.register(DriverProfile)
class DriverProfileAdmin(admin.ModelAdmin):
    list_display = ('driver_name', 'carrier_name', 'truck_number')

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('current_location', 'dropoff_location', 'total_distance', 'status', 'created_at')
    list_filter = ('status',)

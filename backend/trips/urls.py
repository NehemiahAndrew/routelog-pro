from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'trips', views.TripViewSet)
router.register(r'profile', views.DriverProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('generate-trip/', views.generate_trip, name='generate-trip'),
]

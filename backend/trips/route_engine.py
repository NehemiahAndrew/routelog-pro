"""
RouteLog Pro — Route Calculation & HOS Compliance Engine

FMCSA HOS Rules (Property-Carrying):
- 11-Hour Driving Limit: May drive max 11 hours after 10 consecutive hours off duty.
- 14-Hour Duty Window: Cannot drive beyond 14th consecutive hour after coming on duty following 10+ hours off.
- 30-Minute Break: Must take a 30-min break after 8 cumulative hours of driving.
- 70-Hour / 8-Day Limit: Cannot drive after 70 hours on-duty in 8 consecutive days.
- Fueling: At least once every 1,000 miles.
- 1 hour for pickup, 1 hour for drop-off.
"""

import math
import json
import urllib.request
import urllib.parse
from datetime import datetime, timedelta


# ─── Geocoding fallback with known US cities ────────────────────────────────
CITY_COORDS = {
    'new york': (40.7128, -74.0060),
    'new york city': (40.7128, -74.0060),
    'nyc': (40.7128, -74.0060),
    'los angeles': (34.0522, -118.2437),
    'la': (34.0522, -118.2437),
    'chicago': (41.8781, -87.6298),
    'houston': (29.7604, -95.3698),
    'phoenix': (33.4484, -112.0740),
    'philadelphia': (39.9526, -75.1652),
    'san antonio': (29.4241, -98.4936),
    'san diego': (32.7157, -117.1611),
    'dallas': (32.7767, -96.7970),
    'san jose': (37.3382, -121.8863),
    'austin': (30.2672, -97.7431),
    'jacksonville': (30.3322, -81.6557),
    'fort worth': (32.7555, -97.3308),
    'columbus': (39.9612, -82.9988),
    'charlotte': (35.2271, -80.8431),
    'san francisco': (37.7749, -122.4194),
    'indianapolis': (39.7684, -86.1581),
    'seattle': (47.6062, -122.3321),
    'denver': (39.7392, -104.9903),
    'washington': (38.9072, -77.0369),
    'washington dc': (38.9072, -77.0369),
    'dc': (38.9072, -77.0369),
    'nashville': (36.1627, -86.7816),
    'oklahoma city': (35.4676, -97.5164),
    'el paso': (31.7619, -106.4850),
    'boston': (42.3601, -71.0589),
    'portland': (45.5152, -122.6784),
    'las vegas': (36.1699, -115.1398),
    'memphis': (35.1495, -90.0490),
    'louisville': (38.2527, -85.7585),
    'baltimore': (39.2904, -76.6122),
    'milwaukee': (43.0389, -87.9065),
    'albuquerque': (35.0844, -106.6504),
    'tucson': (32.2226, -110.9747),
    'fresno': (36.7378, -119.7871),
    'sacramento': (38.5816, -121.4944),
    'mesa': (33.4152, -111.8315),
    'kansas city': (39.0997, -94.5786),
    'atlanta': (33.7490, -84.3880),
    'omaha': (41.2565, -95.9345),
    'colorado springs': (38.8339, -104.8214),
    'raleigh': (35.7796, -78.6382),
    'miami': (25.7617, -80.1918),
    'cleveland': (41.4993, -81.6944),
    'tulsa': (36.1540, -95.9928),
    'oakland': (37.8044, -122.2712),
    'minneapolis': (44.9778, -93.2650),
    'tampa': (27.9506, -82.4572),
    'arlington': (32.7357, -97.1081),
    'new orleans': (29.9511, -90.0715),
    'bakersfield': (35.3733, -119.0187),
    'wichita': (37.6872, -97.3301),
    'aurora': (39.7294, -104.8319),
    'anaheim': (33.8366, -117.9143),
    'st. louis': (38.6270, -90.1994),
    'saint louis': (38.6270, -90.1994),
    'st louis': (38.6270, -90.1994),
    'pittsburgh': (40.4406, -79.9959),
    'cincinnati': (39.1031, -84.5120),
    'lexington': (38.0406, -84.5037),
    'anchorage': (61.2181, -149.9003),
    'stockton': (37.9577, -121.2908),
    'corpus christi': (27.8006, -97.3964),
    'henderson': (36.0395, -114.9817),
    'riverside': (33.9806, -117.3755),
    'newark': (40.7357, -74.1724),
    'st. paul': (44.9537, -93.0900),
    'salt lake city': (40.7608, -111.8910),
    'norfolk': (36.8508, -76.2859),
    'orlando': (28.5383, -81.3792),
    'detroit': (42.3314, -83.0458),
    'laredo': (27.5036, -99.5076),
    'madison': (43.0731, -89.4012),
    'boise': (43.6150, -116.2023),
    'richmond': (37.5407, -77.4360),
    'spokane': (47.6588, -117.4260),
    'des moines': (41.5868, -93.6250),
    'montgomery': (32.3668, -86.3000),
    'little rock': (34.7465, -92.2896),
    'birmingham': (33.5207, -86.8025),
    'buffalo': (42.8864, -78.8784),
    'rochester': (43.1566, -77.6088),
    'hartford': (41.7658, -72.6734),
    'providence': (41.8240, -71.4128),
    'jackson': (32.2988, -90.1848),
    'knoxville': (35.9606, -83.9207),
    'chattanooga': (35.0456, -85.3097),
    'shreveport': (32.5252, -93.7502),
    'savannah': (32.0809, -81.0912),
    'charleston': (32.7765, -79.9311),
    'columbia': (34.0007, -81.0348),
    'fargo': (46.8772, -96.7898),
    'sioux falls': (43.5460, -96.7313),
    'rapid city': (44.0805, -103.2310),
    'cheyenne': (41.1400, -104.8202),
    'billings': (45.7833, -108.5007),
    'missoula': (46.8721, -113.9940),
    'reno': (39.5296, -119.8138),
    'baton rouge': (30.4515, -91.1871),
    'tallahassee': (30.4383, -84.2807),
    'honolulu': (21.3069, -157.8583),
}


def geocode_location(location_str):
    """Geocode a location string to lat/lng coordinates."""
    normalized = location_str.strip().lower()
    # Remove state abbreviations and common suffixes
    for suffix in [', usa', ', us', ', united states']:
        normalized = normalized.replace(suffix, '')
    normalized = normalized.strip().rstrip(',')

    # Try direct match
    if normalized in CITY_COORDS:
        return CITY_COORDS[normalized]

    # Try matching just the city name (before comma)
    city_part = normalized.split(',')[0].strip()
    if city_part in CITY_COORDS:
        return CITY_COORDS[city_part]

    # Try partial matching
    for city, coords in CITY_COORDS.items():
        if city in normalized or normalized in city:
            return coords

    # Default fallback — return a position in central US
    return (39.8283, -98.5795)


def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in miles."""
    R = 3959  # Earth's radius in miles
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    return R * c


def interpolate_point(lat1, lon1, lat2, lon2, fraction):
    """Interpolate a point between two coordinates."""
    lat = lat1 + (lat2 - lat1) * fraction
    lon = lon1 + (lon2 - lon1) * fraction
    return (lat, lon)


def decode_polyline(encoded):
    """Decode a Google-encoded polyline string into a list of [lat, lng] pairs."""
    decoded = []
    idx, lat, lng = 0, 0, 0
    while idx < len(encoded):
        # Latitude
        shift, result = 0, 0
        while True:
            b = ord(encoded[idx]) - 63
            idx += 1
            result |= (b & 0x1F) << shift
            shift += 5
            if b < 0x20:
                break
        lat += (~(result >> 1) if result & 1 else result >> 1)
        # Longitude
        shift, result = 0, 0
        while True:
            b = ord(encoded[idx]) - 63
            idx += 1
            result |= (b & 0x1F) << shift
            shift += 5
            if b < 0x20:
                break
        lng += (~(result >> 1) if result & 1 else result >> 1)
        decoded.append([lat / 1e5, lng / 1e5])
    return decoded


def get_osrm_route(coords_list):
    """
    Fetch a real road-following route from the free OSRM API.
    
    Args:
        coords_list: List of (lat, lng) tuples
    
    Returns:
        dict with 'route_points' (list of [lat,lng]), 
                   'distances' (list of leg distances in miles),
                   'durations' (list of leg durations in hours),
        or None on failure.
    """
    try:
        # OSRM expects lng,lat (not lat,lng)
        coords_str = ';'.join(f'{lng},{lat}' for lat, lng in coords_list)
        url = (
            f'https://router.project-osrm.org/route/v1/driving/{coords_str}'
            f'?overview=full&geometries=polyline&steps=false'
        )
        req = urllib.request.Request(url, headers={'User-Agent': 'RouteLogPro/1.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())

        if data.get('code') != 'Ok' or not data.get('routes'):
            return None

        route = data['routes'][0]
        geometry = route.get('geometry', '')
        route_points = decode_polyline(geometry) if geometry else []

        # Extract per-leg distances (meters → miles) and durations (seconds → hours)
        distances = []
        durations = []
        for leg in route.get('legs', []):
            distances.append(leg['distance'] * 0.000621371)  # meters to miles
            durations.append(leg['duration'] / 3600)          # seconds to hours

        return {
            'route_points': route_points,
            'distances': distances,
            'durations': durations,
            'total_distance': sum(distances),
            'total_duration': sum(durations),
        }
    except Exception as e:
        print(f'[RouteLog] OSRM API unavailable, using fallback: {e}')
        return None


def generate_route_points_fallback(coords_list, num_points=50):
    """Fallback: generate a simulated route polyline when OSRM is unavailable."""
    if len(coords_list) < 2:
        return coords_list

    route_points = []
    total_segments = len(coords_list) - 1

    for seg_idx in range(total_segments):
        lat1, lon1 = coords_list[seg_idx]
        lat2, lon2 = coords_list[seg_idx + 1]
        points_in_segment = max(num_points // total_segments, 5)

        for i in range(points_in_segment):
            fraction = i / points_in_segment
            # Add slight curve for visual realism
            mid_offset = math.sin(fraction * math.pi) * 0.3
            lat = lat1 + (lat2 - lat1) * fraction + mid_offset * (lon2 - lon1) * 0.01
            lon = lon1 + (lon2 - lon1) * fraction - mid_offset * (lat2 - lat1) * 0.01
            route_points.append([lat, lon])

    route_points.append(list(coords_list[-1]))
    return route_points


def calculate_trip(current_location, pickup_location, dropoff_location, current_cycle_used):
    """
    Main trip calculation engine.

    Returns complete trip data including route, stops, timeline, and ELD logs.
    """
    # ─── Geocode all locations ──────────────────────────────────────
    current_coords = geocode_location(current_location)
    pickup_coords = geocode_location(pickup_location)
    dropoff_coords = geocode_location(dropoff_location)

    # ─── Fetch real road route from OSRM ────────────────────────────
    waypoints = [current_coords, pickup_coords, dropoff_coords]
    osrm_result = get_osrm_route(waypoints)
    use_osrm = osrm_result is not None

    if use_osrm:
        dist_to_pickup = osrm_result['distances'][0]
        dist_pickup_to_dropoff = osrm_result['distances'][1]
        total_distance = osrm_result['total_distance']
        osrm_route_points = osrm_result['route_points']
    else:
        # Fallback: haversine × road factor
        dist_to_pickup = haversine_distance(
            current_coords[0], current_coords[1],
            pickup_coords[0], pickup_coords[1]
        )
        dist_pickup_to_dropoff = haversine_distance(
            pickup_coords[0], pickup_coords[1],
            dropoff_coords[0], dropoff_coords[1]
        )
        road_factor = 1.3
        dist_to_pickup *= road_factor
        dist_pickup_to_dropoff *= road_factor
        total_distance = dist_to_pickup + dist_pickup_to_dropoff
        osrm_route_points = None

    # ─── Driving calculations ───────────────────────────────────────
    avg_speed = 55  # mph
    driving_hours_to_pickup = dist_to_pickup / avg_speed
    driving_hours_to_dropoff = dist_pickup_to_dropoff / avg_speed
    total_driving_hours = driving_hours_to_pickup + driving_hours_to_dropoff

    # ─── Fuel stops (every 1000 miles) ──────────────────────────────
    fuel_stops_count = max(0, int(total_distance / 1000))

    # ─── HOS Compliance Calculations ────────────────────────────────
    cycle_limit = 70.0
    daily_drive_limit = 11.0
    duty_window = 14.0
    break_interval = 8.0
    rest_period = 10.0
    remaining_cycle = cycle_limit - current_cycle_used

    # ─── Build detailed timeline ────────────────────────────────────
    timeline = []
    log_sheets = []
    stops = []

    start_time = datetime(2026, 2, 18, 6, 0)  # Start at 6 AM
    current_time = start_time
    hours_driven_today = 0.0
    hours_on_duty_today = 0.0
    hours_since_break = 0.0
    hours_in_cycle = current_cycle_used
    remaining_driving = total_driving_hours
    miles_since_fuel = 0.0
    current_day = 1
    current_pos = current_coords
    reached_pickup = False
    reached_dropoff = False
    pickup_done = False
    dropoff_done = False

    day_log = {
        'day': current_day,
        'date': current_time.strftime('%Y-%m-%d'),
        'segments': [],
        'total_driving': 0,
        'total_on_duty': 0,
        'total_off_duty': 0,
        'total_sleeper': 0,
        'miles_driven': 0,
        'remarks': [],
    }

    def add_log_segment(status, start, end, remark=''):
        duration = (end - start).total_seconds() / 3600
        day_log['segments'].append({
            'status': status,
            'start_hour': start.hour + start.minute / 60,
            'end_hour': end.hour + end.minute / 60,
            'duration': round(duration, 2),
            'start_time': start.strftime('%H:%M'),
            'end_time': end.strftime('%H:%M'),
        })
        if status == 'driving':
            day_log['total_driving'] += duration
        elif status == 'on_duty':
            day_log['total_on_duty'] += duration
        elif status == 'sleeper':
            day_log['total_sleeper'] += duration
        elif status == 'off_duty':
            day_log['total_off_duty'] += duration
        if remark:
            day_log['remarks'].append(remark)

    def start_new_day():
        nonlocal current_day, hours_driven_today, hours_on_duty_today, hours_since_break, day_log
        # Save current day log
        log_sheets.append(day_log)
        current_day += 1
        hours_driven_today = 0.0
        hours_on_duty_today = 0.0
        hours_since_break = 0.0
        day_log = {
            'day': current_day,
            'date': current_time.strftime('%Y-%m-%d'),
            'segments': [],
            'total_driving': 0,
            'total_on_duty': 0,
            'total_off_duty': 0,
            'total_sleeper': 0,
            'miles_driven': 0,
            'remarks': [],
        }

    # Add start stop
    stops.append({
        'type': 'start',
        'label': f'Start: {current_location}',
        'lat': current_coords[0],
        'lng': current_coords[1],
        'time': current_time.strftime('%H:%M'),
        'day': current_day,
    })

    # Pre-trip inspection (15 min on-duty)
    timeline.append({
        'type': 'on_duty',
        'title': 'Pre-Trip Inspection',
        'duration': '15 min',
        'time_range': f"{current_time.strftime('%H:%M')} - {(current_time + timedelta(minutes=15)).strftime('%H:%M')}",
        'day': current_day,
        'icon': 'clipboard',
    })
    end_t = current_time + timedelta(minutes=15)
    add_log_segment('on_duty', current_time, end_t, 'Pre-trip inspection')
    current_time = end_t
    hours_on_duty_today += 0.25

    # ─── Main driving loop ──────────────────────────────────────────
    safety_counter = 0
    max_iterations = 200

    while remaining_driving > 0.01 and safety_counter < max_iterations:
        safety_counter += 1

        # Check if we need a 30-min break
        if hours_since_break >= break_interval:
            timeline.append({
                'type': 'break',
                'title': '30-Minute Break (HOS)',
                'duration': '30 min',
                'time_range': f"{current_time.strftime('%H:%M')} - {(current_time + timedelta(minutes=30)).strftime('%H:%M')}",
                'day': current_day,
                'icon': 'coffee',
            })
            end_t = current_time + timedelta(minutes=30)
            add_log_segment('off_duty', current_time, end_t, '30-min break - HOS compliance')
            current_time = end_t
            hours_since_break = 0

        # Check if we need 10-hour rest
        if hours_driven_today >= daily_drive_limit or hours_on_duty_today >= duty_window - 0.5:
            timeline.append({
                'type': 'rest',
                'title': '10-Hour Rest Period',
                'duration': '10 hrs',
                'time_range': f"{current_time.strftime('%H:%M')} - {(current_time + timedelta(hours=10)).strftime('%H:%M')}",
                'day': current_day,
                'icon': 'bed',
            })
            # Fill remaining day with sleeper
            end_of_day = current_time + timedelta(hours=10)
            add_log_segment('sleeper', current_time, end_of_day, '10-hour rest period')

            stops.append({
                'type': 'rest',
                'label': 'Rest Stop (10hr)',
                'lat': current_pos[0],
                'lng': current_pos[1],
                'time': current_time.strftime('%H:%M'),
                'day': current_day,
            })

            current_time = end_of_day
            start_new_day()

            # Pre-trip after rest
            timeline.append({
                'type': 'on_duty',
                'title': 'Pre-Trip Inspection',
                'duration': '15 min',
                'time_range': f"{current_time.strftime('%H:%M')} - {(current_time + timedelta(minutes=15)).strftime('%H:%M')}",
                'day': current_day,
                'icon': 'clipboard',
            })
            end_t = current_time + timedelta(minutes=15)
            add_log_segment('on_duty', current_time, end_t, 'Pre-trip inspection')
            current_time = end_t
            hours_on_duty_today += 0.25
            continue

        # Calculate how long we can drive this segment
        max_drive_segment = min(
            remaining_driving,
            daily_drive_limit - hours_driven_today,
            duty_window - hours_on_duty_today - 0.5,
            break_interval - hours_since_break,
            3.0  # Max segment for readability
        )

        if max_drive_segment <= 0.01:
            # Force rest if we can't drive
            hours_driven_today = daily_drive_limit
            continue

        # Check for pickup arrival
        miles_this_segment = max_drive_segment * avg_speed
        dist_remaining_to_target = 0

        if not reached_pickup:
            hours_to_pickup = driving_hours_to_pickup - (total_driving_hours - remaining_driving - driving_hours_to_dropoff if reached_pickup else total_driving_hours - remaining_driving)
            if hours_to_pickup <= 0:
                hours_to_pickup = 0
            if not pickup_done and hours_to_pickup <= max_drive_segment and hours_to_pickup > 0:
                # Drive to pickup
                drive_hours = hours_to_pickup
                if drive_hours > 0.01:
                    end_t = current_time + timedelta(hours=drive_hours)
                    timeline.append({
                        'type': 'driving',
                        'title': f'Drive to Pickup',
                        'duration': f'{drive_hours:.1f} hrs',
                        'time_range': f"{current_time.strftime('%H:%M')} - {end_t.strftime('%H:%M')}",
                        'day': current_day,
                        'icon': 'truck',
                    })
                    add_log_segment('driving', current_time, end_t)
                    current_time = end_t
                    hours_driven_today += drive_hours
                    hours_on_duty_today += drive_hours
                    hours_since_break += drive_hours
                    hours_in_cycle += drive_hours
                    remaining_driving -= drive_hours
                    miles_since_fuel += drive_hours * avg_speed
                    day_log['miles_driven'] += drive_hours * avg_speed

                # Pickup stop (1 hour on-duty)
                reached_pickup = True
                pickup_done = True
                current_pos = pickup_coords

                timeline.append({
                    'type': 'on_duty',
                    'title': 'Pickup - Loading',
                    'duration': '1 hr',
                    'time_range': f"{current_time.strftime('%H:%M')} - {(current_time + timedelta(hours=1)).strftime('%H:%M')}",
                    'day': current_day,
                    'icon': 'package',
                })
                end_t = current_time + timedelta(hours=1)
                add_log_segment('on_duty', current_time, end_t, f'Pickup at {pickup_location}')
                current_time = end_t
                hours_on_duty_today += 1

                stops.append({
                    'type': 'pickup',
                    'label': f'Pickup: {pickup_location}',
                    'lat': pickup_coords[0],
                    'lng': pickup_coords[1],
                    'time': current_time.strftime('%H:%M'),
                    'day': current_day,
                })
                continue

        # Check for fuel stop
        if miles_since_fuel + miles_this_segment >= 1000 and fuel_stops_count > 0:
            miles_to_fuel = 1000 - miles_since_fuel
            hours_to_fuel = miles_to_fuel / avg_speed
            if hours_to_fuel > 0.01 and hours_to_fuel <= max_drive_segment:
                end_t = current_time + timedelta(hours=hours_to_fuel)
                timeline.append({
                    'type': 'driving',
                    'title': 'Drive',
                    'duration': f'{hours_to_fuel:.1f} hrs',
                    'time_range': f"{current_time.strftime('%H:%M')} - {end_t.strftime('%H:%M')}",
                    'day': current_day,
                    'icon': 'truck',
                })
                add_log_segment('driving', current_time, end_t)
                current_time = end_t
                hours_driven_today += hours_to_fuel
                hours_on_duty_today += hours_to_fuel
                hours_since_break += hours_to_fuel
                hours_in_cycle += hours_to_fuel
                remaining_driving -= hours_to_fuel
                day_log['miles_driven'] += hours_to_fuel * avg_speed

                # Fuel stop - interpolate along the correct leg
                if not reached_pickup:
                    # Before pickup: interpolate between start and pickup
                    leg_driven = total_driving_hours - remaining_driving
                    leg_frac = leg_driven / driving_hours_to_pickup if driving_hours_to_pickup > 0 else 1.0
                    fuel_pos = interpolate_point(
                        current_coords[0], current_coords[1],
                        pickup_coords[0], pickup_coords[1],
                        min(max(leg_frac, 0), 1.0)
                    )
                else:
                    # After pickup: interpolate between pickup and dropoff
                    leg_driven = total_driving_hours - remaining_driving - driving_hours_to_pickup
                    leg_frac = leg_driven / driving_hours_to_dropoff if driving_hours_to_dropoff > 0 else 1.0
                    fuel_pos = interpolate_point(
                        pickup_coords[0], pickup_coords[1],
                        dropoff_coords[0], dropoff_coords[1],
                        min(max(leg_frac, 0), 1.0)
                    )
                current_pos = fuel_pos

                timeline.append({
                    'type': 'on_duty',
                    'title': 'Fuel Stop',
                    'duration': '30 min',
                    'time_range': f"{current_time.strftime('%H:%M')} - {(current_time + timedelta(minutes=30)).strftime('%H:%M')}",
                    'day': current_day,
                    'icon': 'fuel',
                })
                end_t = current_time + timedelta(minutes=30)
                add_log_segment('on_duty', current_time, end_t, 'Fuel stop')
                current_time = end_t
                hours_on_duty_today += 0.5

                stops.append({
                    'type': 'fuel',
                    'label': 'Fuel Stop',
                    'lat': fuel_pos[0],
                    'lng': fuel_pos[1],
                    'time': current_time.strftime('%H:%M'),
                    'day': current_day,
                })
                miles_since_fuel = 0
                fuel_stops_count -= 1
                continue

        # Normal driving segment
        drive_hours = min(max_drive_segment, remaining_driving)
        if drive_hours > 0.01:
            end_t = current_time + timedelta(hours=drive_hours)
            dest_label = 'Drive to Dropoff' if reached_pickup else 'Drive to Pickup'
            timeline.append({
                'type': 'driving',
                'title': dest_label,
                'duration': f'{drive_hours:.1f} hrs',
                'time_range': f"{current_time.strftime('%H:%M')} - {end_t.strftime('%H:%M')}",
                'day': current_day,
                'icon': 'truck',
            })
            add_log_segment('driving', current_time, end_t)
            current_time = end_t
            hours_driven_today += drive_hours
            hours_on_duty_today += drive_hours
            hours_since_break += drive_hours
            hours_in_cycle += drive_hours
            remaining_driving -= drive_hours
            miles_since_fuel += drive_hours * avg_speed
            day_log['miles_driven'] += drive_hours * avg_speed

            # Update current position
            frac = (total_driving_hours - remaining_driving) / total_driving_hours if total_driving_hours > 0 else 1.0
            if not reached_pickup:
                current_pos = interpolate_point(
                    current_coords[0], current_coords[1],
                    pickup_coords[0], pickup_coords[1],
                    min(frac * total_driving_hours / driving_hours_to_pickup, 1.0) if driving_hours_to_pickup > 0 else 1.0
                )
            else:
                pickup_frac = (total_driving_hours - remaining_driving - driving_hours_to_pickup) / driving_hours_to_dropoff if driving_hours_to_dropoff > 0 else 1.0
                current_pos = interpolate_point(
                    pickup_coords[0], pickup_coords[1],
                    dropoff_coords[0], dropoff_coords[1],
                    min(max(pickup_frac, 0), 1.0)
                )

    # ─── Dropoff ────────────────────────────────────────────────────
    if not dropoff_done:
        timeline.append({
            'type': 'on_duty',
            'title': 'Dropoff - Unloading',
            'duration': '1 hr',
            'time_range': f"{current_time.strftime('%H:%M')} - {(current_time + timedelta(hours=1)).strftime('%H:%M')}",
            'day': current_day,
            'icon': 'flag',
        })
        end_t = current_time + timedelta(hours=1)
        add_log_segment('on_duty', current_time, end_t, f'Dropoff at {dropoff_location}')
        current_time = end_t
        hours_on_duty_today += 1

        stops.append({
            'type': 'dropoff',
            'label': f'Dropoff: {dropoff_location}',
            'lat': dropoff_coords[0],
            'lng': dropoff_coords[1],
            'time': current_time.strftime('%H:%M'),
            'day': current_day,
        })
        dropoff_done = True

    # Post-trip inspection
    timeline.append({
        'type': 'on_duty',
        'title': 'Post-Trip Inspection',
        'duration': '15 min',
        'time_range': f"{current_time.strftime('%H:%M')} - {(current_time + timedelta(minutes=15)).strftime('%H:%M')}",
        'day': current_day,
        'icon': 'clipboard',
    })
    end_t = current_time + timedelta(minutes=15)
    add_log_segment('on_duty', current_time, end_t, 'Post-trip inspection')
    current_time = end_t

    # Fill rest of day as off-duty
    end_of_day_hour = 24.0
    last_hour = current_time.hour + current_time.minute / 60
    if last_hour < end_of_day_hour:
        end_of_day_time = current_time.replace(hour=23, minute=59, second=59)
        add_log_segment('off_duty', current_time, end_of_day_time)

    # Save last day log
    log_sheets.append(day_log)

    # ─── Generate route polyline ────────────────────────────────────
    if osrm_route_points:
        route_points = osrm_route_points
    else:
        route_points = generate_route_points_fallback(waypoints, 80)

    # ─── Calculate final stats ──────────────────────────────────────
    total_days = current_day
    remaining_cycle_hours = max(0, cycle_limit - hours_in_cycle)
    actual_fuel_stops = max(0, int(total_distance / 1000))

    # Round values
    total_distance = round(total_distance, 1)
    total_driving_hours = round(total_driving_hours, 1)
    remaining_cycle_hours = round(remaining_cycle_hours, 1)

    # Round log sheet values
    for sheet in log_sheets:
        sheet['total_driving'] = round(sheet['total_driving'], 2)
        sheet['total_on_duty'] = round(sheet['total_on_duty'], 2)
        sheet['total_off_duty'] = round(sheet['total_off_duty'], 2)
        sheet['total_sleeper'] = round(sheet['total_sleeper'], 2)
        sheet['miles_driven'] = round(sheet['miles_driven'], 1)

    return {
        'current_location': current_location,
        'pickup_location': pickup_location,
        'dropoff_location': dropoff_location,
        'current_cycle_used': current_cycle_used,
        'current_lat': current_coords[0],
        'current_lng': current_coords[1],
        'pickup_lat': pickup_coords[0],
        'pickup_lng': pickup_coords[1],
        'dropoff_lat': dropoff_coords[0],
        'dropoff_lng': dropoff_coords[1],
        'total_distance': total_distance,
        'estimated_driving_hours': total_driving_hours,
        'total_days': total_days,
        'fuel_stops': actual_fuel_stops,
        'remaining_cycle_hours': remaining_cycle_hours,
        'route_data': route_points,
        'stops_data': stops,
        'timeline_data': timeline,
        'log_sheets_data': log_sheets,
    }

from geopy.distance import geodesic
from typing import Tuple, Optional, Dict, List
from datetime import datetime, timedelta
import math
import json


def calculate_distance(
    seller_lat: float,
    seller_lon: float,
    buyer_lat: float,
    buyer_lon: float
) -> float:
    """
    Calculate distance between two GPS coordinates in kilometers.

    Args:
        seller_lat: Seller latitude
        seller_lon: Seller longitude
        buyer_lat: Buyer latitude
        buyer_lon: Buyer longitude

    Returns:
        Distance in kilometers (rounded to 2 decimals)
    """
    seller_coords = (seller_lat, seller_lon)
    buyer_coords = (buyer_lat, buyer_lon)

    distance_km = geodesic(seller_coords, buyer_coords).kilometers

    return round(distance_km, 2)


def verify_delivery_location(
    seller_coords: Tuple[float, float],
    buyer_coords: Tuple[float, float],
    max_distance_km: float = 1.0
) -> dict:
    """
    Verify buyer is near seller location for high-value deliveries.

    Args:
        seller_coords: (latitude, longitude) of seller
        buyer_coords: (latitude, longitude) of buyer at delivery
        max_distance_km: Maximum allowed distance (default 1km)

    Returns:
        {
            "verified": bool,
            "distance_km": float,
            "message": str
        }
    """
    distance = calculate_distance(
        seller_coords[0], seller_coords[1],
        buyer_coords[0], buyer_coords[1]
    )

    verified = distance <= max_distance_km

    return {
        "verified": verified,
        "distance_km": distance,
        "message": (
            f"Verified: Buyer is {distance}km from pickup point"
            if verified else
            f"Too far: Buyer is {distance}km away (max {max_distance_km}km)"
        )
    }


def calculate_bearing(
    lat1: float, lon1: float,
    lat2: float, lon2: float
) -> float:
    """
    Calculate bearing (direction) from point 1 to point 2.
    Returns angle in degrees (0-360) where 0 is North.
    """
    dlon = lon2 - lon1
    y = math.sin(math.radians(dlon)) * math.cos(math.radians(lat2))
    x = (math.cos(math.radians(lat1)) * math.sin(math.radians(lat2)) -
         math.sin(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.cos(math.radians(dlon)))
    bearing = math.degrees(math.atan2(y, x))
    return (bearing + 360) % 360


def estimate_delivery_time(
    current_lat: float,
    current_lon: float,
    destination_lat: float,
    destination_lon: float,
    current_speed_kmh: float = 20
) -> Dict[str, any]:
    """
    Estimate delivery time based on current location and speed.
    Assumes average speed of 20 km/h (typical delivery boda-boda speed).
    
    Returns:
        {
            "distance_km": float,
            "estimated_time_minutes": int,
            "bearing_degrees": float,
            "confidence": str (high/medium/low)
        }
    """
    distance = calculate_distance(current_lat, current_lon, destination_lat, destination_lon)
    bearing = calculate_bearing(current_lat, current_lon, destination_lat, destination_lon)
    
    # Handle zero speed
    if current_speed_kmh <= 0:
        current_speed_kmh = 20
    
    # Calculate time in minutes
    time_hours = distance / current_speed_kmh
    time_minutes = int(time_hours * 60)
    
    # Confidence based on distance and speed data
    if current_speed_kmh > 0:
        confidence = "high" if distance < 10 else "medium"
    else:
        confidence = "low"
    
    return {
        "distance_km": distance,
        "estimated_time_minutes": time_minutes,
        "bearing_degrees": bearing,
        "confidence": confidence
    }


def analyze_location_pattern(location_history: List[Dict]) -> Dict[str, any]:
    """
    Analyze location history to detect anomalies or suspicious patterns.
    
    Returns:
        {
            "is_suspicious": bool,
            "flags": list,
            "path_distance_km": float,
            "average_speed_kmh": float,
            "anomalies": list
        }
    """
    if len(location_history) < 2:
        return {
            "is_suspicious": False,
            "flags": [],
            "path_distance_km": 0,
            "average_speed_kmh": 0,
            "anomalies": []
        }
    
    flags = []
    anomalies = []
    total_distance = 0
    total_time_minutes = 0
    speeds = []
    
    # Calculate distances and speeds between consecutive points
    for i in range(len(location_history) - 1):
        current = location_history[i]
        next_point = location_history[i + 1]
        
        distance = calculate_distance(
            current["latitude"], current["longitude"],
            next_point["latitude"], next_point["longitude"]
        )
        total_distance += distance
        
        # Calculate time difference
        time_diff = (next_point["created_at"] - current["created_at"]).total_seconds() / 60
        if time_diff > 0:
            speed = (distance / time_diff) * 60  # Convert to km/h
            speeds.append(speed)
            
            # Flag extremely high speeds (teleportation)
            if speed > 100:  # > 100 km/h (unrealistic for delivery)
                anomalies.append({
                    "type": "abnormal_speed",
                    "speed_kmh": round(speed, 2),
                    "message": f"Unrealistic speed: {round(speed, 2)} km/h between points"
                })
                flags.append("teleportation")
    
    average_speed = sum(speeds) / len(speeds) if speeds else 0
    
    # Check for stationary for too long
    if len(location_history) > 5:
        recent_locations = location_history[-5:]
        distances_recent = []
        for i in range(len(recent_locations) - 1):
            dist = calculate_distance(
                recent_locations[i]["latitude"], recent_locations[i]["longitude"],
                recent_locations[i + 1]["latitude"], recent_locations[i + 1]["longitude"]
            )
            distances_recent.append(dist)
        
        if all(d < 0.1 for d in distances_recent):  # Less than 100m movement
            anomalies.append({
                "type": "stationary",
                "message": "Delivery person stationary for extended period"
            })
            # This might be okay (waiting for customer) so not a flag
    
    is_suspicious = len(flags) > 0
    
    return {
        "is_suspicious": is_suspicious,
        "flags": flags,
        "path_distance_km": round(total_distance, 2),
        "average_speed_kmh": round(average_speed, 2),
        "anomalies": anomalies
    }


def validate_route(
    start_coords: Tuple[float, float],
    end_coords: Tuple[float, float],
    location_updates: List[Dict],
    max_deviation_km: float = 5.0
) -> Dict[str, any]:
    """
    Validate that the delivery route makes sense (no backtracking, reasonable deviation).
    
    Returns:
        {
            "is_valid": bool,
            "deviation_km": float,
            "efficiency_percent": float,
            "issues": list
        }
    """
    if not location_updates:
        return {
            "is_valid": True,
            "deviation_km": 0,
            "efficiency_percent": 100,
            "issues": []
        }
    
    # Calculate direct distance
    direct_distance = calculate_distance(
        start_coords[0], start_coords[1],
        end_coords[0], end_coords[1]
    )
    
    # Calculate actual path distance
    path_distance = 0
    for i in range(len(location_updates) - 1):
        path_distance += calculate_distance(
            location_updates[i]["latitude"], location_updates[i]["longitude"],
            location_updates[i + 1]["latitude"], location_updates[i + 1]["longitude"]
        )
    
    # Add distance from last location to destination
    path_distance += calculate_distance(
        location_updates[-1]["latitude"], location_updates[-1]["longitude"],
        end_coords[0], end_coords[1]
    )
    
    # Calculate deviation
    deviation = path_distance - direct_distance
    efficiency = (direct_distance / path_distance * 100) if path_distance > 0 else 0
    
    issues = []
    is_valid = True
    
    if deviation > max_deviation_km:
        issues.append(f"Route deviation of {round(deviation, 2)}km exceeds maximum of {max_deviation_km}km")
        is_valid = False
    
    if efficiency < 70:
        issues.append(f"Route efficiency is low ({round(efficiency, 1)}%)")
    
    return {
        "is_valid": is_valid,
        "deviation_km": round(deviation, 2),
        "efficiency_percent": round(efficiency, 1),
        "issues": issues
    }


def get_location_from_ip(ip_address: str) -> Optional[Tuple[float, float]]:
    """
    Get approximate location from IP address (backup if GPS not available).

    Note: This is approximate and should only be used as fallback.
    """
    # TODO: Implement IP geolocation API (e.g., ipapi.co)
    return None


def generate_tracking_summary(
    order_id: str,
    seller_coords: Tuple[float, float],
    buyer_coords: Tuple[float, float],
    location_history: List[Dict],
    current_speed: float = 0
) -> Dict[str, any]:
    """
    Generate a comprehensive tracking summary for an order.
    """
    latest_location = location_history[0] if location_history else None
    
    summary = {
        "order_id": order_id,
        "distance_to_destination": calculate_distance(
            latest_location["latitude"], latest_location["longitude"],
            buyer_coords[0], buyer_coords[1]
        ) if latest_location else calculate_distance(
            seller_coords[0], seller_coords[1],
            buyer_coords[0], buyer_coords[1]
        ),
        "current_position": {
            "latitude": latest_location["latitude"] if latest_location else seller_coords[0],
            "longitude": latest_location["longitude"] if latest_location else seller_coords[1],
            "updated_at": latest_location["created_at"].isoformat() if latest_location else None
        },
        "destination": {
            "latitude": buyer_coords[0],
            "longitude": buyer_coords[1]
        },
        "seller_location": {
            "latitude": seller_coords[0],
            "longitude": seller_coords[1]
        }
    }
    
    # Add ETA if we have current position
    if latest_location:
        eta = estimate_delivery_time(
            latest_location["latitude"],
            latest_location["longitude"],
            buyer_coords[0],
            buyer_coords[1],
            current_speed or 20
        )
        summary["eta"] = eta
    
    # Add pattern analysis
    if len(location_history) > 1:
        analysis = analyze_location_pattern(location_history)
        summary["pattern_analysis"] = analysis
    
    return summary


# Quick test
if __name__ == "__main__":
    # Test case: Nairobi CBD locations
    seller_loc = (-1.2864, 36.8172)  # Nairobi CBD
    buyer_loc_near = (-1.2900, 36.8200)  # ~500m away
    buyer_loc_far = (-1.3500, 36.9000)  # ~10km away

    result_near = verify_delivery_location(seller_loc, buyer_loc_near)
    print("Near location:", result_near)

    result_far = verify_delivery_location(seller_loc, buyer_loc_far)
    print("Far location:", result_far)
    
    # Test bearing calculation
    bearing = calculate_bearing(seller_loc[0], seller_loc[1], buyer_loc_near[0], buyer_loc_near[1])
    print(f"Bearing: {bearing}°")
    
    # Test ETA calculation
    eta = estimate_delivery_time(seller_loc[0], seller_loc[1], buyer_loc_near[0], buyer_loc_near[1], current_speed_kmh=25)
    print("ETA:", eta)

from geopy.distance import geodesic
from typing import Tuple, Optional


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


def get_location_from_ip(ip_address: str) -> Optional[Tuple[float, float]]:
    """
    Get approximate location from IP address (backup if GPS not available).

    Note: This is approximate and should only be used as fallback.
    """
    # TODO: Implement IP geolocation API (e.g., ipapi.co)
    return None


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

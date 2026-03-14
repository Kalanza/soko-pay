from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import List, Optional
from app.models.order import LocationUpdate, LocationEvent, TrackingSummary, Location
from app.services.gis_verification import (
    calculate_distance,
    verify_delivery_location,
    estimate_delivery_time,
    analyze_location_pattern,
    validate_route,
    generate_tracking_summary
)
from database import (
    get_order_by_id,
    log_location,
    get_location_history,
    get_latest_location,
    log_location_event,
    get_location_events
)

router = APIRouter()


@router.post("/track/{order_id}/update-location")
async def update_location(order_id: str, location: LocationUpdate):
    """
    Update delivery person's real-time location.
    
    Called frequently (every 5-30 seconds) as delivery person travels.
    Stores location for tracking and displays to buyer in real-time.
    """
    try:
        # Verify order exists
        order = get_order_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Only allow location updates for shipped or delivered orders
        if order["status"] not in ["shipped", "delivered"]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot update location for order in {order['status']} status"
            )
        
        # Get seller location for distance calculation
        seller_lat = order.get("seller_location_lat")
        seller_lon = order.get("seller_location_lon")
        
        distance_from_seller = None
        if seller_lat and seller_lon:
            distance_from_seller = calculate_distance(
                seller_lat, seller_lon,
                location.latitude, location.longitude
            )
        
        # Save location update
        location_id = log_location(
            order_id=order_id,
            tracker_type=location.tracker_type,
            latitude=location.latitude,
            longitude=location.longitude,
            accuracy=location.accuracy,
            speed=location.speed,
            heading=location.heading,
            address=location.address,
            distance_from_seller=distance_from_seller,
            metadata=None
        )
        
        # Get buyer location if available (will be set when buyer confirms delivery)
        buyer_lat = None
        buyer_lon = None
        
        # Prepare response
        response = {
            "status": "success",
            "message": "Location updated successfully",
            "location_id": location_id,
            "data": {
                "latitude": location.latitude,
                "longitude": location.longitude,
                "distance_from_seller": distance_from_seller,
                "tracker_type": location.tracker_type,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        # Add ETA if this is delivery person tracking
        if location.tracker_type == "delivery_person":
            buyer_lat = float(Query(None))  # Will need to be stored in database
            buyer_lon = float(Query(None))
            
            if buyer_lat and buyer_lon:
                eta = estimate_delivery_time(
                    location.latitude,
                    location.longitude,
                    buyer_lat,
                    buyer_lon,
                    location.speed or 20
                )
                response["data"]["eta"] = eta
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating location: {str(e)}")


@router.get("/track/{order_id}/live")
async def get_live_tracking(order_id: str):
    """
    Get current real-time tracking data for an order.
    
    Returns latest location, ETA, and route information.
    Called by frontend to update tracking map in real-time.
    """
    try:
        # Verify order exists
        order = get_order_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Get latest location
        latest_location = get_latest_location(order_id, tracker_type="delivery_person")
        
        if not latest_location:
            return {
                "status": "pending",
                "message": "No location data available yet",
                "order_id": order_id
            }
        
        # Get location history for analysis
        history = get_location_history(order_id, limit=50)
        
        # Convert history timestamps for analysis
        for item in history:
            if isinstance(item.get("created_at"), str):
                item["created_at"] = datetime.fromisoformat(item["created_at"])
            elif not isinstance(item.get("created_at"), datetime):
                # If it's a timestamp or other format, try to parse it
                try:
                    item["created_at"] = datetime.fromisoformat(str(item.get("created_at")))
                except:
                    item["created_at"] = datetime.utcnow()
        
        # Analyze pattern for anomalies
        pattern = analyze_location_pattern(history)
        
        # Estimate delivery time
        seller_lat = order.get("seller_location_lat")
        seller_lon = order.get("seller_location_lon")
        
        response = {
            "order_id": order_id,
            "status": order["status"],
            "current_position": {
                "latitude": latest_location["latitude"],
                "longitude": latest_location["longitude"],
                "accuracy": latest_location.get("accuracy"),
                "speed": latest_location.get("speed"),
                "heading": latest_location.get("heading"),
                "address": latest_location.get("address"),
                "updated_at": latest_location.get("created_at")
            },
            "seller_location": {
                "latitude": seller_lat,
                "longitude": seller_lon
            } if seller_lat and seller_lon else None,
            "distance_from_seller": latest_location.get("distance_from_seller"),
            "pattern_analysis": pattern,
            "location_count": len(history)
        }
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tracking data: {str(e)}")


@router.get("/track/{order_id}/history")
async def get_location_history_endpoint(order_id: str, limit: int = Query(50, ge=1, le=500)):
    """
    Get complete location history for an order.
    
    Used for detailed tracking analytics and map visualization.
    """
    try:
        order = get_order_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        history = get_location_history(order_id, limit=limit)
        
        return {
            "order_id": order_id,
            "location_count": len(history),
            "locations": [
                {
                    "latitude": loc["latitude"],
                    "longitude": loc["longitude"],
                    "accuracy": loc.get("accuracy"),
                    "speed": loc.get("speed"),
                    "heading": loc.get("heading"),
                    "address": loc.get("address"),
                    "distance_from_seller": loc.get("distance_from_seller"),
                    "tracker_type": loc.get("tracker_type"),
                    "timestamp": loc.get("created_at")
                }
                for loc in history
            ]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")


@router.post("/track/{order_id}/event")
async def log_tracking_event(order_id: str, event: LocationEvent):
    """
    Log delivery milestones/events (e.g., 'delivery_started', 'delivery_completed').
    
    Used to mark important moments in the delivery journey.
    """
    try:
        order = get_order_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        event_id = log_location_event(
            order_id=order_id,
            event=event.event,
            latitude=event.latitude,
            longitude=event.longitude,
            description=event.description
        )
        
        return {
            "status": "success",
            "event_id": event_id,
            "order_id": order_id,
            "event": event.event,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error logging event: {str(e)}")


@router.get("/track/{order_id}/events")
async def get_tracking_events(order_id: str):
    """
    Get all logged events for an order (delivery milestones).
    """
    try:
        order = get_order_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        events = get_location_events(order_id)
        
        return {
            "order_id": order_id,
            "events": [
                {
                    "event": e["event"],
                    "latitude": e.get("latitude"),
                    "longitude": e.get("longitude"),
                    "description": e.get("description"),
                    "timestamp": e.get("created_at")
                }
                for e in events
            ]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching events: {str(e)}")


@router.get("/track/{order_id}/eta")
async def get_estimated_delivery_time(
    order_id: str,
    current_speed: Optional[float] = Query(None, description="Current speed in km/h (optional)")
):
    """
    Get estimated delivery time based on current location and speed.
    
    Returns ETA in minutes and distance remaining.
    """
    try:
        order = get_order_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Get latest location
        latest = get_latest_location(order_id)
        if not latest:
            return {
                "error": "No location data available",
                "order_id": order_id
            }
        
        # Get buyer location (will need to be stored in database)
        # For now, use a placeholder
        buyer_lat = float(Query(None))
        buyer_lon = float(Query(None))
        
        if not buyer_lat or not buyer_lon:
            return {
                "error": "Buyer location not available",
                "order_id": order_id
            }
        
        eta = estimate_delivery_time(
            latest["latitude"],
            latest["longitude"],
            buyer_lat,
            buyer_lon,
            current_speed or latest.get("speed") or 20
        )
        
        return {
            "order_id": order_id,
            "eta_minutes": eta["estimated_time_minutes"],
            "distance_km": eta["distance_km"],
            "bearing_degrees": eta["bearing_degrees"],
            "confidence": eta["confidence"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating ETA: {str(e)}")


@router.post("/track/{order_id}/verify-delivery-location")
async def verify_delivery_location_endpoint(
    order_id: str,
    latitude: float,
    longitude: float,
    max_distance_km: float = Query(1.0, description="Maximum allowed distance in km")
):
    """
    Verify that buyer is at the correct delivery location.
    
    Used to confirm buyer is within acceptable distance from seller
    before releasing funds (for high-value items > KES 10K).
    """
    try:
        order = get_order_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        seller_lat = order.get("seller_location_lat")
        seller_lon = order.get("seller_location_lon")
        
        if not seller_lat or not seller_lon:
            return {
                "error": "Seller location not available",
                "order_id": order_id
            }
        
        result = verify_delivery_location(
            (seller_lat, seller_lon),
            (latitude, longitude),
            max_distance_km
        )
        
        return {
            "order_id": order_id,
            "verified": result["verified"],
            "distance_km": result["distance_km"],
            "max_distance_km": max_distance_km,
            "message": result["message"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verifying location: {str(e)}")


@router.get("/track/{order_id}/summary")
async def get_tracking_summary_endpoint(order_id: str):
    """
    Get comprehensive tracking summary for an order.
    
    Includes current position, ETA, route analysis, and any anomalies.
    """
    try:
        order = get_order_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        seller_lat = order.get("seller_location_lat")
        seller_lon = order.get("seller_location_lon")
        
        if not seller_lat or not seller_lon:
            return {
                "error": "Seller location not available",
                "order_id": order_id
            }
        
        # Get buyer location (placeholder - needs to be stored in DB)
        buyer_lat = float(Query(None))
        buyer_lon = float(Query(None))
        
        if not buyer_lat or not buyer_lon:
            return {
                "error": "Buyer location not available",
                "order_id": order_id
            }
        
        history = get_location_history(order_id, limit=500)
        
        # Convert timestamps
        for item in history:
            if isinstance(item.get("created_at"), str):
                item["created_at"] = datetime.fromisoformat(item["created_at"])
        
        summary = generate_tracking_summary(
            order_id,
            (seller_lat, seller_lon),
            (buyer_lat, buyer_lon),
            history
        )
        
        return summary
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

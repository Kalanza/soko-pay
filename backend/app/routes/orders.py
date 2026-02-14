from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid
from app.models.order import Product, Order, CreatePaymentLinkResponse, OrderStatus
from database import create_order, get_order_by_id, get_db

router = APIRouter()

@router.post("/create-payment-link", response_model=CreatePaymentLinkResponse)
async def create_payment_link(product: Product):
    """
    Create an escrow payment link for a product.
    
    Seller creates the link which they share on WhatsApp/Instagram.
    Returns a unique payment link and order ID.
    """
    try:
        # Generate unique order ID
        order_id = f"SP{uuid.uuid4().hex[:12].upper()}"
        
        # Create payment link
        payment_link = f"https://soko-pay.vercel.app/pay/{order_id}"
        
        # Extract location if provided
        seller_lat = product.seller_location.latitude if product.seller_location else None
        seller_lon = product.seller_location.longitude if product.seller_location else None
        
        # Save order to database
        order = create_order(
            order_id=order_id,
            product_name=product.name,
            product_price=product.price,
            product_description=product.description,
            product_category=product.category,
            seller_phone=product.seller_phone,
            seller_name=product.seller_name,
            payment_link=payment_link,
            seller_location_lat=seller_lat,
            seller_location_lon=seller_lon
        )
        
        if not order:
            raise HTTPException(status_code=500, detail="Failed to create order")
        
        return CreatePaymentLinkResponse(
            order_id=order_id,
            payment_link=payment_link,
            message="Payment link created successfully. Share this link with your buyer!"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating payment link: {str(e)}")

@router.get("/track/{order_id}", response_model=Order)
async def track_order(order_id: str):
    """
    Track order status by order ID.
    
    Returns complete order details including status, timeline, and fraud checks.
    """
    order = get_order_by_id(order_id)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Convert database row to Order model
    return Order(
        id=order["id"],
        product_name=order["product_name"],
        product_price=order["product_price"],
        product_description=order["product_description"],
        product_category=order["product_category"],
        seller_phone=order["seller_phone"],
        seller_name=order["seller_name"],
        buyer_phone=order["buyer_phone"] or "",
        buyer_name=order["buyer_name"] or "",
        status=OrderStatus(order["status"]),
        payment_link=order["payment_link"],
        payhero_ref=order["payhero_ref"],
        fraud_risk_score=order["fraud_risk_score"],
        fraud_risk_level=order["fraud_risk_level"],
        fraud_flags=order["fraud_flags"],
        created_at=order["created_at"],
        paid_at=order["paid_at"],
        shipped_at=order["shipped_at"],
        delivered_at=order["delivered_at"]
    )

@router.get("/orders/{order_id}/qr")
async def get_qr_code(order_id: str):
    """
    Generate a QR code for the payment link.
    
    Sellers can display this for easy scanning.
    """
    order = get_order_by_id(order_id)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Return QR code data URL (frontend will render this)
    return {
        "qr_data": order["payment_link"],
        "order_id": order_id,
        "message": "Scan this QR code to pay"
    }

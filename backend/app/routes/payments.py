from fastapi import APIRouter, HTTPException, Request
from datetime import datetime
from app.models.order import PaymentRequest, PaymentResponse, DeliveryConfirmation, OrderStatus
from app.services.payhero import initiate_payment, process_callback
from app.services.ai_fraud import check_fraud_risk
from app.services.gis_verification import verify_delivery_location
from database import get_order_by_id, update_order_status, log_transaction, get_db

router = APIRouter()

@router.post("/pay/{order_id}", response_model=PaymentResponse)
async def pay_for_order(order_id: str, payment_request: PaymentRequest):
    """
    Initiate payment for an order via M-Pesa STK push.
    
    Buyer clicks payment link, enters their M-Pesa number, and receives STK push.
    """
    # Get order details
    order = get_order_by_id(order_id)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["status"] != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Order cannot be paid. Current status: {order['status']}"
        )

    # AI Fraud Check - analyze transaction before processing payment
    fraud_check = await check_fraud_risk({
        "product_name": order["product_name"],
        "price": order["product_price"],
        "description": order.get("product_description", ""),
        "seller_phone": order["seller_phone"]
    })

    # Store fraud assessment on the order
    update_order_status(
        order_id, order["status"],
        fraud_risk_score=fraud_check["risk_score"],
        fraud_risk_level=fraud_check["risk_level"],
        fraud_flags=",".join(fraud_check.get("flags", []))
    )

    # Block high-risk transactions
    if fraud_check["risk_score"] > 80:
        update_order_status(order_id, "flagged")
        log_transaction(
            order_id, "fraud_blocked",
            status="blocked",
            metadata=fraud_check["reason"]
        )
        raise HTTPException(
            status_code=400,
            detail=f"Transaction blocked for security: {fraud_check['reason']}"
        )

    # Initiate payment via PayHero
    try:
        payment_result = initiate_payment(
            amount=order["product_price"],
            phone_number=payment_request.buyer_phone,
            order_id=order_id,
            description=f"Payment for {order['product_name']}"
        )
        
        if not payment_result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=payment_result.get("message", "Payment initiation failed")
            )
        
        # Update order with buyer details and PayHero reference
        conn = next(get_db())
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE orders 
            SET buyer_phone = ?, buyer_name = ?, payhero_ref = ?
            WHERE id = ?
        """, (
            payment_request.buyer_phone,
            payment_request.buyer_name,
            payment_result.get("reference"),
            order_id
        ))
        conn.commit()
        conn.close()
        
        # Log transaction
        log_transaction(
            order_id=order_id,
            transaction_type="payment_initiated",
            amount=order["product_price"],
            payhero_ref=payment_result.get("reference"),
            status="pending"
        )
        
        return PaymentResponse(
            message=payment_result.get("message"),
            order_id=order_id,
            payhero_response=payment_result
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment error: {str(e)}")

@router.post("/payhero/callback")
async def payhero_callback(request: Request):
    """
    Handle PayHero payment callback.
    
    PayHero sends this when payment is completed.
    Updates order status to 'paid' and triggers fraud detection.
    """
    try:
        callback_data = await request.json()
        
        # Process callback
        processed = process_callback(callback_data)
        order_id = processed.get("external_ref")
        
        if not order_id:
            return {"status": "error", "message": "No order ID in callback"}
        
        order = get_order_by_id(order_id)
        if not order:
            return {"status": "error", "message": "Order not found"}
        
        # Check payment status
        if processed.get("status") == "success":
            # Update order status to paid
            update_order_status(order_id, "paid")
            
            # Update paid_at timestamp
            conn = next(get_db())
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE orders 
                SET paid_at = ?
                WHERE id = ?
            """, (datetime.now().isoformat(), order_id))
            conn.commit()
            conn.close()
            
            # Log successful transaction
            log_transaction(
                order_id=order_id,
                transaction_type="payment_completed",
                amount=processed.get("amount"),
                payhero_ref=processed.get("reference"),
                mpesa_ref=processed.get("mpesa_ref"),
                status="success"
            )
            
            # Post-payment fraud detection (runs after payment confirms)
            fraud_check = await check_fraud_risk({
                "product_name": order["product_name"],
                "price": order["product_price"],
                "description": order.get("product_description", ""),
                "seller_phone": order["seller_phone"]
            })

            # Store fraud results on the order
            update_order_status(
                order_id, "paid",
                fraud_risk_score=fraud_check["risk_score"],
                fraud_risk_level=fraud_check["risk_level"],
                fraud_flags=",".join(fraud_check.get("flags", []))
            )

            # Flag paid orders that are high-risk for manual review
            if fraud_check["risk_score"] > 70:
                log_transaction(
                    order_id, "fraud_flagged_post_payment",
                    status="flagged",
                    metadata=fraud_check["reason"]
                )
        
        return {"status": "success", "message": "Callback processed"}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/ship/{order_id}")
async def mark_as_shipped(order_id: str):
    """
    Mark order as shipped by seller.
    
    Seller confirms they've shipped the product.
    """
    order = get_order_by_id(order_id)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["status"] != "paid":
        raise HTTPException(
            status_code=400,
            detail=f"Order cannot be shipped. Must be paid first. Current status: {order['status']}"
        )
    
    # Update status
    update_order_status(order_id, "shipped")
    
    # Update shipped_at timestamp
    conn = next(get_db())
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE orders 
        SET shipped_at = ?
        WHERE id = ?
    """, (datetime.now().isoformat(), order_id))
    conn.commit()
    conn.close()
    
    return {
        "message": "Order marked as shipped",
        "order_id": order_id,
        "status": "shipped"
    }

@router.post("/confirm-delivery/{order_id}")
async def confirm_delivery(order_id: str, confirmation: DeliveryConfirmation):
    """
    Confirm delivery and release funds to seller.
    
    Buyer confirms they received the product. Triggers fund release.
    Optional GPS verification for high-value orders.
    """
    order = get_order_by_id(order_id)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["status"] != "shipped":
        raise HTTPException(
            status_code=400,
            detail=f"Order cannot be delivered. Must be shipped first. Current status: {order['status']}"
        )
    
    # GPS verification for high-value orders (>KES 10,000)
    gps_result = None
    if order["product_price"] > 10000:
        if not confirmation.latitude or not confirmation.longitude:
            raise HTTPException(
                status_code=400,
                detail="GPS location required for items over KES 10,000"
            )

        # Check if seller location is available
        if order.get("seller_location_lat") and order.get("seller_location_lon"):
            gps_result = verify_delivery_location(
                seller_coords=(order["seller_location_lat"], order["seller_location_lon"]),
                buyer_coords=(confirmation.latitude, confirmation.longitude),
                max_distance_km=1.0
            )

            if not gps_result["verified"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"GPS verification failed: {gps_result['message']}"
                )
    
    # Update status
    update_order_status(order_id, "delivered")
    
    # Update delivered_at timestamp
    conn = next(get_db())
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE orders 
        SET delivered_at = ?
        WHERE id = ?
    """, (datetime.now().isoformat(), order_id))
    conn.commit()
    
    # Mark as completed (funds released)
    update_order_status(order_id, "completed")
    
    # Log fund release transaction
    # Calculate platform fee (3%)
    platform_fee = order["product_price"] * 0.03
    seller_amount = order["product_price"] - platform_fee
    
    log_transaction(
        order_id=order_id,
        transaction_type="funds_released",
        amount=seller_amount,
        status="success",
        metadata=f"Platform fee: {platform_fee} KES"
    )
    
    conn.close()
    
    return {
        "message": "Delivery confirmed. Funds released to seller.",
        "order_id": order_id,
        "status": "completed",
        "seller_payout": seller_amount,
        "platform_fee": platform_fee
    }

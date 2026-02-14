from fastapi import APIRouter, HTTPException, Request
from datetime import datetime
from app.models.order import PaymentRequest, PaymentResponse, DeliveryConfirmation, OrderStatus
from app.services.payhero import initiate_payment, process_callback
from app.services.ai_fraud import check_fraud_risk
from database import get_order_by_id, update_order_status, log_transaction, get_db
import json

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
    
    # Initiate payment via PayHero
    try:
        payment_result = initiate_payment(
            amount=order["product_price"],
            phone_number=payment_request.buyer_phone,
            order_id=order_id,
            description=f"Payment for {order['product_name']}",
            customer_name=payment_request.buyer_name
        )
        
        if not payment_result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=payment_result.get("message", "Payment initiation failed")
            )
        
        # Update order with buyer details and PayHero reference
        with get_db() as conn:
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
        external_ref = processed.get("external_ref", "")
        
        # Strip SOKO- prefix if present (we add it when sending to PayHero)
        order_id = external_ref.replace("SOKO-", "") if external_ref else None
        
        if not order_id:
            return {"status": "error", "message": "No order ID in callback"}
        
        order = get_order_by_id(order_id)
        if not order:
            return {"status": "error", "message": "Order not found"}
        
        # Check payment status
        if processed.get("status") == "success":
            # Run AI fraud detection before releasing to "paid"
            try:
                fraud_result = await check_fraud_risk({
                    "product_name": order["product_name"],
                    "price": order["product_price"],
                    "description": order["product_description"],
                    "seller_phone": order["seller_phone"],
                    "category": order.get("product_category", "Other")
                })
                
                # Store fraud results
                update_order_status(
                    order_id, "paid",
                    fraud_risk_score=fraud_result.get("risk_score"),
                    fraud_risk_level=fraud_result.get("risk_level"),
                    fraud_flags=json.dumps(fraud_result.get("flags", []))
                )
                
                # Log fraud check
                log_transaction(
                    order_id=order_id,
                    transaction_type="fraud_check",
                    amount=order["product_price"],
                    status=fraud_result.get("risk_level"),
                    metadata=json.dumps(fraud_result)
                )
                
                # If high risk, flag for review instead of auto-releasing
                if fraud_result.get("risk_score", 0) >= 70:
                    log_transaction(
                        order_id=order_id,
                        transaction_type="high_risk_flagged",
                        amount=order["product_price"],
                        status="flagged",
                        metadata=f"AI flagged: {fraud_result.get('reason')}"
                    )
            except Exception as fraud_err:
                print(f"Fraud detection warning (non-blocking): {fraud_err}")
                # Still mark as paid even if fraud check fails
                update_order_status(order_id, "paid")
            
            # Update paid_at timestamp
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE orders 
                    SET paid_at = ?
                    WHERE id = ?
                """, (datetime.now().isoformat(), order_id))
                conn.commit()
            
            # Log successful transaction
            log_transaction(
                order_id=order_id,
                transaction_type="payment_completed",
                amount=processed.get("amount"),
                payhero_ref=processed.get("reference"),
                status="success"
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
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE orders 
            SET shipped_at = ?
            WHERE id = ?
        """, (datetime.now().isoformat(), order_id))
        conn.commit()
    
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
    
    # TODO: GPS verification for high-value orders (Dev 2 will implement)
    # if order["product_price"] > 10000 and confirmation.latitude and confirmation.longitude:
    #     gps_verified = await verify_gps_proximity(order_id, confirmation.latitude, confirmation.longitude)
    #     if not gps_verified:
    #         raise HTTPException(status_code=400, detail="GPS verification failed")
    
    # Update status
    update_order_status(order_id, "delivered")
    
    # Update delivered_at timestamp
    with get_db() as conn:
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
    
    return {
        "message": "Delivery confirmed. Funds released to seller.",
        "order_id": order_id,
        "status": "completed",
        "seller_payout": seller_amount,
        "platform_fee": platform_fee
    }

from fastapi import APIRouter, HTTPException, Query
from app.models.order import DisputeRequest
from database import get_db, get_order_by_id, update_order_status, log_transaction

router = APIRouter()


@router.post("/dispute/{order_id}")
async def raise_dispute(order_id: str, dispute: DisputeRequest):
    """Buyer or seller raises a dispute."""
    order = get_order_by_id(order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order["status"] not in ["paid", "shipped", "delivered"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot dispute this order. Current status: {order['status']}"
        )

    with get_db() as conn:
        cursor = conn.cursor()

        # Insert into disputes table
        cursor.execute("""
            INSERT INTO disputes (order_id, reason, evidence, status)
            VALUES (?, ?, ?, 'pending')
        """, (order_id, dispute.reason, dispute.evidence))

        conn.commit()

    # Update order status to disputed
    update_order_status(order_id, "disputed")

    # Log the dispute event
    log_transaction(
        order_id, "dispute_raised",
        status="pending",
        metadata=dispute.reason
    )

    return {
        "message": "Dispute raised. Admin will review within 48 hours.",
        "order_id": order_id
    }


@router.get("/disputes")
async def list_disputes(status: str = Query(default=None, description="Filter by status: pending, resolved")):
    """Admin: List all disputes."""
    with get_db() as conn:
        cursor = conn.cursor()

        if status:
            cursor.execute("""
                SELECT d.*, o.product_name, o.product_price, o.seller_name, o.buyer_name
                FROM disputes d
                JOIN orders o ON d.order_id = o.id
                WHERE d.status = ?
                ORDER BY d.created_at DESC
            """, (status,))
        else:
            cursor.execute("""
                SELECT d.*, o.product_name, o.product_price, o.seller_name, o.buyer_name
                FROM disputes d
                JOIN orders o ON d.order_id = o.id
                ORDER BY d.created_at DESC
            """)

        disputes = [dict(row) for row in cursor.fetchall()]

    return {"disputes": disputes, "count": len(disputes)}


@router.post("/resolve-dispute/{order_id}")
async def resolve_dispute(
    order_id: str,
    resolution: str = Query(..., description="Resolution: 'refund' or 'release'")
):
    """
    Admin resolves a dispute.

    resolution: "refund" (return money to buyer) or "release" (pay seller)
    """
    order = get_order_by_id(order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order["status"] != "disputed":
        raise HTTPException(status_code=400, detail="Order is not in disputed state")

    if resolution not in ("refund", "release"):
        raise HTTPException(status_code=400, detail="Resolution must be 'refund' or 'release'")

    new_status = "refunded" if resolution == "refund" else "completed"

    with get_db() as conn:
        cursor = conn.cursor()

        # Update dispute record
        cursor.execute("""
            UPDATE disputes
            SET status = 'resolved', resolution = ?, resolved_at = CURRENT_TIMESTAMP
            WHERE order_id = ? AND status = 'pending'
        """, (resolution, order_id))

        conn.commit()

    # Update order status
    update_order_status(order_id, new_status)

    # Log resolution
    log_transaction(
        order_id, "dispute_resolved",
        status="success",
        metadata=f"Resolution: {resolution}"
    )

    return {
        "message": f"Dispute resolved: {resolution}",
        "order_id": order_id,
        "new_status": new_status
    }

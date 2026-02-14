from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db

router = APIRouter()


class DisputeRequest(BaseModel):
    reason: str
    evidence: str = None


@router.post("/dispute/{order_id}")
async def raise_dispute(order_id: str, dispute: DisputeRequest):
    """Buyer or seller raises a dispute."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        order = cursor.fetchone()

        if not order:
            raise HTTPException(404, "Order not found")

        if order["status"] not in ["paid", "shipped", "delivered"]:
            raise HTTPException(400, "Cannot dispute this order")

        # Update order status
        cursor.execute("""
            UPDATE orders SET status = 'disputed' WHERE id = ?
        """, (order_id,))

        # Log dispute
        cursor.execute("""
            INSERT INTO transactions (order_id, type, status)
            VALUES (?, 'dispute_raised', ?)
        """, (order_id, dispute.reason))

        conn.commit()

    return {
        "message": "Dispute raised. Admin will review within 48 hours.",
        "order_id": order_id
    }


@router.get("/disputes")
async def list_disputes():
    """Admin: List all disputes."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM orders WHERE status = 'disputed'
            ORDER BY created_at DESC
        """)
        disputes = [dict(row) for row in cursor.fetchall()]

    return {"disputes": disputes, "count": len(disputes)}


@router.post("/resolve-dispute/{order_id}")
async def resolve_dispute(order_id: str, resolution: str = "refund"):
    """
    Admin resolves a dispute.

    resolution: "refund" (return money to buyer) or "release" (pay seller)
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        order = cursor.fetchone()

        if not order:
            raise HTTPException(404, "Order not found")

        if order["status"] != "disputed":
            raise HTTPException(400, "Order is not in disputed state")

        if resolution == "refund":
            new_status = "refunded"
        elif resolution == "release":
            new_status = "completed"
        else:
            raise HTTPException(400, "Resolution must be 'refund' or 'release'")

        cursor.execute("""
            UPDATE orders SET status = ? WHERE id = ?
        """, (new_status, order_id))

        cursor.execute("""
            INSERT INTO transactions (order_id, type, status)
            VALUES (?, 'dispute_resolved', ?)
        """, (order_id, resolution))

        conn.commit()

    return {
        "message": f"Dispute resolved: {resolution}",
        "order_id": order_id,
        "new_status": new_status
    }

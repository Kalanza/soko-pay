from fastapi import APIRouter, HTTPException, UploadFile, File
from datetime import datetime
import uuid
import os
import json
import shutil
from pathlib import Path
from app.models.order import Product, Order, CreatePaymentLinkResponse, OrderStatus, PhotoUploadResponse
from database import create_order, get_order_by_id, get_db, update_order_status
from app.services.ai_fraud import check_fraud_risk

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
        
        # Create payment link using configured frontend URL
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3001")
        payment_link = f"{frontend_url}/pay/{order_id}"
        
        # Extract location if provided
        seller_lat = product.seller_location.latitude if product.seller_location else None
        seller_lon = product.seller_location.longitude if product.seller_location else None
        
        # Convert photos list to JSON string for storage
        product_photos_json = json.dumps(product.photos) if product.photos else None
        
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
            seller_location_lon=seller_lon,
            product_photos=product_photos_json
        )
        
        if not order:
            raise HTTPException(status_code=500, detail="Failed to create order")
        
        # Run Gemini AI fraud detection
        try:
            fraud_result = await check_fraud_risk({
                "product_name": product.name,
                "price": product.price,
                "description": product.description,
                "seller_phone": product.seller_phone,
                "category": product.category
            })
            
            # Store fraud results in database
            update_order_status(
                order_id, "pending",
                fraud_risk_score=fraud_result.get("risk_score"),
                fraud_risk_level=fraud_result.get("risk_level"),
                fraud_flags=json.dumps(fraud_result.get("flags", []))
            )
        except Exception as fraud_err:
            print(f"Fraud detection warning (non-blocking): {fraud_err}")
        
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

@router.post("/fraud-check/{order_id}")
async def fraud_check(order_id: str):
    """
    Run AI fraud detection on an existing order.
    
    Returns risk score, risk level, reason, and flags.
    """
    order = get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    fraud_result = await check_fraud_risk({
        "product_name": order["product_name"],
        "price": order["product_price"],
        "description": order["product_description"],
        "seller_phone": order["seller_phone"],
        "category": order.get("product_category", "Other")
    })
    
    # Update order with fraud results
    update_order_status(
        order_id, order["status"],
        fraud_risk_score=fraud_result.get("risk_score"),
        fraud_risk_level=fraud_result.get("risk_level"),
        fraud_flags=json.dumps(fraud_result.get("flags", []))
    )
    
    return {
        "order_id": order_id,
        "fraud_detection": fraud_result
    }

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

@router.post("/upload-photo", response_model=PhotoUploadResponse)
async def upload_product_photo(file: UploadFile = File(...)):
    """
    Upload a product photo for a seller's listing.
    
    Supports: JPG, PNG, WebP (max 5MB each)
    Returns: Photo URL/path to use in create-payment-link
    
    Example usage:
    1. Upload photo: POST /api/upload-photo -> returns photo_url
    2. Use photo_url in Product.photos: [photo_url, ...]
    3. Create payment link with photos
    """
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type. Allowed: JPG, PNG, WebP. Got: {file.content_type}"
            )
        
        # Read file content
        content = await file.read()
        file_size_bytes = len(content)
        
        # Validate file size (max 5MB)
        max_size_bytes = 5 * 1024 * 1024
        if file_size_bytes > max_size_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"File too large: {file_size_bytes / 1024 / 1024:.1f}MB (max 5MB)"
            )
        
        # Create uploads directory if it doesn't exist
        uploads_dir = Path("uploads/products")
        uploads_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_ext = file.filename.split('.')[-1].lower()
        unique_filename = f"{uuid.uuid4().hex}_{datetime.utcnow().timestamp()}.{file_ext}"
        file_path = uploads_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Return URL path (relative path for serving)
        photo_url = f"/uploads/products/{unique_filename}"
        
        return PhotoUploadResponse(
            status="success",
            message=f"Photo uploaded successfully",
            photo_url=photo_url,
            file_size_kb=round(file_size_bytes / 1024, 2)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading photo: {str(e)}")

@router.get("/uploads/products/{filename}")
async def serve_product_photo(filename: str):
    """
    Serve uploaded product photos.
    
    Called when frontend displays product images.
    Example: GET /api/uploads/products/abc123.jpg
    """
    try:
        file_path = Path("uploads/products") / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Photo not found")
        
        # Security: Ensure the file is within the uploads directory
        if not str(file_path.resolve()).startswith(str(Path("uploads/products").resolve())):
            raise HTTPException(status_code=403, detail="Access denied")
        
        # For production, you'd return a FileResponse
        # For now, return file info
        return {
            "filename": filename,
            "file_path": str(file_path),
            "exists": file_path.exists()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving photo: {str(e)}")

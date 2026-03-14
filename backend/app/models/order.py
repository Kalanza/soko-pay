from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime
from typing import Optional, List

class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    DISPUTED = "disputed"
    REFUNDED = "refunded"
    FLAGGED = "flagged"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Location(BaseModel):
    latitude: float
    longitude: float
    address: Optional[str] = None

class Product(BaseModel):
    name: str = Field(..., min_length=3, max_length=200, description="Product name")
    price: float = Field(..., gt=0, description="Product price in KES")
    description: str = Field(..., max_length=1000, description="Product description")
    seller_phone: str = Field(..., pattern=r"^254[0-9]{9}$", description="Seller M-Pesa number")
    seller_name: str = Field(..., min_length=2, description="Seller name")
    category: Optional[str] = Field(default="Other", description="Product category")
    seller_location: Optional[Location] = None
    photos: Optional[List[str]] = Field(default=[], description="List of photo URLs/paths (uploaded via /upload-photo)")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Nike Air Max",
                "price": 4500,
                "description": "Brand new Nike Air Max shoes, size 42",
                "seller_phone": "254712345678",
                "seller_name": "Brian Kipchoge",
                "category": "Shoes",
                "photos": ["/uploads/products/nike_1.jpg", "/uploads/products/nike_2.jpg"]
            }
        }

class FraudCheck(BaseModel):
    risk_score: int = Field(..., ge=0, le=100, description="Risk score 0-100")
    risk_level: RiskLevel
    reason: str
    flags: list[str] = []

class LocationUpdate(BaseModel):
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    accuracy: Optional[float] = Field(None, description="GPS accuracy in meters")
    speed: Optional[float] = Field(None, description="Speed in km/h")
    heading: Optional[float] = Field(None, description="Heading in degrees (0-360)")
    address: Optional[str] = Field(None, description="Human-readable address")
    tracker_type: str = Field(default="delivery_person", description="Type of tracker (delivery_person, customer, etc)")

class LocationEvent(BaseModel):
    event: str = Field(..., description="Event type (delivery_started, delivery_completed, etc)")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None

class TrackingData(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[float] = None
    address: Optional[str] = None
    created_at: str
    distance_from_seller: Optional[float] = None

class TrackingSummary(BaseModel):
    order_id: str
    distance_to_destination: float
    current_position: Location
    destination: Location
    seller_location: Location
    eta: Optional[dict] = None
    pattern_analysis: Optional[dict] = None

class Order(BaseModel):
    id: str
    product_name: str
    product_price: float
    product_description: str
    product_category: Optional[str] = "Other"
    seller_phone: str
    seller_name: str
    buyer_phone: Optional[str] = ""
    buyer_name: Optional[str] = ""
    status: OrderStatus = OrderStatus.PENDING
    payment_link: str = ""
    payhero_ref: Optional[str] = ""
    fraud_risk_score: Optional[int] = None
    fraud_risk_level: Optional[str] = None
    fraud_flags: Optional[str] = None
    created_at: str
    paid_at: Optional[str] = None
    shipped_at: Optional[str] = None
    delivered_at: Optional[str] = None

class PaymentRequest(BaseModel):
    buyer_phone: str = Field(..., pattern=r"^254[0-9]{9}$", description="Buyer M-Pesa number")
    buyer_name: str = Field(..., min_length=2, description="Buyer name")

    class Config:
        json_schema_extra = {
            "example": {
                "buyer_phone": "254712345678",
                "buyer_name": "Mercy Wanjiru"
            }
        }

class DeliveryConfirmation(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class DisputeRequest(BaseModel):
    reason: str = Field(..., min_length=10, description="Dispute reason")
    evidence: Optional[str] = None

class CreatePaymentLinkResponse(BaseModel):
    order_id: str
    payment_link: str
    message: str

class PhotoUploadResponse(BaseModel):
    status: str
    message: str
    photo_url: str
    file_size_kb: float

class PaymentResponse(BaseModel):
    message: str
    order_id: str
    payhero_response: Optional[dict] = None

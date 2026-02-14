import os
import requests
from typing import Optional

PAYHERO_API_KEY = os.getenv("PAYHERO_API_KEY", "")
PAYHERO_BASE_URL = "https://backend.payhero.co.ke/api/v2"

def initiate_payment(
    amount: float,
    phone_number: str,
    order_id: str,
    description: str = "Soko Pay Escrow Payment"
) -> dict:
    """
    Initiate M-Pesa STK push via PayHero API.
    
    Args:
        amount: Amount in KES
        phone_number: Kenya phone number (254XXXXXXXXX)
        order_id: Unique order identifier
        description: Payment description
    
    Returns:
        dict: PayHero API response with transaction reference
    
    Raises:
        Exception: If PayHero API call fails
    """
    
    if not PAYHERO_API_KEY:
        raise Exception("PayHero API key not configured")
    
    headers = {
        "Authorization": f"Bearer {PAYHERO_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "amount": int(amount),  # PayHero expects integer
        "phone_number": phone_number,
        "channel_id": int(os.getenv("PAYHERO_CHANNEL_ID", "1")),
        "provider": "mpesa",
        "external_reference": order_id,
        "callback_url": f"{os.getenv('API_BASE_URL', 'https://soko-pay.vercel.app')}/api/payhero/callback"
    }
    
    try:
        response = requests.post(
            f"{PAYHERO_BASE_URL}/payments",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        response.raise_for_status()
        
        data = response.json()
        
        return {
            "success": True,
            "reference": data.get("reference"),
            "amount": amount,
            "phone": phone_number,
            "message": "STK push sent. Please check your phone to complete payment."
        }
    
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to initiate payment. Please try again."
        }

def verify_payment(reference: str) -> Optional[dict]:
    """
    Verify payment status from PayHero.
    
    Args:
        reference: PayHero transaction reference
    
    Returns:
        dict: Payment verification result or None if failed
    """
    
    if not PAYHERO_API_KEY:
        return None
    
    headers = {
        "Authorization": f"Bearer {PAYHERO_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(
            f"{PAYHERO_BASE_URL}/payments/{reference}",
            headers=headers,
            timeout=15
        )
        
        response.raise_for_status()
        return response.json()
    
    except requests.exceptions.RequestException:
        return None

def process_callback(callback_data: dict) -> dict:
    """
    Process PayHero payment callback.
    
    Args:
        callback_data: Raw callback data from PayHero
    
    Returns:
        dict: Processed callback information
    """
    
    return {
        "reference": callback_data.get("reference"),
        "status": callback_data.get("status"),
        "amount": callback_data.get("amount"),
        "phone": callback_data.get("phone_number"),
        "mpesa_ref": callback_data.get("mpesa_reference"),
        "external_ref": callback_data.get("external_reference"),  # This is our order_id
        "timestamp": callback_data.get("created_at")
    }

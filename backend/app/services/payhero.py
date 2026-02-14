import os
import requests
import json
from typing import Optional

# PayHero Basic Auth token (base64 encoded API_Username:API_Password)
PAYHERO_AUTH_TOKEN = os.getenv("PAYHERO_AUTH_TOKEN", "")
PAYHERO_CHANNEL_ID = int(os.getenv("PAYHERO_CHANNEL_ID", "5520"))
PAYHERO_BASE_URL = "https://backend.payhero.co.ke/api/v2"
CALLBACK_URL = os.getenv("CALLBACK_URL", "https://soko-pay.vercel.app/api/payhero/callback")


def initiate_payment(
    amount: float,
    phone_number: str,
    order_id: str,
    description: str = "Soko Pay Escrow Payment",
    customer_name: str = ""
) -> dict:
    """
    Initiate M-Pesa STK push via PayHero API.

    Args:
        amount: Amount in KES
        phone_number: Kenya phone number (0711XXXXXX or 254XXXXXXXXX)
        order_id: Unique order identifier
        description: Payment description
        customer_name: Name of the customer paying

    Returns:
        dict: PayHero API response with transaction reference
    """

    if not PAYHERO_AUTH_TOKEN:
        raise Exception("PayHero auth token not configured. Set PAYHERO_AUTH_TOKEN in .env")

    headers = {
        "Authorization": PAYHERO_AUTH_TOKEN,
        "Content-Type": "application/json"
    }

    payload = {
        "amount": int(amount),
        "phone_number": phone_number,
        "channel_id": PAYHERO_CHANNEL_ID,
        "provider": "m-pesa",
        "external_reference": f"SOKO-{order_id}",
        "customer_name": customer_name or "Soko Pay Customer",
        "callback_url": CALLBACK_URL
    }

    try:
        response = requests.post(
            f"{PAYHERO_BASE_URL}/payments",
            headers=headers,
            data=json.dumps(payload),
            timeout=30
        )

        response.raise_for_status()

        data = response.json()

        if data.get("success"):
            return {
                "success": True,
                "reference": data.get("reference"),
                "checkout_request_id": data.get("CheckoutRequestID"),
                "amount": amount,
                "phone": phone_number,
                "message": "STK push sent. Please check your phone to complete payment."
            }
        else:
            return {
                "success": False,
                "error": data,
                "message": "STK push request failed. Please try again."
            }

    except requests.exceptions.RequestException as e:
        error_detail = ""
        if hasattr(e, 'response') and e.response is not None:
            error_detail = f" Status: {e.response.status_code}, Body: {e.response.text}"
        return {
            "success": False,
            "error": str(e) + error_detail,
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

    if not PAYHERO_AUTH_TOKEN:
        return None

    headers = {
        "Authorization": PAYHERO_AUTH_TOKEN,
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

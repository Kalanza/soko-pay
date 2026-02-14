"""
Quick API test script for Soko Pay Backend
Run this to test the core endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test health endpoint"""
    print("\n🔍 Testing Health Check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_create_payment_link():
    """Test creating a payment link"""
    print("\n🔍 Testing Create Payment Link...")
    
    product = {
        "name": "Nike Air Max Shoes",
        "price": 4500,
        "description": "Brand new Nike Air Max, size 42",
        "seller_phone": "254712345678",
        "seller_name": "Brian Kipchoge",
        "category": "Shoes"
    }
    
    response = requests.post(f"{BASE_URL}/api/create-payment-link", json=product)
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")
    
    if response.status_code == 200:
        return data["order_id"]
    return None

def test_track_order(order_id):
    """Test tracking an order"""
    print(f"\n🔍 Testing Track Order: {order_id}")
    
    response = requests.get(f"{BASE_URL}/api/track/{order_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def run_tests():
    """Run all tests"""
    print("🚀 Starting Soko Pay API Tests")
    print("=" * 50)
    
    # Test 1: Health Check
    if not test_health_check():
        print("❌ Health check failed!")
        return
    print("✅ Health check passed!")
    
    # Test 2: Create Payment Link
    order_id = test_create_payment_link()
    if not order_id:
        print("❌ Create payment link failed!")
        return
    print(f"✅ Payment link created! Order ID: {order_id}")
    
    # Test 3: Track Order
    if not test_track_order(order_id):
        print("❌ Track order failed!")
        return
    print("✅ Order tracking passed!")
    
    print("\n" + "=" * 50)
    print("🎉 All tests passed!")
    print(f"\n📍 Payment Link: https://soko-pay.vercel.app/pay/{order_id}")
    print(f"📍 API Docs: {BASE_URL}/docs")

if __name__ == "__main__":
    try:
        run_tests()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to API server")
        print("Make sure the server is running: python -m uvicorn main:app --reload")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

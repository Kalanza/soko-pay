import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime

# Use /tmp on Heroku (ephemeral filesystem) or local path
DATABASE_PATH = os.getenv("DATABASE_PATH", "soko_pay.db")

def init_db():
    """Initialize database with schema"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Orders table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            product_name TEXT NOT NULL,
            product_price REAL NOT NULL,
            product_description TEXT,
            product_category TEXT,
            seller_phone TEXT NOT NULL,
            seller_name TEXT NOT NULL,
            seller_location_lat REAL,
            seller_location_lon REAL,
            buyer_phone TEXT,
            buyer_name TEXT,
            status TEXT DEFAULT 'pending',
            payment_link TEXT,
            payhero_ref TEXT,
            fraud_risk_score INTEGER,
            fraud_risk_level TEXT,
            fraud_flags TEXT,
            product_photos TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            paid_at TIMESTAMP,
            shipped_at TIMESTAMP,
            delivered_at TIMESTAMP
        )
    """)
    
    # Transactions table for logging
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            type TEXT NOT NULL,
            amount REAL,
            status TEXT,
            payhero_transaction_id TEXT,
            metadata TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id)
        )
    """)
    
    # Disputes table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS disputes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            reason TEXT NOT NULL,
            evidence TEXT,
            status TEXT DEFAULT 'pending',
            resolved_at TIMESTAMP,
            resolution TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id)
        )
    """)
    
    # Location tracking table for real-time tracking
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS location_tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            tracker_type TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            accuracy REAL,
            speed REAL,
            heading REAL,
            address TEXT,
            distance_from_seller REAL,
            metadata TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id)
        )
    """)
    
    # Location history summary for analytics
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS location_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            event TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id)
        )
    """)
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully")

@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # Enable dict-like access
    try:
        yield conn
    finally:
        conn.close()

def get_order_by_id(order_id: str):
    """Get order by ID"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None

def create_order(**order_data):
    """Create a new order"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO orders (
                id, product_name, product_price, product_description,
                product_category, seller_phone, seller_name,
                seller_location_lat, seller_location_lon,
                payment_link, product_photos, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order_data['order_id'],
            order_data['product_name'],
            order_data['product_price'],
            order_data['product_description'],
            order_data.get('product_category', 'Other'),
            order_data['seller_phone'],
            order_data['seller_name'],
            order_data.get('seller_location_lat'),
            order_data.get('seller_location_lon'),
            order_data['payment_link'],
            order_data.get('product_photos'),  # JSON string of photos list
            'pending'
        ))
        conn.commit()
        return order_data['order_id']

def update_order_status(order_id: str, status: str, **kwargs):
    """Update order status and additional fields"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        updates = ["status = ?"]
        values = [status]
        
        # Add timestamp based on status
        if status == 'paid':
            updates.append("paid_at = CURRENT_TIMESTAMP")
        elif status == 'shipped':
            updates.append("shipped_at = CURRENT_TIMESTAMP")
        elif status == 'delivered' or status == 'completed':
            updates.append("delivered_at = CURRENT_TIMESTAMP")
        
        # Add optional fields
        if 'buyer_phone' in kwargs:
            updates.append("buyer_phone = ?")
            values.append(kwargs['buyer_phone'])
        
        if 'buyer_name' in kwargs:
            updates.append("buyer_name = ?")
            values.append(kwargs['buyer_name'])
        
        if 'payhero_ref' in kwargs:
            updates.append("payhero_ref = ?")
            values.append(kwargs['payhero_ref'])
        
        if 'fraud_risk_score' in kwargs:
            updates.append("fraud_risk_score = ?")
            values.append(kwargs['fraud_risk_score'])
        
        if 'fraud_risk_level' in kwargs:
            updates.append("fraud_risk_level = ?")
            values.append(kwargs['fraud_risk_level'])
        
        if 'fraud_flags' in kwargs:
            updates.append("fraud_flags = ?")
            values.append(kwargs['fraud_flags'])
        
        values.append(order_id)
        
        query = f"UPDATE orders SET {', '.join(updates)} WHERE id = ?"
        cursor.execute(query, values)
        conn.commit()
        
        return cursor.rowcount > 0

def log_transaction(order_id: str, transaction_type: str = None, trans_type: str = None, **kwargs):
    """Log a transaction"""
    tx_type = transaction_type or trans_type or "unknown"
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO transactions (
                order_id, type, amount, status, payhero_transaction_id, metadata
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            order_id,
            tx_type,
            kwargs.get('amount'),
            kwargs.get('status'),
            kwargs.get('payhero_transaction_id') or kwargs.get('payhero_ref'),
            kwargs.get('metadata')
        ))
        conn.commit()

def log_location(order_id: str, tracker_type: str, latitude: float, longitude: float, **kwargs):
    """Log a location update for real-time tracking"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO location_tracking (
                order_id, tracker_type, latitude, longitude, accuracy, 
                speed, heading, address, distance_from_seller, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order_id,
            tracker_type,
            latitude,
            longitude,
            kwargs.get('accuracy'),
            kwargs.get('speed'),
            kwargs.get('heading'),
            kwargs.get('address'),
            kwargs.get('distance_from_seller'),
            kwargs.get('metadata')
        ))
        conn.commit()
        return cursor.lastrowid

def get_location_history(order_id: str, limit: int = 50):
    """Get location history for an order"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM location_tracking 
            WHERE order_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        """, (order_id, limit))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_latest_location(order_id: str, tracker_type: str = None):
    """Get the latest location for an order"""
    with get_db() as conn:
        cursor = conn.cursor()
        if tracker_type:
            cursor.execute("""
                SELECT * FROM location_tracking 
                WHERE order_id = ? AND tracker_type = ?
                ORDER BY created_at DESC 
                LIMIT 1
            """, (order_id, tracker_type))
        else:
            cursor.execute("""
                SELECT * FROM location_tracking 
                WHERE order_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            """, (order_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def log_location_event(order_id: str, event: str, latitude: float = None, longitude: float = None, description: str = None):
    """Log a location event (like 'delivery_started', 'delivery_completed')"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO location_history (
                order_id, event, latitude, longitude, description
            ) VALUES (?, ?, ?, ?, ?)
        """, (order_id, event, latitude, longitude, description))
        conn.commit()
        return cursor.lastrowid

def get_location_events(order_id: str):
    """Get all location events for an order"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM location_history 
            WHERE order_id = ? 
            ORDER BY created_at ASC
        """, (order_id,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

# Initialize database on import
if __name__ == "__main__":
    init_db()

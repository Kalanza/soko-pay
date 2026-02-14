import sqlite3
from contextlib import contextmanager
from datetime import datetime

DATABASE_PATH = "soko_pay.db"

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

def create_order(order_data: dict):
    """Create a new order"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO orders (
                id, product_name, product_price, product_description,
                product_category, seller_phone, seller_name,
                seller_location_lat, seller_location_lon,
                payment_link, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order_data['id'],
            order_data['product_name'],
            order_data['product_price'],
            order_data['product_description'],
            order_data.get('product_category', 'Other'),
            order_data['seller_phone'],
            order_data['seller_name'],
            order_data.get('seller_location_lat'),
            order_data.get('seller_location_lon'),
            order_data['payment_link'],
            'pending'
        ))
        conn.commit()
        return order_data['id']

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

def log_transaction(order_id: str, trans_type: str, **kwargs):
    """Log a transaction"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO transactions (
                order_id, type, amount, status, payhero_transaction_id, metadata
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            order_id,
            trans_type,
            kwargs.get('amount'),
            kwargs.get('status'),
            kwargs.get('payhero_transaction_id'),
            kwargs.get('metadata')
        ))
        conn.commit()

# Initialize database on import
if __name__ == "__main__":
    init_db()

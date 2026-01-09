from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import os

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# PostgreSQL connection configuration from Hostinger
DB_CONFIG = {
    "host": "72.60.97.209",
    "port": 5432,
    "database": "n8n_test_db",
    "user": "n8n_user",
    "password": os.environ.get("DB_PASSWORD", "")  # Will be set via environment variable
}

class WaitlistEntry(BaseModel):
    full_name: str
    work_email: EmailStr
    company_name: str
    business_type: str

def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

def init_database():
    """Initialize the database table if it doesn't exist"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create waitlist table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS waitlist_signups (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                work_email VARCHAR(255) UNIQUE NOT NULL,
                company_name VARCHAR(255) NOT NULL,
                business_type VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address VARCHAR(45),
                user_agent TEXT
            );
        """)
        
        # Create index on email for faster lookups
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_waitlist_email 
            ON waitlist_signups(work_email);
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization error: {e}")

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_database()

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "waitlist-api"}

@app.post("/api/waitlist")
async def submit_waitlist(entry: WaitlistEntry):
    """Submit a new waitlist entry"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if email already exists
        cursor.execute(
            "SELECT id FROM waitlist_signups WHERE work_email = %s",
            (entry.work_email,)
        )
        existing = cursor.fetchone()
        
        if existing:
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="This email is already registered in our waitlist"
            )
        
        # Insert new entry
        cursor.execute("""
            INSERT INTO waitlist_signups 
            (full_name, work_email, company_name, business_type)
            VALUES (%s, %s, %s, %s)
            RETURNING id, created_at
        """, (
            entry.full_name,
            entry.work_email,
            entry.company_name,
            entry.business_type
        ))
        
        result = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "message": "Successfully joined the waitlist!",
            "id": result['id'],
            "created_at": result['created_at'].isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error submitting waitlist entry: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to submit waitlist entry. Please try again."
        )

@app.get("/api/waitlist/count")
async def get_waitlist_count():
    """Get total number of waitlist signups"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM waitlist_signups")
        count = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return {"count": count}
        
    except Exception as e:
        print(f"Error getting waitlist count: {e}")
        raise HTTPException(status_code=500, detail="Failed to get waitlist count")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

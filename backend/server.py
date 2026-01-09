from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from pymongo import MongoClient, ASCENDING
from pymongo.errors import DuplicateKeyError
from datetime import datetime
from typing import Optional
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

# MongoDB connection - using local MongoDB
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017/")
DB_NAME = "skillvore_db"
COLLECTION_NAME = "waitlist_signups"

# Global MongoDB client
mongo_client = None
db = None
collection = None

def get_database():
    """Get MongoDB database connection"""
    global mongo_client, db, collection
    
    if mongo_client is None:
        try:
            mongo_client = MongoClient(MONGO_URL)
            db = mongo_client[DB_NAME]
            collection = db[COLLECTION_NAME]
            
            # Create unique index on email
            collection.create_index([("work_email", ASCENDING)], unique=True)
            
            print(f"✅ Connected to MongoDB: {DB_NAME}")
        except Exception as e:
            print(f"❌ MongoDB connection error: {e}")
            raise HTTPException(status_code=500, detail="Database connection failed")
    
    return collection

class WaitlistEntry(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    work_email: EmailStr
    company_name: str = Field(..., min_length=1, max_length=255)
    business_type: str = Field(..., min_length=1, max_length=100)

class WaitlistResponse(BaseModel):
    success: bool
    message: str
    id: Optional[str] = None
    created_at: Optional[str] = None

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    get_database()

@app.on_event("shutdown")
async def shutdown_event():
    """Close MongoDB connection on shutdown"""
    global mongo_client
    if mongo_client:
        mongo_client.close()
        print("MongoDB connection closed")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Ping MongoDB to check connection
        mongo_client.admin.command('ping')
        return {
            "status": "healthy",
            "service": "waitlist-api",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "waitlist-api",
            "database": "disconnected",
            "error": str(e)
        }

@app.post("/api/waitlist", response_model=WaitlistResponse)
async def submit_waitlist(entry: WaitlistEntry):
    """Submit a new waitlist entry"""
    try:
        collection = get_database()
        
        # Prepare document
        document = {
            "full_name": entry.full_name,
            "work_email": entry.work_email.lower(),  # Store email in lowercase
            "company_name": entry.company_name,
            "business_type": entry.business_type,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert document
        result = collection.insert_one(document)
        
        return WaitlistResponse(
            success=True,
            message="Successfully joined the waitlist! We'll be in touch soon.",
            id=str(result.inserted_id),
            created_at=document["created_at"].isoformat()
        )
        
    except DuplicateKeyError:
        raise HTTPException(
            status_code=400,
            detail="This email is already registered in our waitlist."
        )
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
        collection = get_database()
        count = collection.count_documents({})
        
        return {
            "success": True,
            "count": count
        }
        
    except Exception as e:
        print(f"Error getting waitlist count: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get waitlist count"
        )

@app.get("/api/waitlist/all")
async def get_all_waitlist():
    """Get all waitlist entries (for admin use)"""
    try:
        collection = get_database()
        
        # Get all documents, sorted by most recent first
        entries = list(collection.find(
            {},
            {"_id": 0}  # Exclude MongoDB _id from response
        ).sort("created_at", -1))
        
        # Convert datetime to string for JSON serialization
        for entry in entries:
            if "created_at" in entry:
                entry["created_at"] = entry["created_at"].isoformat()
            if "updated_at" in entry:
                entry["updated_at"] = entry["updated_at"].isoformat()
        
        return {
            "success": True,
            "count": len(entries),
            "entries": entries
        }
        
    except Exception as e:
        print(f"Error getting waitlist entries: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get waitlist entries"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

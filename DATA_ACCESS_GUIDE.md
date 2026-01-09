# 📊 Your Waitlist Data - Complete Access Guide

## Database Information

**Location:** Local MongoDB on Emergent Platform
**Connection String:** `mongodb://localhost:27017/`
**Database Name:** `skillvore_db`
**Collection Name:** `waitlist_signups`
**Status:** ✅ Running and Accessible

---

## 🔑 How to Access Your Data

### Method 1: Via API Endpoints (Recommended)

**Get All Entries:**
```bash
curl http://localhost:8001/api/waitlist/all
```

**Get Count:**
```bash
curl http://localhost:8001/api/waitlist/count
```

**Check Health:**
```bash
curl http://localhost:8001/api/health
```

### Method 2: Export to CSV/JSON

**Run the export script:**
```bash
cd /app/backend
python3 export_waitlist.py
```

**Files created:**
- `/app/waitlist_export.csv` - Excel-compatible CSV format
- `/app/waitlist_export.json` - JSON format for programmatic access

### Method 3: Direct MongoDB Access

**Connect to MongoDB:**
```bash
mongosh mongodb://localhost:27017/skillvore_db
```

**Common Commands:**
```javascript
// View all entries
db.waitlist_signups.find().pretty()

// Count entries
db.waitlist_signups.count()

// Find by email
db.waitlist_signups.findOne({work_email: "test@example.com"})

// Get latest 10 entries
db.waitlist_signups.find().sort({created_at: -1}).limit(10)

// Find by business type
db.waitlist_signups.find({business_type: "E-commerce Sellers"})

// Export to JSON file
mongoexport --db=skillvore_db --collection=waitlist_signups --out=export.json
```

### Method 4: Python Script Access

```python
from pymongo import MongoClient

# Connect
client = MongoClient('mongodb://localhost:27017/')
db = client['skillvore_db']
collection = db['waitlist_signups']

# Get all entries
entries = list(collection.find())

# Print each entry
for entry in entries:
    print(f"Name: {entry['full_name']}")
    print(f"Email: {entry['work_email']}")
    print(f"Company: {entry['company_name']}")
    print("---")

client.close()
```

---

## 📈 Data Structure

Each waitlist entry contains:

```json
{
  "_id": "MongoDB ObjectId (unique identifier)",
  "full_name": "User's full name",
  "work_email": "user@company.com (unique, lowercase)",
  "company_name": "Company name",
  "business_type": "Selected business category",
  "created_at": "2026-01-09T14:31:18.846000",
  "updated_at": "2026-01-09T14:31:18.846000"
}
```

---

## 🔒 Data Ownership & Security

- ✅ **100% Your Data:** All data is stored in your local MongoDB instance
- ✅ **No External Access:** Database is not exposed outside the platform
- ✅ **Full Control:** You can export, modify, or delete data anytime
- ✅ **Backup:** Data persists across server restarts
- ✅ **Privacy:** Email uniqueness prevents duplicates

---

## 📥 Export Your Data Anytime

**Quick Export:**
```bash
# Export to CSV (opens in Excel/Google Sheets)
python3 /app/backend/export_waitlist.py

# Files will be created at:
# - /app/waitlist_export.csv
# - /app/waitlist_export.json
```

**Download Files:**
You can download these exported files directly from the Emergent file system.

---

## 🔍 Query Examples

**Find entries by date:**
```javascript
// Entries from today
db.waitlist_signups.find({
  created_at: {
    $gte: new Date("2026-01-09T00:00:00Z")
  }
})
```

**Count by business type:**
```javascript
db.waitlist_signups.aggregate([
  {
    $group: {
      _id: "$business_type",
      count: { $sum: 1 }
    }
  }
])
```

**Get email list:**
```javascript
db.waitlist_signups.distinct("work_email")
```

---

## 🛠️ Maintenance Commands

**View database size:**
```bash
mongo skillvore_db --eval "db.stats()"
```

**Backup database:**
```bash
mongodump --db=skillvore_db --out=/app/backup/
```

**Restore database:**
```bash
mongorestore --db=skillvore_db /app/backup/skillvore_db/
```

**Delete all test entries:**
```javascript
db.waitlist_signups.deleteMany({work_email: /test@/})
```

---

## 📊 Current Statistics

Total Entries: 2
Latest Signup: vikas bahuguna (info@skillvore.com)
Database: skillvore_db
Collection: waitlist_signups

---

## 🚨 Important Notes

1. **Data Persistence:** Your data is stored locally and persists across restarts
2. **No External Dependency:** No external database service required
3. **Real-time Updates:** Data updates immediately when forms are submitted
4. **Email Validation:** Duplicate emails are automatically prevented
5. **Export Anytime:** Run the export script whenever you need the data

---

## 📞 Need More Access?

If you need to:
- Set up automated exports
- Create a dashboard to view data
- Set up email notifications for new signups
- Export data in other formats
- Add more fields to the form

Just let me know and I'll help you set it up!

---

**Your data is 100% yours and always accessible!** 🔓

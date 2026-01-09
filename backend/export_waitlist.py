#!/usr/bin/env python3
"""
Waitlist Data Export Script
Export your waitlist data to CSV or JSON format
"""

from pymongo import MongoClient
import csv
import json
from datetime import datetime

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['skillvore_db']
collection = db['waitlist_signups']

def export_to_csv(filename='waitlist_export.csv'):
    """Export waitlist data to CSV"""
    entries = list(collection.find())
    
    if not entries:
        print("No data to export")
        return
    
    # CSV headers
    headers = ['ID', 'Full Name', 'Work Email', 'Company Name', 'Business Type', 'Created At']
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        
        for entry in entries:
            writer.writerow([
                str(entry['_id']),
                entry['full_name'],
                entry['work_email'],
                entry['company_name'],
                entry['business_type'],
                entry['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            ])
    
    print(f"✅ Exported {len(entries)} entries to {filename}")

def export_to_json(filename='waitlist_export.json'):
    """Export waitlist data to JSON"""
    entries = list(collection.find())
    
    # Convert MongoDB objects to JSON-serializable format
    for entry in entries:
        entry['_id'] = str(entry['_id'])
        entry['created_at'] = entry['created_at'].isoformat()
        entry['updated_at'] = entry['updated_at'].isoformat()
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Exported {len(entries)} entries to {filename}")

def print_summary():
    """Print database summary"""
    total = collection.count_documents({})
    print(f"\n📊 Database Summary:")
    print(f"   Total Entries: {total}")
    print(f"   Database: skillvore_db")
    print(f"   Collection: waitlist_signups")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("WAITLIST DATA EXPORT TOOL")
    print("="*60)
    
    print_summary()
    
    print("\nExporting data...")
    export_to_csv('/app/waitlist_export.csv')
    export_to_json('/app/waitlist_export.json')
    
    print("\n✅ Export complete!")
    print("   CSV file: /app/waitlist_export.csv")
    print("   JSON file: /app/waitlist_export.json")
    print("\n" + "="*60)
    
    client.close()

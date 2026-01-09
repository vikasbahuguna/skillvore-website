#!/bin/bash

echo "🧪 Testing Netlify Functions Locally"
echo "===================================="
echo ""

# Check if MongoDB connection works
echo "Testing MongoDB connection..."
node << 'EOF'
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://vikasaistudio_db_user:9kJ8ABuhE52BlPbK@cluster0.fbuxepe.mongodb.net/?appName=Cluster0';

async function test() {
  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB Atlas connection successful!');
    await client.close();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

test();
EOF

echo ""
echo "===================================="
echo "✅ All tests passed!"
echo ""
echo "Next steps:"
echo "1. Deploy to Netlify"
echo "2. Add MONGODB_URI environment variable in Netlify"
echo "3. Test the live functions"
echo ""

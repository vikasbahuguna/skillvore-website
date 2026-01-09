const { MongoClient } = require('mongodb');

// MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vikasaistudio_db_user:9kJ8ABuhE52BlPbK@cluster0.fbuxepe.mongodb.net/?appName=Cluster0';
const DB_NAME = 'skillvore_db';
const COLLECTION_NAME = 'waitlist_signups';

// Cached MongoDB client
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,
    tlsAllowInvalidCertificates: false,
    serverSelectionTimeoutMS: 5000,
  });

  const db = client.db(DB_NAME);

  // Create unique index on email if it doesn't exist
  try {
    await db.collection(COLLECTION_NAME).createIndex(
      { work_email: 1 },
      { unique: true }
    );
  } catch (error) {
    console.log('Index might already exist:', error.message);
  }

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

exports.handler = async (event, context) => {
  // Set context to reuse connections
  context.callbackWaitsForEmptyEventLoop = false;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const data = JSON.parse(event.body);
    
    // Validate required fields
    const { full_name, work_email, company_name, business_type } = data;
    
    if (!full_name || !work_email || !company_name || !business_type) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          detail: 'All fields are required',
        }),
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(work_email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          detail: 'Invalid email format',
        }),
      };
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    // Check if email already exists
    const existingEntry = await collection.findOne({
      work_email: work_email.toLowerCase(),
    });

    if (existingEntry) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          detail: 'This email is already registered in our waitlist.',
        }),
      };
    }

    // Insert new entry
    const document = {
      full_name: full_name.trim(),
      work_email: work_email.toLowerCase().trim(),
      company_name: company_name.trim(),
      business_type: business_type.trim(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await collection.insertOne(document);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Successfully joined the waitlist! We'll be in touch soon.",
        id: result.insertedId.toString(),
        created_at: document.created_at.toISOString(),
      }),
    };

  } catch (error) {
    console.error('Error:', error);

    // Handle duplicate key error (backup check)
    if (error.code === 11000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          detail: 'This email is already registered in our waitlist.',
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        detail: 'Failed to submit waitlist entry. Please try again.',
        error: error.message,
      }),
    };
  }
};

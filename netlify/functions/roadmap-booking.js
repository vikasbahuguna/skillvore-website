const { MongoClient } = require('mongodb');
const { getRecommendedAgents } = require('./config/agent-mapping');

// MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vikasaistudio_db_user:9kJ8ABuhE52BlPbK@cluster0.fbuxepe.mongodb.net/?appName=Cluster0';
const DB_NAME = 'skillvore_db';
const COLLECTION_NAME = 'roadmap_bookings';

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

  // Create index on email
  try {
    await db.collection(COLLECTION_NAME).createIndex(
      { work_email: 1 }
    );
  } catch (error) {
    console.log('Index might already exist:', error.message);
  }

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Validate required fields
    const { 
      full_name, 
      work_email, 
      phone_number, 
      company_name,
      company_size,
      role,
      pain_points,
      ai_help_area,
      timeline,
      current_tools
    } = data;
    
    if (!full_name || !work_email || !phone_number || !company_name) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          detail: 'All mandatory fields are required (name, email, phone, company)',
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

    // Validate phone number (basic validation)
    const phoneRegex = /^[0-9+\-\s()]{8,}$/;
    if (!phoneRegex.test(phone_number)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          detail: 'Invalid phone number format',
        }),
      };
    }

    // Get AI agent recommendations based on pain points
    const recommendations = getRecommendedAgents(
      pain_points || [],
      ai_help_area
    );

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    // Insert new entry with recommendations
    const document = {
      // Contact Information
      full_name: full_name.trim(),
      work_email: work_email.toLowerCase().trim(),
      phone_number: phone_number.trim(),
      company_name: company_name.trim(),
      
      // Business Context
      company_size: company_size || null,
      role: role || null,
      
      // Pain Discovery
      pain_points: pain_points || [],
      ai_help_area: ai_help_area || null,
      
      // Qualification
      timeline: timeline || null,
      current_tools: current_tools || null,
      
      // AI Recommendations (calculated)
      recommendations: recommendations,
      top_priority_agent: recommendations.top_priority_agent,
      
      // Metadata
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
      source: 'website',
    };

    const result = await collection.insertOne(document);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Successfully booked your AI Roadmap session! We'll contact you within 24 hours.",
        id: result.insertedId.toString(),
        created_at: document.created_at.toISOString(),
        top_priority_agent: recommendations.top_priority_agent ? recommendations.top_priority_agent.agent : null,
      }),
    };

  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        detail: 'Failed to submit booking. Please try again.',
        error: error.message,
      }),
    };
  }
};

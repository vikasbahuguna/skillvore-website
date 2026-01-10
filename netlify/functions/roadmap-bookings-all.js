const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vikasaistudio_db_user:9kJ8ABuhE52BlPbK@cluster0.fbuxepe.mongodb.net/?appName=Cluster0';
const DB_NAME = 'skillvore_db';
const COLLECTION_NAME = 'roadmap_bookings';

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
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const entries = await collection
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    const serializedEntries = entries.map(entry => ({
      id: entry._id.toString(),
      full_name: entry.full_name,
      work_email: entry.work_email,
      phone_number: entry.phone_number,
      company_name: entry.company_name,
      company_size: entry.company_size,
      role: entry.role,
      pain_points: entry.pain_points,
      ai_help_area: entry.ai_help_area,
      timeline: entry.timeline,
      current_tools: entry.current_tools,
      top_priority_agent: entry.top_priority_agent,
      recommendations: entry.recommendations,
      status: entry.status,
      created_at: entry.created_at.toISOString(),
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count: serializedEntries.length,
        entries: serializedEntries,
      }),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        detail: 'Failed to get roadmap bookings',
        error: error.message,
      }),
    };
  }
};

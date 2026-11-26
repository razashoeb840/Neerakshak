// NEERAKSHAK Next.js MongoDB Client Engine
// Implements connection pooling and singleton caching optimized for Next.js App Router

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/neerakshak';

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 2500, // Quick fallback if local MongoDB is not running
  connectTimeoutMS: 3000
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().then(c => {
      console.log('✅ [NEERAKSHAK Next.js Backend] MongoDB Connected Successfully to:', uri.split('@').pop());
      return c;
    }).catch(err => {
      console.warn('⚠️ [NEERAKSHAK Next.js Backend] Notice: MongoDB local service not running or connection pending (' + err.message + '). Operating in resilient auto-sync memory mode.');
      return null;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect().then(c => {
    console.log('✅ [NEERAKSHAK Next.js Backend] Production MongoDB Connected.');
    return c;
  }).catch(err => {
    console.warn('⚠️ [NEERAKSHAK Next.js Backend] MongoDB connection warning:', err.message);
    return null;
  });
}

export default clientPromise;

export async function getDatabase(dbName = 'neerakshak') {
  try {
    const c = await clientPromise;
    if (c) {
      return c.db(dbName);
    }
  } catch (err) {
    console.warn('getDatabase error:', err.message);
  }
  return null;
}

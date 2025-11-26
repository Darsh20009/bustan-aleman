import mongoose from 'mongoose';

let isConnected = false;

export async function connectMongoDB(): Promise<void> {
  if (isConnected) {
    console.log('✅ MongoDB already connected');
    return;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('⚠️  MONGODB_URI not found. MongoDB connection skipped.');
    return;
  }

  try {
    console.log('🔗 Attempting to connect to MongoDB Atlas...');
    
    await mongoose.connect(mongoUri, {
      dbName: 'bustan',
    });

    isConnected = true;
    console.log('✅ Successfully connected to MongoDB Atlas');

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
      isConnected = false;
    });

  } catch (error: any) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

export function isMongoConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export { mongoose };

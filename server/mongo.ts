import mongoose from 'mongoose';

/**
 * Establish a connection to MongoDB using the provided URI.
 *
 * This helper ensures that multiple calls do not create additional
 * connections.  It throws an error if no URI is provided.
 */
export async function connectMongo(uri: string | undefined): Promise<void> {
  if (!uri) {
    throw new Error('MONGODB_URI must be set');
  }
  // Only connect if not already connected.  The readyState of 0
  // indicates that mongoose has not established a connection yet.
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, {
      dbName: undefined,
    });
  }
}
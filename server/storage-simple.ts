import 'dotenv/config';
import { mockStorage } from './mock-storage';

/**
 * Storage layer that abstracts database operations.
 * In development, uses mock storage to avoid MongoDB dependency.
 */

export const storage = process.env.NODE_ENV === 'development' ? mockStorage : {
  // Production implementations would go here
  // For now, using mock storage in all environments for demo purposes
  ...mockStorage
};
import "server-only";
import mongoose from "mongoose";
import { getEnv } from "@/lib/env";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalForMongoose = globalThis as unknown as { __restooMongoose?: Cache };
const cache: Cache = (globalForMongoose.__restooMongoose ??= {
  conn: null,
  promise: null,
});

/**
 * Koneksi di-cache di `globalThis` agar tidak membuka koneksi baru pada setiap
 * hot-reload (dev) maupun warm invocation (serverless).
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  const env = getEnv();
  cache.promise ??= mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    bufferCommands: false,
  });

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null; // izinkan retry pada request berikutnya
    throw error;
  }
  return cache.conn;
}

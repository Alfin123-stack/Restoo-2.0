import mongoose from "mongoose";

/** Koneksi khusus script (tanpa `server-only`, tanpa cache global). */
export async function connectForScript() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local.");
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || "restoo" });
  return mongoose;
}

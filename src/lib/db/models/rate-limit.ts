import { Schema, model, models, type Model } from "mongoose";

export interface RateLimitDoc {
  key: string;
  count: number;
  expiresAt: Date;
}

const rateLimitSchema = new Schema<RateLimitDoc>({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  // TTL index: MongoDB menghapus dokumen otomatis setelah expiresAt.
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

export const RateLimit: Model<RateLimitDoc> =
  (models.RateLimit as Model<RateLimitDoc> | undefined) ??
  model<RateLimitDoc>("RateLimit", rateLimitSchema);

import "server-only";
import { createHash } from "node:crypto";
import { RateLimit } from "@/lib/db/models/rate-limit";

/** Kunci berupa hash, bukan IP mentah, supaya tidak menyimpan data pribadi. */
export function buildRateLimitKey(ip: string, scope: string): string {
  const salt = process.env.RATE_LIMIT_SALT ?? "restoo";
  return createHash("sha256").update(`${salt}:${scope}:${ip}`).digest("hex");
}

/**
 * Pembatas sederhana berbasis MongoDB (TTL index membersihkan dokumen lama).
 * Mengembalikan true bila request masih diizinkan.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const expiresAt = new Date(Date.now() + windowSeconds * 1000);
  const attempt = () =>
    RateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, returnDocument: "after" },
    ).lean();

  let doc;
  try {
    doc = await attempt();
  } catch (error) {
    // Dua request bersamaan bisa sama-sama mencoba upsert; ulangi sekali.
    if ((error as { code?: number }).code === 11000) doc = await attempt();
    else throw error;
  }
  return (doc?.count ?? 1) <= limit;
}

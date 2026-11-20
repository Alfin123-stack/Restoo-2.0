/**
 * Optional: suggest feature tags (halal, wifi, ...) for places that have none yet, using Gemini.
 * Run manually: npm run seed:tags   (add --dry to preview without writing)
 * Tags are guesses from name + category, so only the obvious ones are kept. Review the output.
 */
import mongoose from "mongoose";
import { connectForScript } from "./db.mts";

const ALLOWED = ["halal", "vegetarian", "wifi", "outdoor", "delivery", "reservasi"];
const dry = process.argv.includes("--dry");
const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error("GEMINI_API_KEY is not set.");
const model = process.env.GEMINI_LITE_MODEL || "gemini-flash-lite-latest";

async function suggest(name: string, categories: string[]): Promise<string[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key! },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `Given a restaurant name and categories, return JSON {"tags": [...]} using only: ${ALLOWED.join(", ")}. Include a tag only if the name or category makes it clearly likely (e.g. a cafe often has wifi). When unsure, return an empty list.`,
            },
          ],
        },
        contents: [
          { role: "user", parts: [{ text: `${name} | ${categories.join(", ")}` }] },
        ],
        generationConfig: { responseMimeType: "application/json", temperature: 0 },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  const tags = (JSON.parse(text) as { tags?: unknown }).tags;
  return Array.isArray(tags)
    ? tags.filter((t): t is string => ALLOWED.includes(String(t)))
    : [];
}

await connectForScript();
const col = mongoose.connection.collection("restaurants");
const docs = await col
  .find({ $or: [{ tags: { $exists: false } }, { tags: { $size: 0 } }] })
  .limit(200)
  .toArray();
console.log(`${docs.length} places without tags (max 200 per run).`);
let changed = 0;
for (const d of docs) {
  try {
    const tags = await suggest(
      String(d.name),
      (d.categories as string[] | undefined) ?? [],
    );
    if (tags.length) {
      console.log(`${d.name}: ${tags.join(", ")}`);
      if (!dry) await col.updateOne({ _id: d._id }, { $set: { tags } });
      changed++;
    }
  } catch (e) {
    console.error(`Skipped ${d.name}:`, (e as Error).message);
  }
  await new Promise((r) => setTimeout(r, 1500)); // stay under free-tier rate limits
}
console.log(`${dry ? "Would update" : "Updated"} ${changed} places.`);
await mongoose.disconnect();

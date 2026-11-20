import { RateLimit } from "../../src/lib/db/models/rate-limit.ts";
import { Restaurant } from "../../src/lib/db/models/restaurant.ts";
import { Review } from "../../src/lib/db/models/review.ts";
import { connectForScript } from "./db.mts";

const mongoose = await connectForScript();
for (const model of [Restaurant, Review, RateLimit]) {
  await model.syncIndexes();
  console.log(`Indexes synced: ${model.modelName}`);
}
await mongoose.disconnect();

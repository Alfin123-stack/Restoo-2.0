/**
 * Menghapus data restoran (dan ulasannya) dari database yang ada di MONGODB_URI / MONGODB_DB.
 *
 *   npm run seed:clear               -> hanya menampilkan jumlah data (tidak menghapus apa pun)
 *   npm run seed:clear -- --yes      -> benar-benar menghapus restoran + ulasan
 *
 * Data rate limit dibiarkan (kedaluwarsa sendiri). Setelah itu jalankan seed:fetch + seed untuk kota baru.
 */
import mongoose from "mongoose";
import { connectForScript } from "./db.mts";

const yes = process.argv.includes("--yes");
await connectForScript();
const db = mongoose.connection;
const restaurants = db.collection("restaurants");
const reviews = db.collection("reviews");

console.log(`Database: ${db.name}`);
console.log(`Restaurants: ${await restaurants.countDocuments()}`);
console.log(`Reviews:     ${await reviews.countDocuments()}`);

if (!yes) {
  console.log('\nNothing deleted. Add "--yes" to delete: npm run seed:clear -- --yes');
} else {
  const r = await restaurants.deleteMany({});
  const v = await reviews.deleteMany({});
  console.log(`\nDeleted ${r.deletedCount} restaurants and ${v.deletedCount} reviews.`);
}
await mongoose.disconnect();

import { Schema, model, models, type Model, type Types } from "mongoose";

export interface RestaurantDoc {
  _id: Types.ObjectId;
  slug: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  categories: string[];
  location?: { type: "Point"; coordinates: [number, number] };
  openingHours?: string;
  phone?: string;
  website?: string;
  pictureUrl?: string;
  /** Extra photos shown in the detail carousel (the cover is pictureUrl). */
  pictureUrls?: string[];
  menus: { foods: string[]; drinks: string[] };
  priceLevel?: 1 | 2 | 3;
  tags: string[];
  ratingSum: number;
  ratingCount: number;
  source: { provider: string; placeId: string; fetchedAt: Date };
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<RestaurantDoc>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: String,
    address: { type: String, default: "" },
    city: { type: String, default: "", index: true },
    categories: { type: [String], default: [] },
    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number] },
    },
    openingHours: String,
    phone: String,
    website: String,
    pictureUrl: String,
    pictureUrls: { type: [String], default: undefined },
    menus: {
      foods: { type: [String], default: [] },
      drinks: { type: [String], default: [] },
    },
    priceLevel: { type: Number, min: 1, max: 3 },
    tags: { type: [String], default: [] },
    ratingSum: { type: Number, default: 0, min: 0 },
    ratingCount: { type: Number, default: 0, min: 0 },
    source: {
      provider: { type: String, required: true },
      placeId: { type: String, required: true },
      fetchedAt: { type: Date, required: true },
    },
  },
  { timestamps: true },
);

restaurantSchema.index({ "source.placeId": 1 }, { unique: true });
restaurantSchema.index({ location: "2dsphere" }, { sparse: true });
restaurantSchema.index({ city: 1, categories: 1 });
restaurantSchema.index({ ratingCount: -1, name: 1 });
restaurantSchema.index({ tags: 1 });

export const Restaurant: Model<RestaurantDoc> =
  (models.Restaurant as Model<RestaurantDoc> | undefined) ??
  model<RestaurantDoc>("Restaurant", restaurantSchema);

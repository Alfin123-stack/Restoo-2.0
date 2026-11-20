import { Schema, model, models, type Model, type Types } from "mongoose";

export interface ReviewDoc {
  _id: Types.ObjectId;
  restaurantId: Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<ReviewDoc>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

reviewSchema.index({ restaurantId: 1, createdAt: -1 });

export const Review: Model<ReviewDoc> =
  (models.Review as Model<ReviewDoc> | undefined) ??
  model<ReviewDoc>("Review", reviewSchema);

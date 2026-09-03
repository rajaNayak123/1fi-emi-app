import mongoose from "mongoose";
import { toJSONOptions } from "./schemaOptions.js";

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: "smartphone", trim: true },
    description: { type: String, default: "" },
    badge: { type: String, default: "" },
  },
  { timestamps: true, toJSON: toJSONOptions, toObject: toJSONOptions }
);

export default mongoose.model("Product", productSchema);

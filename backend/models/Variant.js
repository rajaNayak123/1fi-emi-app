import mongoose from "mongoose";
import { toJSONOptions } from "./schemaOptions.js";

const variantSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantType: { type: String, required: true, enum: ["storage", "color"] },
    label: { type: String, required: true },
    swatchHex: { type: String, default: null },
    mrp: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    stock: { type: Number, required: true, default: 25, min: 0 },
    isDefault: { type: Boolean, required: true, default: false },
  },
  { timestamps: true, toJSON: toJSONOptions, toObject: toJSONOptions }
);

export default mongoose.model("Variant", variantSchema);

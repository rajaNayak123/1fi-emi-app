import mongoose from "mongoose";
import { toJSONOptions } from "./schemaOptions.js";

const orderSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "EmiPlanTemplate", required: true },
    monthlyAmount: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    status: { type: String, required: true, default: "PENDING_APPROVAL" },
  },
  { timestamps: true, toJSON: toJSONOptions, toObject: toJSONOptions }
);

export default mongoose.model("Order", orderSchema);

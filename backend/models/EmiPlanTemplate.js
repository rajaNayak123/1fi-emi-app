import mongoose from "mongoose";
import { toJSONOptions } from "./schemaOptions.js";

const emiPlanTemplateSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    tenureMonths: { type: Number, required: true, min: 1 },
    interestRate: { type: Number, required: true, default: 0, min: 0 },
    cashbackAmount: { type: Number, required: true, default: 0, min: 0 },
    fundPartner: { type: String, required: true, default: "Nifty 50 Index Fund" },
    isRecommended: { type: Boolean, required: true, default: false },
  },
  { timestamps: true, toJSON: toJSONOptions, toObject: toJSONOptions }
);

export default mongoose.model("EmiPlanTemplate", emiPlanTemplateSchema);

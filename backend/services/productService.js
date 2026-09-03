import mongoose from "mongoose";
import Product from "../models/Product.js";
import Variant from "../models/Variant.js";
import EmiPlanTemplate from "../models/EmiPlanTemplate.js";
import Order from "../models/Order.js";
import { buildEmiPlansForVariant } from "../utils/emi.js";

export function isValidObjectId(id) {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
}

export async function getVariantsForProduct(productId) {
  const variants = await Variant.find({ product: productId })
    .sort({ isDefault: -1, createdAt: 1 })
    .lean();
  return variants.map((v) => ({
    id: v._id.toString(),
    type: v.variantType,
    label: v.label,
    swatchHex: v.swatchHex,
    mrp: v.mrp,
    price: v.price,
    imageUrl: v.imageUrl,
    inStock: v.stock > 0,
    isDefault: !!v.isDefault,
  }));
}

export async function getPlanTemplates(productId) {
  return EmiPlanTemplate.find({ product: productId }).sort({ tenureMonths: 1 }).lean();
}

export async function fetchAllProductsSummary() {
  const products = await Product.find().sort({ createdAt: 1 }).lean();

  return Promise.all(
    products.map(async (p) => {
      const variants = await getVariantsForProduct(p._id);
      const defaultVariant = variants.find((v) => v.isDefault) || variants[0];
      return {
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        category: p.category,
        badge: p.badge,
        variantCount: variants.length,
        startingPrice: Math.min(...variants.map((v) => v.price)),
        startingMrp: Math.min(...variants.map((v) => v.mrp)),
        image: defaultVariant?.imageUrl,
      };
    })
  );
}

export async function fetchProductDetails(slug, requestedVariantId) {
  const product = await Product.findOne({ slug }).lean();
  if (!product) return { status: 404, error: "Product not found" };

  const variants = await getVariantsForProduct(product._id);
  if (variants.length === 0) {
    return { status: 404, error: "Product has no purchasable variants" };
  }

  const selectedVariant =
    (isValidObjectId(requestedVariantId) && variants.find((v) => v.id === requestedVariantId)) ||
    variants.find((v) => v.isDefault) ||
    variants[0];

  const templates = await getPlanTemplates(product._id);
  const emiPlans = buildEmiPlansForVariant(templates, selectedVariant.price);

  return {
    data: {
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
      badge: product.badge,
      variants,
      selectedVariantId: selectedVariant.id,
      emiPlans,
    },
  };
}

export async function fetchProductVariantEmiPlans(slug, variantId) {
  if (!isValidObjectId(variantId)) {
    return { status: 400, error: "variantId is required and must belong to this product" };
  }

  const product = await Product.findOne({ slug }).select("_id").lean();
  if (!product) return { status: 404, error: "Product not found" };

  const variant = await Variant.findOne({ _id: variantId, product: product._id }).lean();
  if (!variant) {
    return { status: 400, error: "variantId is required and must belong to this product" };
  }

  const templates = await getPlanTemplates(product._id);
  const emiPlans = buildEmiPlansForVariant(templates, variant.price);

  return {
    data: {
      variantId: variant._id.toString(),
      price: variant.price,
      emiPlans,
    },
  };
}

export async function processCheckoutOrder(slug, variantId, planId) {
  if (!isValidObjectId(variantId) || !isValidObjectId(planId)) {
    return { status: 400, error: "variantId and planId must be valid for this product" };
  }

  const product = await Product.findOne({ slug }).select("_id").lean();
  if (!product) return { status: 404, error: "Product not found" };

  const [variant, template] = await Promise.all([
    Variant.findOne({ _id: variantId, product: product._id }).lean(),
    EmiPlanTemplate.findOne({ _id: planId, product: product._id }).lean(),
  ]);

  if (!variant || !template) {
    return { status: 400, error: "variantId and planId must be valid for this product" };
  }

  const [computedPlan] = buildEmiPlansForVariant([template], variant.price);

  const order = await Order.create({
    product: product._id,
    variant: variant._id,
    plan: template._id,
    monthlyAmount: computedPlan.monthlyAmount,
    tenureMonths: template.tenureMonths,
  });

  return {
    status: 201,
    data: {
      orderId: order._id.toString(),
      status: order.status,
      message: "Your EMI plan request has been submitted for approval.",
      monthlyAmount: order.monthlyAmount,
      tenureMonths: order.tenureMonths,
    },
  };
}

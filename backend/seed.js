import "dotenv/config";
import { connectDB } from "./config/db.js";
import Product from "./models/Product.js";
import Variant from "./models/Variant.js";
import EmiPlanTemplate from "./models/EmiPlanTemplate.js";
import Order from "./models/Order.js";
import mongoose from "mongoose";

const img = (label, bg, fg = "ffffff") =>
  `https://placehold.co/600x600/${bg}/${fg}?text=${encodeURIComponent(label)}`;

const LADDER = [
  { tenureMonths: 3, interestRate: 0 },
  { tenureMonths: 6, interestRate: 0 },
  { tenureMonths: 12, interestRate: 0 },
  { tenureMonths: 24, interestRate: 0 },
  { tenureMonths: 36, interestRate: 10.5 },
  { tenureMonths: 48, interestRate: 10.5 },
  { tenureMonths: 60, interestRate: 10.5 },
];

async function seedProduct({ slug, name, brand, description, badge, variants, cashback }) {
  const product = await Product.create({ slug, name, brand, description, badge });

  await Variant.insertMany(
    variants.map((v, i) => ({
      product: product._id,
      variantType: v.type,
      label: v.label,
      swatchHex: v.swatchHex || null,
      mrp: v.mrp,
      price: v.price,
      imageUrl: v.imageUrl,
      stock: v.stock ?? 25,
      isDefault: i === 0,
    }))
  );

  await EmiPlanTemplate.insertMany(
    LADDER.map((p) => ({
      product: product._id,
      tenureMonths: p.tenureMonths,
      interestRate: p.interestRate,
      cashbackAmount: cashback,
      fundPartner: "Nifty 50 Index Fund",
      isRecommended: p.tenureMonths === 12,
    }))
  );

  return product;
}

async function seed() {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([
    Order.deleteMany({}),
    EmiPlanTemplate.deleteMany({}),
    Variant.deleteMany({}),
    Product.deleteMany({}),
  ]);

  console.log("Seeding products...");

  await seedProduct({
    slug: "iphone-17-pro",
    name: "iPhone 17 Pro",
    brand: "Apple",
    description: "Titanium design, A19 Pro chip, and the most advanced Pro camera system yet.",
    badge: "NEW",
    cashback: 7500,
    variants: [
      { type: "storage", label: "256GB", swatchHex: "#3b3a3e", mrp: 134900, price: 127400, imageUrl: img("iPhone 17 Pro 256GB", "3b3a3e"), stock: 30 },
      { type: "storage", label: "512GB", swatchHex: "#3b3a3e", mrp: 154900, price: 146900, imageUrl: img("iPhone 17 Pro 512GB", "3b3a3e"), stock: 18 },
      { type: "storage", label: "1TB", swatchHex: "#3b3a3e", mrp: 174900, price: 165900, imageUrl: img("iPhone 17 Pro 1TB", "3b3a3e"), stock: 9 },
    ],
  });

  await seedProduct({
    slug: "samsung-galaxy-s25-ultra",
    name: "Samsung Galaxy S25 Ultra",
    brand: "Samsung",
    description: "Snapdragon 8 Elite for Galaxy, a 200MP camera, and built-in Galaxy AI.",
    badge: "BESTSELLER",
    cashback: 6000,
    variants: [
      { type: "storage", label: "256GB", swatchHex: "#1c2b45", mrp: 129999, price: 119999, imageUrl: img("Galaxy S25 Ultra 256GB", "1c2b45"), stock: 40 },
      { type: "storage", label: "512GB", swatchHex: "#1c2b45", mrp: 139999, price: 129999, imageUrl: img("Galaxy S25 Ultra 512GB", "1c2b45"), stock: 22 },
    ],
  });

  await seedProduct({
    slug: "google-pixel-10-pro",
    name: "Google Pixel 10 Pro",
    brand: "Google",
    description: "Tensor G5, Magic Cue on-device AI, and Google's sharpest Pro camera yet.",
    badge: "",
    cashback: 5000,
    variants: [
      { type: "color", label: "Obsidian", swatchHex: "#1a1a1a", mrp: 109999, price: 99999, imageUrl: img("Pixel 10 Pro Obsidian", "1a1a1a"), stock: 25 },
      { type: "color", label: "Porcelain", swatchHex: "#e7dfd3", mrp: 109999, price: 99999, imageUrl: img("Pixel 10 Pro Porcelain", "e7dfd3", "1a1a1a"), stock: 20 },
      { type: "color", label: "Jade", swatchHex: "#3f5d4f", mrp: 109999, price: 99999, imageUrl: img("Pixel 10 Pro Jade", "3f5d4f"), stock: 15 },
    ],
  });

  const [productCount, variantCount, planCount] = await Promise.all([
    Product.countDocuments(),
    Variant.countDocuments(),
    EmiPlanTemplate.countDocuments(),
  ]);

  console.log("Seed complete:");
  console.log(await Product.find().select("slug name -_id").lean());
  console.log(`${productCount} products, ${variantCount} variants, ${planCount} EMI plan templates`);

  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

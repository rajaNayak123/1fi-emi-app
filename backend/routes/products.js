import { Router } from "express";
import {
  getProducts,
  getProductBySlug,
  getProductEmiPlans,
  createCheckoutOrder,
} from "../controllers/productController.js";

const router = Router();

router.get("/", getProducts);
router.get("/:slug", getProductBySlug);
router.get("/:slug/emi", getProductEmiPlans);
router.post("/:slug/checkout", createCheckoutOrder);

export default router;

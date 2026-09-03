import {
  fetchAllProductsSummary,
  fetchProductDetails,
  fetchProductVariantEmiPlans,
  processCheckoutOrder,
} from "../services/productService.js";

export async function getProducts(req, res, next) {
  try {
    const products = await fetchAllProductsSummary();
    res.json({ count: products.length, products });
  } catch (err) {
    next(err);
  }
}

export async function getProductBySlug(req, res, next) {
  try {
    const result = await fetchProductDetails(req.params.slug, req.query.variantId);
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    res.json(result.data);
  } catch (err) {
    next(err);
  }
}

export async function getProductEmiPlans(req, res, next) {
  try {
    const result = await fetchProductVariantEmiPlans(req.params.slug, req.query.variantId);
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    res.json(result.data);
  } catch (err) {
    next(err);
  }
}

export async function createCheckoutOrder(req, res, next) {
  try {
    const { variantId, planId } = req.body || {};
    const result = await processCheckoutOrder(req.params.slug, variantId, planId);
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    res.status(result.status || 200).json(result.data);
  } catch (err) {
    next(err);
  }
}

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, formatINR } from "../lib/api.js";
import VariantSelector from "../components/VariantSelector.jsx";
import EmiPlanCard from "../components/EmiPlanCard.jsx";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [checkoutState, setCheckoutState] = useState({ status: "idle" });

  useEffect(() => {
    setProduct(null);
    setError(null);
    setCheckoutState({ status: "idle" });
    api
      .getProduct(slug)
      .then((data) => {
        setProduct(data);
        setSelectedVariantId(data.selectedVariantId);
        setSelectedPlanId(data.emiPlans.find((p) => p.isRecommended)?.id ?? data.emiPlans[0]?.id);
      })
      .catch((err) => setError(err.message));
  }, [slug]);

  function handleVariantChange(variantId) {
    setSelectedVariantId(variantId);
    setCheckoutState({ status: "idle" });
    api.getProduct(slug, variantId).then((data) => {
      setProduct(data);
      const stillExists = data.emiPlans.some((p) => p.id === selectedPlanId);
      setSelectedPlanId(
        stillExists ? selectedPlanId : data.emiPlans.find((p) => p.isRecommended)?.id ?? data.emiPlans[0]?.id
      );
    });
  }

  async function handleProceed() {
    setCheckoutState({ status: "loading" });
    try {
      const result = await api.checkout(slug, selectedVariantId, selectedPlanId);
      setCheckoutState({ status: "success", result });
    } catch (err) {
      setCheckoutState({ status: "error", message: err.message });
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-24 text-center">
        <p className="font-display text-2xl">We couldn't find that product</p>
        <p className="mt-2 text-ink/50">{error}</p>
        <Link to="/" className="mt-6 inline-block text-moss-600 underline">
          Back to catalog
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl2 bg-sand" />
          <div className="space-y-4">
            <div className="h-6 w-1/3 animate-pulse rounded bg-sand" />
            <div className="h-10 w-2/3 animate-pulse rounded bg-sand" />
            <div className="h-40 animate-pulse rounded-xl2 bg-sand" />
          </div>
        </div>
      </div>
    );
  }

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const selectedPlan = product.emiPlans.find((p) => p.id === selectedPlanId);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link to="/" className="text-sm text-ink/50 hover:text-ink">
        ← Back to catalog
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 pb-28 lg:grid-cols-2 lg:pb-0">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-square overflow-hidden rounded-xl2 bg-sand">
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium tracking-wide text-paper">
                {product.badge}
              </span>
            )}
            <img
              src={selectedVariant?.imageUrl}
              alt={`${product.name} ${selectedVariant?.label}`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div>
          <span className="text-xs uppercase tracking-wide text-ink/40">{product.brand}</span>
          <h1 className="mt-1 font-display text-3xl leading-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-1 text-ink/50">{selectedVariant?.label}</p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-mono text-2xl font-semibold">
              {formatINR(selectedVariant?.price)}
            </span>
            {selectedVariant?.mrp > selectedVariant?.price && (
              <span className="font-mono text-base text-ink/35 line-through">
                {formatINR(selectedVariant.mrp)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-3 max-w-md text-sm text-ink/55">{product.description}</p>
          )}

          <div className="mt-7">
            <VariantSelector
              variants={product.variants}
              selectedId={selectedVariantId}
              onSelect={handleVariantChange}
            />
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium text-ink/70">EMI plans backed by mutual funds</p>
            <div className="mt-3 space-y-2.5">
              {product.emiPlans.map((plan) => (
                <EmiPlanCard
                  key={plan.id}
                  plan={plan}
                  selected={plan.id === selectedPlanId}
                  onSelect={setSelectedPlanId}
                />
              ))}
            </div>
          </div>

          <div className="mt-8 hidden lg:block">
            <ProceedButton
              selectedPlan={selectedPlan}
              checkoutState={checkoutState}
              onProceed={handleProceed}
            />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/10 bg-paper/95 px-5 py-4 backdrop-blur lg:hidden">
        <ProceedButton
          selectedPlan={selectedPlan}
          checkoutState={checkoutState}
          onProceed={handleProceed}
        />
      </div>
    </div>
  );
}

function ProceedButton({ selectedPlan, checkoutState, onProceed }) {
  if (checkoutState.status === "success") {
    return (
      <div className="rounded-xl2 border border-moss-500/30 bg-moss-50 px-4 py-3.5 text-sm text-moss-600">
        Order #{checkoutState.result.orderId} submitted — {formatINR(checkoutState.result.monthlyAmount)}/mo
        for {checkoutState.result.tenureMonths} months. {checkoutState.result.message}
      </div>
    );
  }

  return (
    <div>
      {checkoutState.status === "error" && (
        <p className="mb-2 text-sm text-red-600">{checkoutState.message}</p>
      )}
      <button
        type="button"
        disabled={!selectedPlan || checkoutState.status === "loading"}
        onClick={onProceed}
        className="flex w-full items-center justify-between rounded-xl2 bg-ink px-5 py-3.5 text-paper transition hover:bg-ink/85 disabled:opacity-50"
      >
        <span className="font-medium">
          {checkoutState.status === "loading" ? "Submitting…" : "Proceed with this plan"}
        </span>
        {selectedPlan && (
          <span className="font-mono text-sm">
            {formatINR(selectedPlan.monthlyAmount)}/mo
          </span>
        )}
      </button>
    </div>
  );
}

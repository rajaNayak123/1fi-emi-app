import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatINR } from "../lib/api.js";

export default function ProductList() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listProducts()
      .then((data) => setProducts(data.products))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <div className="max-w-xl">
        <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
          Get the phone today. Let your money keep working.
        </h1>
        <p className="mt-4 text-ink/60">
          Every plan below links your instalments to a mutual fund folio, so the cashback keeps
          growing while you pay it off in pieces.
        </p>
      </div>

      {error && (
        <p className="mt-10 rounded-xl2 border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          Couldn't load the catalog: {error}. Is the backend running on the expected port?
        </p>
      )}

      {!products && !error && (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl2 bg-sand" />
          ))}
        </div>
      )}

      {products && (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.slug}
              to={`/products/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl2 border border-ink/10 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden bg-sand">
                {p.badge && (
                  <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium tracking-wide text-paper">
                    {p.badge}
                  </span>
                )}
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1 p-5">
                <span className="text-xs uppercase tracking-wide text-ink/40">{p.brand}</span>
                <h2 className="font-display text-lg leading-snug">{p.name}</h2>
                <p className="text-xs text-ink/50">
                  {p.variantCount} variant{p.variantCount > 1 ? "s" : ""} available
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-mono text-base font-medium">
                    {formatINR(p.startingPrice)}
                  </span>
                  {p.startingMrp > p.startingPrice && (
                    <span className="font-mono text-sm text-ink/35 line-through">
                      {formatINR(p.startingMrp)}
                    </span>
                  )}
                </div>
                <span className="mt-1 text-xs text-moss-600">EMI plans from 3–60 months</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

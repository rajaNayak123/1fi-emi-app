export default function VariantSelector({ variants, selectedId, onSelect }) {
  if (!variants.length) return null;
  const type = variants[0].type;
  const isColor = type === "color";

  return (
    <div>
      <p className="text-sm font-medium text-ink/70">
        {isColor ? "Color" : "Storage"}
        <span className="ml-2 font-normal text-ink/40">
          {variants.find((v) => v.id === selectedId)?.label}
        </span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {variants.map((v) => {
          const active = v.id === selectedId;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v.id)}
              disabled={!v.inStock}
              className={[
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40",
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/15 bg-white text-ink hover:border-ink/40",
              ].join(" ")}
            >
              {isColor && (
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/10"
                  style={{ backgroundColor: v.swatchHex || "#ccc" }}
                />
              )}
              {v.label}
              {!v.inStock && <span className="text-[10px]">(out of stock)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

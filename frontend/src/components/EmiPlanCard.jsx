import { formatINR } from "../lib/api.js";

export default function EmiPlanCard({ plan, selected, onSelect }) {
  return (
    <label
      className={[
        "flex cursor-pointer items-center justify-between gap-4 rounded-xl2 border px-4 py-3.5 transition",
        selected
          ? "border-moss-500 bg-moss-50 ring-1 ring-moss-500"
          : "border-ink/10 bg-white hover:border-ink/25",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <input
          type="radio"
          name="emi-plan"
          checked={selected}
          onChange={() => onSelect(plan.id)}
          className="h-4 w-4 accent-moss-500"
        />
        <div>
          <div className="flex items-center gap-2 font-mono text-[15px] font-medium">
            {formatINR(plan.monthlyAmount)}
            <span className="font-sans text-xs font-normal text-ink/45">
              × {plan.tenureMonths} months
            </span>
            {plan.isRecommended && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                POPULAR
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ink/50">
            {plan.interestRate === 0 ? "0% interest" : `${plan.interestRate}% interest`}
            {plan.cashback > 0 && (
              <span className="text-moss-600">
                {" "}
                · Additional cashback of {formatINR(plan.cashback)}
              </span>
            )}
          </p>
        </div>
      </div>
      <span className="hidden shrink-0 text-right text-xs text-ink/40 sm:block">
        Total {formatINR(plan.totalPayable)}
      </span>
    </label>
  );
}

export function computeEmi({ price, tenureMonths, annualInterestRate }) {
  if (annualInterestRate === 0) {
    return Math.round(price / tenureMonths);
  }
  const r = annualInterestRate / 12 / 100;
  const factor = Math.pow(1 + r, tenureMonths);
  const emi = (price * r * factor) / (factor - 1);
  return Math.round(emi);
}

export function buildEmiPlansForVariant(templates, price) {
  return templates.map((t) => {
    const monthlyAmount = computeEmi({
      price,
      tenureMonths: t.tenureMonths,
      annualInterestRate: t.interestRate,
    });
    return {
      id: t._id ? t._id.toString() : t.id,
      tenureMonths: t.tenureMonths,
      interestRate: t.interestRate,
      cashback: t.cashbackAmount,
      fundPartner: t.fundPartner,
      isRecommended: !!t.isRecommended,
      monthlyAmount,
      totalPayable: monthlyAmount * t.tenureMonths,
    };
  });
}

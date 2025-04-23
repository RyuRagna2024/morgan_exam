// app/(public)/(group-products)/(unviresal_comp)/utils.ts

export const formatCurrency = (amount: number): string => {
  // Force 'en-ZA' locale with specific options to ensure consistency
  return (
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      currencyDisplay: "symbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      // Force specific number formatting options
      numberingSystem: "latn",
      useGrouping: true,
    })
      .format(amount)
      // Replace the default "ZAR" symbol with "R" and ensure consistent spacing
      .replace("ZAR", "R")
      // Force decimal point to be a comma
      .replace(".", ",")
  );
};

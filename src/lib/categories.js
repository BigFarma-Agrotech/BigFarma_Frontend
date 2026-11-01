// Product categories: `value` is what the API stores (see the backend's
// ProductCategory), `label` what people see. "crop" also covers products listed
// before the finer categories existed.
export const PRODUCT_CATEGORIES = [
  { value: "grains", label: "Grains" },
  { value: "vegetables", label: "Vegetables" },
  { value: "fruits", label: "Fruits" },
  { value: "roots_tubers", label: "Roots & Tubers" },
  { value: "legumes", label: "Legumes" },
  { value: "oils", label: "Oils & Oilseeds" },
  { value: "nuts_seeds", label: "Nuts & Seeds" },
  { value: "spices_herbs", label: "Spices & Herbs" },
  { value: "cash_crops", label: "Cash Crops" },
  { value: "processed", label: "Processed Foods" },
  { value: "livestock", label: "Livestock" },
  { value: "poultry", label: "Poultry" },
  { value: "fish", label: "Fish & Seafood" },
  { value: "dairy_eggs", label: "Dairy & Eggs" },
  { value: "crop", label: "Other Crops" },
];

// Animal products; everything else is grown
export const ANIMAL_CATEGORIES = ["livestock", "poultry", "fish", "dairy_eggs"];

const LABELS = Object.fromEntries(PRODUCT_CATEGORIES.map(({ value, label }) => [value, label]));

// "roots_tubers" -> "Roots & Tubers"; unknown values are tidied up as-is
export const categoryLabel = (value) => {
  if (!value) return "";
  const key = String(value).trim().toLowerCase();
  return LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

// "Roots & Tubers" (or "roots_tubers") -> "roots_tubers"; null if it isn't one
export const categoryValue = (labelOrValue) => {
  const key = String(labelOrValue ?? "").trim().toLowerCase();
  const match = PRODUCT_CATEGORIES.find(
    ({ value, label }) => value === key || label.toLowerCase() === key
  );
  return match ? match.value : null;
};

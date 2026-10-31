// Units farmers sell in, and the order rules (minimum, stock, whole units) that
// the cart and product pages enforce. Mirrors BigFarma_Backend/utils/units.py,
// which enforces the same rules at checkout.

export const UNIT_GROUPS = [
  { label: "Weight", units: ["kg", "g", "tonne", "lb"] },
  { label: "Volume", units: ["litre", "ml", "gallon", "jerrycan"] },
  { label: "Count", units: ["piece", "head", "dozen", "tuber", "bunch", "bundle"] },
  { label: "Packaging", units: ["bag", "sack", "crate", "tray", "basket", "carton", "pack", "box"] },
  { label: "Local measures", units: ["mudu", "derica", "paint bucket", "congo"] },
];

// Sold in whole numbers only (no half bags or half a head of cattle)
const COUNT_UNITS = new Set(
  UNIT_GROUPS.filter(({ label }) => label !== "Weight" && label !== "Volume").flatMap(({ units }) => units)
);

// Older products used plurals or other spellings
const ALIASES = {
  kgs: "kg", kilogram: "kg", kilograms: "kg", grams: "g", gram: "g",
  tonnes: "tonne", tons: "tonne", ton: "tonne", lbs: "lb", pounds: "lb",
  liters: "litre", liter: "litre", litres: "litre", l: "litre",
  gallons: "gallon", jerrycans: "jerrycan",
  pieces: "piece", pcs: "piece", pc: "piece", heads: "head", dozens: "dozen", tubers: "tuber",
  bunches: "bunch", bundles: "bundle", bags: "bag", sacks: "sack", crates: "crate", trays: "tray",
  baskets: "basket", cartons: "carton", packs: "pack", boxes: "box",
  mudus: "mudu", dericas: "derica", "paint buckets": "paint bucket", congos: "congo",
};

// Units that don't take an "s" in the plural
const NO_PLURAL = new Set(["kg", "g", "lb", "ml", "head", "dozen"]);
const PLURALS = { box: "boxes", bunch: "bunches", "paint bucket": "paint buckets" };

export const normalizeUnit = (unit) => {
  const key = String(unit ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  return key ? ALIASES[key] || key : "";
};

export const isCountUnit = (unit) => COUNT_UNITS.has(normalizeUnit(unit));

/** "100 kg" -> { amount: 100, unit: "kg" }; "20 bags" -> { amount: 20, unit: "bag" } */
export const parseQuantity = (value) => {
  const match = String(value ?? "").match(/^\s*(\d+(?:\.\d+)?)\s*(.*)$/);
  return match ? { amount: Number(match[1]), unit: normalizeUnit(match[2]) } : { amount: null, unit: "" };
};

/** The unit's name for an amount: unitLabel(1, "bag") -> "bag", unitLabel(3, "bag") -> "bags" */
export const unitLabel = (amount, unit) => {
  const name = normalizeUnit(unit);
  if (!name || Number(amount) === 1 || NO_PLURAL.has(name)) return name;
  return PLURALS[name] || `${name}s`;
};

/** formatQuantity(3, "bag") -> "3 bags"; formatQuantity(2.5, "kg") -> "2.5 kg" */
export const formatQuantity = (amount, unit) => {
  const number = Number(Number(amount).toFixed(2)).toString();
  const label = unitLabel(amount, unit);
  return label ? `${number} ${label}` : number;
};

/**
 * What a buyer may order of a product: { unit, min, max, step, isCount }.
 * Quantities go up and down by `step` (one unit) from `min`; `max` is the stock
 * (null when unknown).
 */
export const getOrderRules = (product) => {
  const stock = parseQuantity(product?.quantity);
  const unit = normalizeUnit(product?.unit) || stock.unit;
  const isCount = isCountUnit(unit);
  let min = Number(product?.min_order_quantity) || 1;
  if (isCount) min = Math.max(1, Math.ceil(min));
  return { unit, min, max: stock.amount, step: 1, isCount };
};

/** Brings a quantity within the product's rules (at least the minimum, at most the stock). */
export const clampQuantity = (quantity, rules) => {
  let value = Number(quantity) || rules.min;
  if (rules.isCount) value = Math.round(value);
  if (rules.max !== null && rules.max !== undefined) value = Math.min(value, rules.max);
  return Math.max(value, rules.min);
};

/** False when the product can't be ordered at all (stock below the minimum). */
export const canOrder = (rules) => rules.max === null || rules.max === undefined || rules.max >= rules.min;

// Pure helpers for filtering marketplace products. Product shape (from
// /marketplace/products and src/lib/demoMarketplaceProducts.js):
// { name, category, description, location: "Kano, Nigeria", price,
//   discounted_price, availability: "in_stock" | ..., farmer: { full_name, farm_type, farm_location } }

export const EMPTY_FILTERS = {
  categories: [],
  availability: [],
  locations: [],
  maxPrice: "",
};

export const CATEGORY_OPTIONS = ["Vegetables", "Fruits", "Grains", "Protein"];

export const AVAILABILITY_OPTIONS = [
  { value: "in_stock", label: "In stock" },
  { value: "out_of_stock", label: "Out of stock" },
];

// UI category -> product.category / farmer.farm_type values it covers.
const CATEGORY_ALIASES = {
  vegetables: ["vegetable", "vegetables"],
  fruits: ["fruit", "fruits"],
  grains: ["grain", "grains", "legume", "legumes", "cereal", "cereals"],
  protein: ["livestock", "protein", "poultry", "fish", "meat", "dairy"],
  livestock: ["livestock", "poultry"],
};

const CROP_CATEGORIES = ["vegetables", "fruits", "grains"];

const lower = (value) => String(value ?? "").trim().toLowerCase();

export const normalizeProducts = (data) => {
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data)) return data;
  return [];
};

export const getEffectivePrice = (product) =>
  Number(product?.discounted_price || product?.price || 0);

// "Kano, Nigeria" -> "Kano"
export const getProductLocation = (product) => {
  const raw = product?.location || product?.farmer?.farm_location || "";
  return String(raw).split(",")[0].trim();
};

export const getLocationOptions = (products) =>
  [...new Set(products.map(getProductLocation).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

export const matchesCategory = (product, uiCategory) => {
  const key = lower(uiCategory);
  const aliases = CATEGORY_ALIASES[key] || [key];
  const category = lower(product?.category);
  const farmType = lower(product?.farmer?.farm_type);

  if (aliases.includes(category)) return true;

  // The API only distinguishes "crop" / "livestock"; use the farm type to
  // narrow crops down when available, otherwise a crop matches any crop tile.
  if (category === "crop" && CROP_CATEGORIES.includes(key)) {
    if (!farmType || !Object.values(CATEGORY_ALIASES).flat().includes(farmType)) return true;
    return aliases.includes(farmType);
  }
  return false;
};

const matchesQuery = (product, query) => {
  const term = lower(query);
  if (!term) return true;
  return [
    product?.name,
    product?.description,
    product?.category,
    product?.location,
    product?.farmer?.full_name,
    product?.farmer?.farm_name,
  ].some((field) => lower(field).includes(term));
};

export const filterProducts = (products, { filters = EMPTY_FILTERS, query = "" } = {}) => {
  const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);
  const locations = filters.locations.map(lower);

  return products.filter((product) => {
    if (!product) return false;
    if (!matchesQuery(product, query)) return false;
    if (
      filters.categories.length &&
      !filters.categories.some((cat) => matchesCategory(product, cat))
    ) {
      return false;
    }
    if (filters.availability.length) {
      const inStock = product.availability === "in_stock";
      const wanted = filters.availability.includes(inStock ? "in_stock" : "out_of_stock");
      if (!wanted) return false;
    }
    if (locations.length && !locations.includes(lower(getProductLocation(product)))) {
      return false;
    }
    if (maxPrice !== null && Number.isFinite(maxPrice) && getEffectivePrice(product) > maxPrice) {
      return false;
    }
    return true;
  });
};

export const countActiveFilters = (filters) =>
  filters.categories.length +
  filters.availability.length +
  filters.locations.length +
  (filters.maxPrice !== "" ? 1 : 0);

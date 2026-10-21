// Shared helpers for normalising farmer order / product API responses.
// Response shapes are not documented, so every accessor is defensive and
// falls back across the field names already used throughout the app.

const LIST_KEYS = ["orders", "products", "results", "data", "items"];

/** Pull an array out of a list response (`[...]`, `{ orders: [...] }`, `{ data: [...] }`, ...). */
export const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of LIST_KEYS) {
    if (Array.isArray(payload[key])) return payload[key];
    // e.g. { data: { orders: [...] } }
    if (payload[key] && typeof payload[key] === "object") {
      const nested = extractList(payload[key]);
      if (nested.length) return nested;
    }
  }
  return [];
};

export const extractOrders = extractList;
export const extractProducts = extractList;

/** Unwrap a single-order response (`{...}`, `{ order: {...} }`, `{ data: {...} }`). */
export const extractOrder = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }
  if (payload.order && typeof payload.order === "object") return payload.order;
  if (
    payload.id == null &&
    payload.data &&
    typeof payload.data === "object" &&
    !Array.isArray(payload.data)
  ) {
    return payload.data;
  }
  return payload;
};

/** Accepts numbers or numeric strings like "₦12,500.00". Returns null when unparseable. */
export const parseAmount = (raw) => {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  const num = parseFloat(String(raw).replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(num) ? num : null;
};

export const formatNaira = (value) => {
  const num = parseAmount(value);
  return num == null ? "₦0" : `₦${num.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
};

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-700", chart: "#ffa725" },
  { value: "confirmed", label: "Awaiting Confirmation", color: "bg-purple-100 text-purple-700", chart: "#ff8400" },
  { value: "shipped", label: "Shipping In Progress", color: "bg-blue-100 text-blue-700", chart: "#3fdc7e" },
  { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-700", chart: "#016130" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700", chart: "#dc2626" },
  { value: "refunded", label: "Refunded", color: "bg-gray-100 text-gray-700", chart: "#9ca3af" },
];

/** "Shipped" / "SHIPPED" / "shipped " -> "shipped" */
export const normalizeOrderStatus = (status) =>
  String(status || "pending")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const findStatus = (status) =>
  ORDER_STATUSES.find((s) => s.value === normalizeOrderStatus(status));

export const getOrderStatusLabel = (status) =>
  findStatus(status)?.label ||
  String(status || "Pending").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export const getOrderStatusColor = (status) =>
  findStatus(status)?.color || "bg-gray-100 text-gray-700";

export const getOrderStatusChartColor = (status) =>
  findStatus(status)?.chart || "#6b7280";

/** Orders in these states don't count toward revenue. */
export const NON_REVENUE_STATUSES = ["cancelled", "refunded"];

// ---------------------------------------------------------------------------
// Order field accessors
// ---------------------------------------------------------------------------

export const getOrderId = (order) => (order?.id != null ? String(order.id) : "");

export const getOrderNumber = (order) =>
  order?.order_number || (order?.id != null ? `#${order.id}` : "—");

export const getOrderTotal = (order) =>
  parseAmount(order?.total_price ?? order?.total_amount ?? order?.amount);

export const getOrderQuantity = (order) =>
  order?.quantity_ordered ?? order?.quantity ?? 1;

export const getOrderDate = (order) => {
  const raw = order?.created_at || order?.order_date || order?.date;
  if (!raw) return null;
  const date = new Date(raw);
  return isNaN(date) ? null : date;
};

export const formatOrderDate = (order) =>
  getOrderDate(order)?.toLocaleDateString() || "N/A";

export const getOrderBuyerName = (order) =>
  order?.buyer_name ||
  order?.consumer_name ||
  order?.customer_name ||
  order?.buyer?.full_name ||
  order?.consumer?.full_name ||
  order?.user?.full_name ||
  "Unknown Buyer";

export const getOrderBuyerEmail = (order) =>
  order?.buyer_email ||
  order?.consumer_email ||
  order?.customer_email ||
  order?.contact_email ||
  order?.buyer?.email ||
  order?.consumer?.email ||
  order?.user?.email ||
  null;

export const getOrderBuyerPhone = (order) =>
  order?.contact_phone ||
  order?.buyer_phone ||
  order?.consumer_phone ||
  order?.customer_phone ||
  order?.buyer?.phone ||
  order?.consumer?.phone ||
  order?.user?.phone ||
  null;

export const getOrderProductId = (order) =>
  order?.product_id ?? order?.product?.id ?? null;

export const getOrderProductName = (order) =>
  order?.product_name || order?.product?.name || "Unknown Product";

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

const imageFromEntry = (entry) => {
  if (!entry) return null;
  if (typeof entry === "string") return entry;
  if (typeof entry === "object") {
    return (
      entry.url ||
      entry.src ||
      entry.image ||
      entry.path ||
      entry.location ||
      entry.file ||
      null
    );
  }
  return null;
};

/** First usable image URL from an `images`-style array or single image field. */
export const getFirstImage = (...candidates) => {
  for (const candidate of candidates) {
    const list = Array.isArray(candidate) ? candidate : [candidate];
    for (const entry of list) {
      const src = imageFromEntry(entry);
      if (src) return src;
    }
  }
  return null;
};

export const getOrderImage = (order) =>
  getFirstImage(order?.product_images, order?.product_image, order?.product?.images);

export const getProductImage = (product) =>
  getFirstImage(product?.images, product?.image, product?.image_url);

// ---------------------------------------------------------------------------
// Routes  (FarmerOrderPage -> ProductOrdersPage -> SingleOrderPage)
// ---------------------------------------------------------------------------

const PRODUCT_ROUTE_PREFIX = "product-";

/** Route segment for a product's orders page, e.g. "product-42". */
export const toProductRouteId = (productId) =>
  `${PRODUCT_ROUTE_PREFIX}${productId ?? "unknown"}`;

/** "product-42" -> "42" (also accepts a bare id). Returns null for "product-unknown". */
export const fromProductRouteId = (routeId) => {
  if (!routeId) return null;
  const id = String(routeId).startsWith(PRODUCT_ROUTE_PREFIX)
    ? String(routeId).slice(PRODUCT_ROUTE_PREFIX.length)
    : String(routeId);
  return id && id !== "unknown" ? id : null;
};

export const getProductOrdersPath = (order) =>
  `/farmer-orders/${toProductRouteId(getOrderProductId(order))}`;

export const getSingleOrderPath = (order) =>
  `${getProductOrdersPath(order)}/${encodeURIComponent(getOrderId(order))}`;

// ---------------------------------------------------------------------------
// Dashboard aggregations
// ---------------------------------------------------------------------------

export const isRevenueOrder = (order) =>
  !NON_REVENUE_STATUSES.includes(normalizeOrderStatus(order?.status));

/** Sum of order totals, excluding cancelled / refunded orders. */
export const getOrdersRevenue = (orders) =>
  orders.reduce(
    (sum, order) => (isRevenueOrder(order) ? sum + (getOrderTotal(order) ?? 0) : sum),
    0
  );

/** Revenue per calendar month for the last `months` months (oldest first). */
export const getRevenueByMonth = (orders, months = 6, now = new Date()) => {
  const buckets = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      total: 0,
    });
  }
  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]));

  orders.forEach((order) => {
    if (!isRevenueOrder(order)) return;
    const date = getOrderDate(order);
    if (!date) return;
    const bucket = byKey[`${date.getFullYear()}-${date.getMonth()}`];
    if (bucket) bucket.total += getOrderTotal(order) ?? 0;
  });

  return buckets;
};

/** [{ status, label, color, count }] for statuses that have at least one order. */
export const getOrdersByStatus = (orders) => {
  const counts = {};
  orders.forEach((order) => {
    const status = normalizeOrderStatus(order?.status);
    counts[status] = (counts[status] || 0) + 1;
  });

  const known = ORDER_STATUSES.map((s) => s.value);
  const ordered = [
    ...known.filter((s) => counts[s]),
    ...Object.keys(counts).filter((s) => !known.includes(s)),
  ];

  return ordered.map((status) => ({
    status,
    label: getOrderStatusLabel(status),
    color: getOrderStatusChartColor(status),
    count: counts[status],
  }));
};

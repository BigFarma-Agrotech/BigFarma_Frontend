import { ORDER_STATUS } from "./mock";

// API order status -> consumer-facing status. The backend only accepts
// "Mark as delivered" (confirm-delivery) while an order is awaiting_confirmation.
const STATUS_MAP = {
  pending: ORDER_STATUS.PLACED,
  confirmed: ORDER_STATUS.PLACED,
  shipping: ORDER_STATUS.SHIPPING,
  awaiting_confirmation: ORDER_STATUS.AWAITING,
  delivery_issue: ORDER_STATUS.ISSUE,
  delivered: ORDER_STATUS.DELIVERED,
  cancelled: ORDER_STATUS.CANCELLED,
};

/** Accepts a bare array or a list wrapped under orders/data/results/items. */
export const extractConsumerOrders = (payload) => {
  if (Array.isArray(payload)) return payload;
  for (const key of ["orders", "data", "results", "items"]) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

const timeAgo = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const firstImage = (images) => {
  if (Array.isArray(images)) return images[0];
  if (typeof images === "string") return images.split(",")[0]?.trim();
  return undefined;
};

/** Maps an API order onto the shape the consumer order UI renders. */
export const mapApiOrder = (order) => {
  const hasIssue =
    order?.has_issue || order?.issue_reported || order?.issues?.length > 0;
  const status = hasIssue
    ? ORDER_STATUS.ISSUE
    : STATUS_MAP[String(order?.status || "pending").toLowerCase()] ||
      ORDER_STATUS.PLACED;

  return {
    // public_id addresses the order in API paths (confirm delivery, report issue)
    id: order?.public_id ?? order?.order_number ?? "",
    product: order?.product_name || order?.product?.name || "Product",
    productImage:
      firstImage(order?.product_images) ||
      firstImage(order?.product?.images) ||
      null,
    qty: order?.quantity_ordered ?? order?.quantity ?? 1,
    farmer:
      order?.farmer_name || order?.farmer?.full_name || order?.farm_name || "Farmer",
    status,
    updatedAt: timeAgo(order?.updated_at || order?.created_at),
    delivery: {
      address: order?.delivery_address || "",
      contact: order?.contact_phone || "",
    },
  };
};

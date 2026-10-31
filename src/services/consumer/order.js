import { axios } from "@/lib/axios";

// No trailing slash: Vercel's /api/v1 rewrite doesn't proxy "/orders/" (it
// serves the app's HTML instead). The backend answers "/orders" directly.
export const getOrdersHandler = async ({ status, search } = {}) => {
  const response = await axios.get(`/orders`, {
    params: { status, search },
  });
  return response.data;
};

// Orders are only placed through Paystack. POST /payments/checkout creates the
// cart's orders (unpaid) and returns the Paystack page to send the buyer to:
// { reference, authorization_url, subtotal, delivery_fee, tax, amount, orders }.
// Payload: { items: [{ product_id, quantity }], delivery_address, contact_name,
// contact_phone, delivery_option, email?, callback_url }.
export async function checkoutHandler(payload) {
  const response = await axios.post(`/payments/checkout`, payload);
  return response.data;
}

// After Paystack sends the buyer back: confirms the payment and, if paid, marks
// the orders paid. { status: "success" | "pending" | "failed" | "abandoned", ... }
export async function verifyPaymentHandler(reference) {
  const response = await axios.get(`/payments/verify/${encodeURIComponent(reference)}`);
  return response.data;
}

export async function getOrderByIdHandler(order_id) {
  const response = await axios.get(`/orders/${order_id}`);
  return response.data;
}

export async function reportOrderIssueHandler(order_id, payload) {
  const response = await axios.post(
    `/orders/${order_id}/report-issue`,
    payload
  );
  return response.data;
}

export async function confirmOrderDeliveryHandler(order_id) {
  const response = await axios.post(`/orders/${order_id}/confirm-delivery`);
  return response.data;
}

export async function getOrderTimelineHandler(order_id) {
  const response = await axios.get(`/orders/${order_id}/timeline`);
  return response.data;
}

export async function getOrderIssuesHandler(order_id) {
  const response = await axios.get(`/orders/${order_id}/issues`);
  return response.data;
}

export async function getOrderStatisticsHandler() {
  const response = await axios.get(`/orders/statistics/summary`);
  return response.data;
}

export async function updateOrderStatusHandler(order_id, payload) {
  const response = await axios.put(`/orders/${order_id}/status`, payload);
  return response.data;
}

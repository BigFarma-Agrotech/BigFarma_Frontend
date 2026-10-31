import { axios } from "@/lib/axios";

// No trailing slash: Vercel's /api/v1 rewrite doesn't proxy "/orders/" (it
// serves the app's HTML instead). The backend answers "/orders" directly.
export const getOrdersHandler = async ({ status, search } = {}) => {
  const response = await axios.get(`/orders`, {
    params: { status, search },
  });
  return response.data;
};

// POST /orders creates one order per product: { product_id, quantity_ordered,
// delivery_address }. The backend works out the price and notifies the farmer.
export async function createOrderHandler(payload) {
  const response = await axios.post(`/orders`, payload);
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

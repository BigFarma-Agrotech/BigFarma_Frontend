import { axios } from "@/lib/axios";

// The list route needs its trailing slash; `/orders` redirects to the backend
// host directly, which bypasses the proxy and is blocked by CORS
export const getOrdersHandler = async ({ status, search } = {}) => {
  const response = await axios.get(`/orders/`, {
    params: { status, search },
  });
  return response.data;
};

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

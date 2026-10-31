import {
  getOrderByIdHandler,
  getOrderIssuesHandler,
  getOrdersHandler,
  getOrderStatisticsHandler,
  getOrderTimelineHandler,
} from "@/services";
import { useQuery } from "@tanstack/react-query";

export const useConsumerOrders = ({ status, search } = {}, { enabled = true } = {}) =>
  useQuery({
    queryKey: ["consumer-orders", { status, search }],
    enabled,
    queryFn: () => getOrdersHandler({ status, search }),
  });

// GET /orders/statistics/summary -> { data: { total_orders, pending_orders,
// delivered_orders, cancelled_orders, total_spent, ... } }
export const useConsumerOrderStats = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: ["consumer-orders", "statistics"],
    enabled,
    queryFn: async () => (await getOrderStatisticsHandler())?.data ?? {},
  });

export const useConsumerOrderById = (order_id) =>
  useQuery({
    queryKey: ["consumer-orders", order_id],
    queryFn: () => getOrderByIdHandler(order_id),
    enabled: !!order_id,
  });

export const useConsumerOrderTimeline = (order_id) =>
  useQuery({
    queryKey: ["consumer-order-timeline", order_id, "timeline"],
    queryFn: () => getOrderTimelineHandler(order_id),
    enabled: !!order_id,
  });

export const useConsumerOrderIssues = (order_id) =>
  useQuery({
    queryKey: ["consumer-order-issues", order_id, "issues"],
    queryFn: () => getOrderIssuesHandler(order_id),
    enabled: !!order_id,
  });

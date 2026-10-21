import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  reportOrderIssueHandler,
  confirmOrderDeliveryHandler,
  updateOrderStatusHandler,
} from "@/services";

export const useReportConsumerOrderIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ order_id, payload }) =>
      reportOrderIssueHandler(order_id, payload),
    onSuccess: (_, { order_id }) => {
      queryClient.invalidateQueries({ queryKey: ["consumer-orders", order_id, "issues"] });
    },
  });
};

export const useConfirmConsumerOrderDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (order_id) => confirmOrderDeliveryHandler(order_id),
    onSuccess: (_, order_id) => {
      queryClient.invalidateQueries({ queryKey: ["consumer-orders", order_id] });
      queryClient.invalidateQueries({ queryKey: ["consumer-orders"] });
    },
  });
};

export const useUpdateConsumerOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ order_id, payload }) =>
      updateOrderStatusHandler(order_id, payload),
    onSuccess: (_, { order_id }) => {
      queryClient.invalidateQueries({ queryKey: ["consumer-orders", order_id] });
      queryClient.invalidateQueries({ queryKey: ["consumer-orders"] });
    },
  });
};

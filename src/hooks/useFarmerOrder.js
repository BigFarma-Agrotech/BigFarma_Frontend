import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmerApi } from '../lib/farmerApi';

// Query keys
export const farmerOrderKeys = {
  all: ['farmer-orders'],
  lists: () => [...farmerOrderKeys.all, 'list'],
  list: (filters) => [...farmerOrderKeys.lists(), { filters }],
  details: () => [...farmerOrderKeys.all, 'detail'],
  detail: (id) => [...farmerOrderKeys.details(), id],
};

// How often open farmer pages check for new orders
export const FARMER_ORDERS_POLL_MS = 60 * 1000;

// Main hook for fetching orders. Polls so new orders show up on the dashboard
// (and in the notification bell) without a reload.
export const useFarmerOrder = (filters = {}, { enabled = true } = {}) => {
  return useQuery({
    queryKey: farmerOrderKeys.list(filters),
    queryFn: async () => {
      const response = await farmerApi.getOrders();
      return response.data;
    },
    enabled,
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: FARMER_ORDERS_POLL_MS,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

// Hook for updating order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, statusData }) =>
      farmerApi.updateOrderStatus(orderId, statusData),
    onSuccess: () => {
      // Invalidate and refetch both the orders lists and any cached order details
      queryClient.invalidateQueries({
        queryKey: farmerOrderKeys.all,
      });
    },
    onError: (error) => {
      console.error('Failed to update order status:', error);
    },
  });
};

// Hook for fetching single order
export const useOrder = (orderId) => {
  return useQuery({
    queryKey: farmerOrderKeys.detail(orderId),
    queryFn: async () => {
      const response = await farmerApi.getOrder(orderId);
      return response.data;
    },
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

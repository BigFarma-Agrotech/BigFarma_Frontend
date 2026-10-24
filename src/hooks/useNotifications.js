import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { notificationKeys, notificationsApi } from "@/lib/notificationsApi";
import { walletDashboardQueryKey } from "@/lib/walletApi";
import { farmerOrderKeys } from "./useFarmerOrder";

const POLL_MS = 60 * 1000;

// Notifications for the signed-in user (farmer or consumer), from the backend.
// Polls so new ones show up without a reload, and toasts any that arrive while
// the app is open.
export const useNotifications = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationsApi.list(),
    staleTime: 30 * 1000,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  });

  const countQuery = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationsApi.unreadCount,
    staleTime: 30 * 1000,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  });

  const notifications = useMemo(
    () => (Array.isArray(listQuery.data) ? listQuery.data : []),
    [listQuery.data],
  );

  // Ids from the previous fetch; null until the first one lands so existing
  // notifications don't all toast on page load
  const knownIdsRef = useRef(null);
  useEffect(() => {
    if (!listQuery.data) return;
    const known = knownIdsRef.current;
    if (known) {
      const arrived = notifications.filter((n) => !known.has(n.id));
      arrived.forEach((n) => toast.info(n.title || n.message));
      // Notifications are about orders and payments, so refresh what they
      // affect: order lists and the wallet balance
      if (arrived.length) {
        queryClient.invalidateQueries({ queryKey: farmerOrderKeys.all });
        queryClient.invalidateQueries({ queryKey: ["consumer-orders"] });
        queryClient.invalidateQueries({ queryKey: walletDashboardQueryKey });
      }
    }
    knownIdsRef.current = new Set(notifications.map((n) => n.id));
  }, [listQuery.data, notifications, queryClient]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });

  const markRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: invalidate,
  });

  return {
    notifications,
    unreadCount: countQuery.data ?? notifications.filter((n) => !n.is_read).length,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch,
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
    isMarkingAll: markAllRead.isPending,
  };
};

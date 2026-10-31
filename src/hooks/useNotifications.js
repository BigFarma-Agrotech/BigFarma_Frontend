import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { notificationKeys, notificationsApi } from "@/lib/notificationsApi";
import { walletDashboardQueryKey } from "@/lib/walletApi";
import { getAccessToken } from "@/lib/auth";
import { NOTIFICATIONS_WS_URL } from "@/lib/config";
import { farmerOrderKeys } from "./useFarmerOrder";

// Polling is the fallback for when the socket is down
const POLL_MS = 60 * 1000;
const PING_MS = 25 * 1000;
const MAX_RECONNECT_MS = 30 * 1000;
// Close codes from the backend: bad token / token expired. Reconnecting with the
// same token can't help; the next API call's 401 sends the user to sign in.
const NO_RECONNECT_CODES = [4001, 4002];

// Live updates from /notifications/ws: a new notification refetches the list
// (which toasts it), and unread-count messages keep the badge in sync across tabs.
const useNotificationSocket = (queryClient) => {
  useEffect(() => {
    let socket;
    let pingTimer;
    let reconnectTimer;
    let attempts = 0;
    let stopped = false;

    const connect = () => {
      const token = getAccessToken();
      if (!token || stopped) return;
      socket = new WebSocket(`${NOTIFICATIONS_WS_URL}?token=${encodeURIComponent(token)}`);

      socket.onopen = () => {
        attempts = 0;
        pingTimer = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) socket.send("ping");
        }, PING_MS);
      };

      socket.onmessage = (event) => {
        let message;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }
        if (message.type === "notification" && message.data?.id != null) {
          // Show it in the dropdown straight away, then sync with the server
          queryClient.setQueryData(notificationKeys.list(), (list) =>
            Array.isArray(list) && !list.some((n) => n.id === message.data.id)
              ? [message.data, ...list]
              : list
          );
          queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
        } else if (message.type === "unread_count") {
          queryClient.setQueryData(notificationKeys.unreadCount(), message.data?.unread_count ?? 0);
        }
      };

      socket.onclose = (event) => {
        clearInterval(pingTimer);
        if (stopped || NO_RECONNECT_CODES.includes(event.code)) return;
        // Back off 1s, 2s, 4s ... up to 30s while the backend is unreachable
        const delay = Math.min(1000 * 2 ** attempts, MAX_RECONNECT_MS);
        attempts += 1;
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();
    return () => {
      stopped = true;
      clearInterval(pingTimer);
      clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [queryClient]);
};

// Notifications for the signed-in user (farmer or consumer), from the backend.
// Pushed over a WebSocket as they're created (polling as a fallback), and toasts
// any that arrive while the app is open.
export const useNotifications = () => {
  const queryClient = useQueryClient();
  useNotificationSocket(queryClient);

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

  // Reading updates the list and the badge immediately; on failure both roll back
  const optimisticRead = (isTarget) => async () => {
    await queryClient.cancelQueries({ queryKey: notificationKeys.all });
    const previousList = queryClient.getQueryData(notificationKeys.list());
    const previousCount = queryClient.getQueryData(notificationKeys.unreadCount());
    const list = Array.isArray(previousList) ? previousList : [];
    const newlyRead = list.filter((n) => !n.is_read && isTarget(n)).length;
    const readAt = new Date().toISOString();
    queryClient.setQueryData(notificationKeys.list(), (current) =>
      Array.isArray(current)
        ? current.map((n) => (!n.is_read && isTarget(n) ? { ...n, is_read: true, read_at: readAt } : n))
        : current
    );
    queryClient.setQueryData(notificationKeys.unreadCount(), (count) =>
      typeof count === "number" ? Math.max(0, count - newlyRead) : count
    );
    return { previousList, previousCount };
  };

  const rollback = (_error, _variables, context) => {
    if (!context) return;
    queryClient.setQueryData(notificationKeys.list(), context.previousList);
    queryClient.setQueryData(notificationKeys.unreadCount(), context.previousCount);
  };

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });

  const markRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onMutate: (id) => optimisticRead((n) => n.id === id)(),
    onError: rollback,
    onSettled: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onMutate: async () => {
      const context = await optimisticRead(() => true)();
      // Older unread ones may sit outside the loaded page, so zero the badge outright
      queryClient.setQueryData(notificationKeys.unreadCount(), 0);
      return context;
    },
    onError: rollback,
    onSettled: invalidate,
  });

  // Deleting removes it from the dropdown at once (and from the badge if unread)
  const optimisticRemove = (isTarget) => async () => {
    await queryClient.cancelQueries({ queryKey: notificationKeys.all });
    const previousList = queryClient.getQueryData(notificationKeys.list());
    const previousCount = queryClient.getQueryData(notificationKeys.unreadCount());
    const list = Array.isArray(previousList) ? previousList : [];
    const removedUnread = list.filter((n) => !n.is_read && isTarget(n)).length;
    queryClient.setQueryData(notificationKeys.list(), (current) =>
      Array.isArray(current) ? current.filter((n) => !isTarget(n)) : current
    );
    queryClient.setQueryData(notificationKeys.unreadCount(), (count) =>
      typeof count === "number" ? Math.max(0, count - removedUnread) : count
    );
    return { previousList, previousCount };
  };

  const deleteNotification = useMutation({
    mutationFn: notificationsApi.remove,
    onMutate: (id) => optimisticRemove((n) => n.id === id)(),
    onError: rollback,
    onSettled: invalidate,
  });

  const clearAll = useMutation({
    mutationFn: notificationsApi.clear,
    onMutate: async () => {
      const context = await optimisticRemove(() => true)();
      queryClient.setQueryData(notificationKeys.unreadCount(), 0);
      return context;
    },
    onError: rollback,
    onSettled: invalidate,
  });

  return {
    notifications,
    unreadCount: countQuery.data ?? notifications.filter((n) => !n.is_read).length,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch,
    markRead: markRead.mutate,
    markAllRead: () => markAllRead.mutate(),
    isMarkingAll: markAllRead.isPending,
    deleteNotification: deleteNotification.mutate,
    clearAll: () => clearAll.mutate(),
    isClearing: clearAll.isPending,
  };
};

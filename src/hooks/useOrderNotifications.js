import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useFarmerOrder } from "./useFarmerOrder";
import { walletDashboardQueryKey } from "@/lib/walletApi";
import {
  extractOrders,
  getOrderId,
  getOrderProductName,
  normalizeOrderStatus,
} from "@/lib/farmerOrder";

const SEEN_KEY = "BIGFARMA_SEEN_ORDERS";

const loadSeen = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SEEN_KEY));
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
};

const saveSeen = (seen) => {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    // Unread state just won't survive a reload
  }
};

// In-app order notifications for farmers. New (pending) orders the farmer
// hasn't opened the bell for count as unread, and an order that arrives while
// the app is open pops a toast. The order list itself polls the backend.
export const useOrderNotifications = ({ enabled = true } = {}) => {
  const queryClient = useQueryClient();
  const { data } = useFarmerOrder({}, { enabled });
  const [seen, setSeen] = useState(loadSeen);
  // id -> status from the previous fetch; null until the first one lands so
  // existing orders don't all toast on page load
  const knownRef = useRef(null);

  const orders = useMemo(() => extractOrders(data), [data]);

  const newOrders = useMemo(
    () =>
      orders
        .filter((order) => normalizeOrderStatus(order.status) === "pending")
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)),
    [orders],
  );

  const unread = useMemo(
    () => newOrders.filter((order) => !seen.has(getOrderId(order))),
    [newOrders, seen],
  );

  useEffect(() => {
    if (!data) return;
    const current = new Map(
      orders.map((order) => [getOrderId(order), normalizeOrderStatus(order.status)]),
    );
    const known = knownRef.current;
    if (known) {
      const arrived = orders.filter((order) => !known.has(getOrderId(order)));
      arrived.forEach((order) =>
        toast.info(`New order received: ${getOrderProductName(order)}`),
      );
      // The backend credits the wallet when a buyer confirms delivery, so
      // refresh the balance whenever an order arrives or changes status
      const changed = [...current].some(([id, status]) => known.get(id) !== status);
      if (changed) {
        queryClient.invalidateQueries({ queryKey: walletDashboardQueryKey });
      }
    }
    knownRef.current = current;
  }, [data, orders, queryClient]);

  const markAllRead = useCallback(() => {
    setSeen((prev) => {
      const next = new Set(prev);
      newOrders.forEach((order) => next.add(getOrderId(order)));
      saveSeen(next);
      return next;
    });
  }, [newOrders]);

  return { newOrders, unreadCount: unread.length, isUnread: (order) => !seen.has(getOrderId(order)), markAllRead };
};

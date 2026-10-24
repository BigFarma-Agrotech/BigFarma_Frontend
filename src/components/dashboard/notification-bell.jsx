import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useOrderNotifications } from "@/hooks/useOrderNotifications";
import { cn } from "@/lib/utils";
import {
  formatNaira,
  formatOrderDate,
  getOrderId,
  getOrderNumber,
  getOrderProductName,
  getOrderQuantity,
  getOrderTotal,
  getSingleOrderPath,
} from "@/lib/farmerOrder";

// Farmer's bell: lists new orders waiting to be confirmed. Opening it marks
// them as read.
export default function NotificationBell() {
  const { newOrders, unreadCount, isUnread, markAllRead } = useOrderNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Mark read when the list closes (however it closes), so the unread
  // highlight stays visible while it's open
  const markAllReadRef = useRef(markAllRead);
  useEffect(() => {
    markAllReadRef.current = markAllRead;
  }, [markAllRead]);
  useEffect(() => {
    if (!open) return;
    return () => markAllReadRef.current();
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={
          unreadCount
            ? `Notifications, ${unreadCount} new order${unreadCount === 1 ? "" : "s"}`
            : "Notifications"
        }
        className="relative p-1 focus:outline-none"
      >
        <Bell className="h-5 w-5 text-[#8e8e93]" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-xs text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 top-16 z-40 rounded-xl border border-gray-200 bg-white shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="font-semibold text-gray-900">New orders</h2>
            <Link
              to="/farmer-orders"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {newOrders.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              No new orders right now.
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto">
              {newOrders.map((order) => (
                <li key={getOrderId(order)}>
                  <Link
                    to={getSingleOrderPath(order)}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block px-4 py-3 hover:bg-gray-50",
                      isUnread(order) && "bg-primary-subtle/40",
                    )}
                  >
                    <p className="text-sm font-medium capitalize text-gray-900">
                      {getOrderProductName(order)} &middot; {getOrderQuantity(order)}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {getOrderNumber(order)} &middot; {formatNaira(getOrderTotal(order))} &middot;{" "}
                      {formatOrderDate(order)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

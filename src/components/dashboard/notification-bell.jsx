import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const timeAgo = (iso) => {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (!Number.isFinite(seconds)) return "";
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

// Where a notification leads. They're about orders today, so open the
// role's order list.
const targetPath = (role) => (role === "farmer" ? "/farmer-orders" : "/orders");

// Header bell for farmers and consumers, backed by /notifications
export default function NotificationBell({ role }) {
  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    refetch,
    markRead,
    markAllRead,
    isMarkingAll,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

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

  const openNotification = (notification) => {
    if (!notification.is_read) markRead(notification.id);
    setOpen(false);
    navigate(targetPath(role));
  };

  const badgeColor = role === "farmer" ? "bg-secondary" : "bg-primary-light";

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={
          unreadCount
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        className="relative p-1 focus:outline-none"
      >
        <Bell className="h-5 w-5 text-[#8e8e93]" />
        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs text-white",
              badgeColor,
            )}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 top-16 z-40 rounded-xl border border-gray-200 bg-white shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                disabled={isMarkingAll}
                className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
              >
                Mark all as read
              </button>
            )}
          </div>

          {isLoading ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">Loading...</p>
          ) : isError ? (
            <div className="px-4 py-8 text-center text-sm text-red-600">
              <p>Couldn&apos;t load notifications.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-1 font-medium text-primary underline"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => openNotification(notification)}
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-left hover:bg-gray-50",
                      !notification.is_read && "bg-primary-subtle/40",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        notification.is_read ? "bg-transparent" : badgeColor,
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-900">
                        {notification.title}
                      </span>
                      {notification.message && (
                        <span className="mt-0.5 block text-sm text-gray-600">
                          {notification.message}
                        </span>
                      )}
                      <span className="mt-1 block text-xs text-gray-400">
                        {timeAgo(notification.created_at)}
                        {!notification.is_read && <span className="sr-only"> (unread)</span>}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

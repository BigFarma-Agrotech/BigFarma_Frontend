import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, ChevronDown, Trash2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { toProductRouteId } from "@/lib/farmerOrder";

// Times are UTC; one without an offset would otherwise be parsed as local time
const parseUtc = (iso) =>
  new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`);

const timeAgo = (iso) => {
  const seconds = Math.max(0, (Date.now() - parseUtc(iso).getTime()) / 1000);
  if (!Number.isFinite(seconds)) return "";
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)}d ago`;
  return parseUtc(iso).toLocaleDateString();
};

// Where a notification leads: the order it's about, by its public ids.
// Login alerts (no order) don't navigate.
const targetPath = (role, notification) => {
  const orderId = notification.reference_public_id;
  if (!orderId) return null;
  // Group buy notifications point at the group
  if (notification.notification_type === "group_buy") return `/group-buy/${encodeURIComponent(orderId)}`;
  if (role === "farmer") {
    return notification.product_public_id
      ? `/farmer-orders/${toProductRouteId(notification.product_public_id)}/${encodeURIComponent(orderId)}`
      : "/farmer-orders";
  }
  return `/orders?order=${encodeURIComponent(orderId)}`;
};

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
    deleteNotification,
    clearAll,
    isClearing,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  // The notification expanded in place to read in full
  const [expandedId, setExpandedId] = useState(null);
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

  // Clicking a notification reads it where it is; "View order" is what navigates
  const toggleNotification = (notification) => {
    if (!notification.is_read) markRead(notification.id);
    setExpandedId((current) => (current === notification.id ? null : notification.id));
  };

  const viewOrder = (notification) => {
    if (!notification.is_read) markRead(notification.id);
    setOpen(false);
    navigate(targetPath(role, notification));
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
            <div className="flex items-center gap-3">
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
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearAll()}
                  disabled={isClearing}
                  className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                >
                  Clear all
                </button>
              )}
            </div>
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
              {notifications.map((notification) => {
                const isExpanded = expandedId === notification.id;
                const hasOrder = Boolean(targetPath(role, notification));
                const detailsId = `notification-${notification.id}-details`;
                return (
                  <li
                    key={notification.id}
                    className={cn(!notification.is_read && "bg-primary-subtle/40")}
                  >
                    {/* Collapsed: just the title. The arrow opens the message and order link. */}
                    <div className="flex items-center gap-1 pr-2">
                      <button
                        type="button"
                        onClick={() => toggleNotification(notification)}
                        aria-expanded={isExpanded}
                        aria-controls={detailsId}
                        className="flex min-w-0 flex-1 items-center gap-3 py-3 pl-4 text-left hover:bg-gray-50"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            notification.is_read ? "bg-transparent" : badgeColor,
                          )}
                        />
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-sm text-gray-900",
                            notification.is_read ? "font-normal" : "font-semibold",
                          )}
                        >
                          {notification.title}
                          {!notification.is_read && <span className="sr-only"> (unread)</span>}
                        </span>
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "h-4 w-4 shrink-0 text-gray-400 transition-transform",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </button>
                      {!notification.is_read && (
                        <button
                          type="button"
                          onClick={() => markRead(notification.id)}
                          aria-label={`Mark "${notification.title}" as read`}
                          title="Mark as read"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-primary"
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (isExpanded) setExpandedId(null);
                          deleteNotification(notification.id);
                        }}
                        aria-label={`Delete "${notification.title}"`}
                        title="Delete"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    {isExpanded && (
                      <div id={detailsId} className="pb-3 pl-9 pr-4">
                        {notification.message && (
                          <p className="whitespace-pre-line break-words text-sm text-gray-600">
                            {notification.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">{timeAgo(notification.created_at)}</p>
                        {hasOrder && (
                          <button
                            type="button"
                            onClick={() => viewOrder(notification)}
                            className="mt-2 text-sm font-medium text-primary hover:underline"
                          >
                            View order
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

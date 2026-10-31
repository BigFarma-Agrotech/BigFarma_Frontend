import { axios } from "./axios";

// GET /notifications/ -> [{ id, notification_type, title, message,
// reference_id, reference_public_id, product_public_id, is_read, read_at,
// created_at }], newest first. The public ids link to the order (and its product).
// The list route needs its trailing slash, like /orders/.
export const notificationsApi = {
  list: async ({ unreadOnly = false, limit = 20 } = {}) =>
    (await axios.get("/notifications/", { params: { unread_only: unreadOnly, limit } })).data,

  unreadCount: async () =>
    (await axios.get("/notifications/unread-count")).data?.unread_count ?? 0,

  markRead: async (id) => (await axios.patch(`/notifications/${id}/read`)).data,

  markAllRead: async () => (await axios.patch("/notifications/read-all")).data,
};

export const notificationKeys = {
  all: ["notifications"],
  list: () => [...notificationKeys.all, "list"],
  unreadCount: () => [...notificationKeys.all, "unread-count"],
};

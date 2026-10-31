import { axios } from "./axios";

// GET /notifications/ -> [{ id, notification_type, title, message,
// reference_id, reference_public_id, product_public_id, is_read, read_at,
// created_at }], newest first. The public ids link to the order (and its product).
// No trailing slash: Vercel's /api/v1 rewrite doesn't proxy "/notifications/" and
// serves the app's HTML instead.
export const notificationsApi = {
  list: async ({ unreadOnly = false, limit = 20 } = {}) => {
    const { data } = await axios.get("/notifications", { params: { unread_only: unreadOnly, limit } });
    // Anything but a list (e.g. an HTML page) is an error, not "no notifications"
    if (!Array.isArray(data)) throw new Error("Unexpected notifications response");
    return data;
  },

  unreadCount: async () =>
    (await axios.get("/notifications/unread-count")).data?.unread_count ?? 0,

  markRead: async (id) => (await axios.patch(`/notifications/${id}/read`)).data,

  markAllRead: async () => (await axios.patch("/notifications/read-all")).data,

  remove: async (id) => axios.delete(`/notifications/${id}`),

  // Deletes every notification (again no trailing slash)
  clear: async () => (await axios.delete("/notifications")).data,
};

export const notificationKeys = {
  all: ["notifications"],
  list: () => [...notificationKeys.all, "list"],
  unreadCount: () => [...notificationKeys.all, "unread-count"],
};

export const STATUSES = {
  none: {
    label: "",
    className: "",
  },
  delivered: {
    label: "Delivered",
    className: "text-white bg-primary",
  },
  pending: {
    label: "Pending",
    className: "text-white bg-secondary",
  },
  cancelled: {
    label: "Cancelled",
    className: "text-white bg-[#e02424]",
  },
  shipping: {
    label: "Shipping",
    className: "text-white bg-[#1161e6]",
  },
};

export const getStatusText = (status) => STATUSES[status]?.label || status;

export const getStatusClasses = (status) => STATUSES[status]?.className || "";

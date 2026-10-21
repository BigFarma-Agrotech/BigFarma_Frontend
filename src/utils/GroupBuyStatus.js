export const StatusLabel = {
  none: {
    label: "",
    className: "",
  },
  AlmostFull: {
    label: "Almost Full",
    className: "text-white bg-secondary",
  },
  Complete: {
    label: "Complete",
    className: "text-white bg-primary",
  },
};

export const getStatusText = (status) => StatusLabel[status]?.label || status;

export const getStatusClasses = (status) => StatusLabel[status]?.className || "";
export const getDotClasses = (status) => StatusLabel[status]?.Dot || "";

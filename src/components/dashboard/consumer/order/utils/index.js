import { Bell, CheckCircle2, Clock, Triangle } from "lucide-react";

export const getCurrentStepIndex = (statusLabel, timelineSteps) => {
  if (statusLabel === "Delivery Issue - Pending Review") {
    return timelineSteps.findIndex((s) => s.label === "Awaiting Confirmation");
  }
  return timelineSteps.findIndex((s) => s.label === statusLabel);
};

export const getTimelineStepProps = (idx, currentStepIndex) => {
  const isCompletedOrCurrent = idx <= currentStepIndex;

  return {
    IconComponent: isCompletedOrCurrent ? CheckCircle2 : Clock,
    iconColor: isCompletedOrCurrent ? "#016130" : "#9ca3af",
    borderColor: isCompletedOrCurrent ? "#016130" : "#d1d5db",
    bgColor: isCompletedOrCurrent ? "#ecfdf3" : "#f3f4f6",
  };
};

export const getBanner = (statusLabel) => {
  switch (statusLabel) {
    case "Awaiting Confirmation":
      return {
        icon: Bell,
        iconColor: "#6b4610",
        bgColor: "#fff6e9",
        firstText: "Confirmation Required",
        secondText:
          "Please confirm if you have received this order. If there is a problem, let us know.",
        show: true,
      };

    case "Delivered":
      return {
        icon: Clock,
        iconColor: "#016130",
        bgColor: "#c9f4de",
        firstText: "Delivery Complete",
        secondText: "Thanks! The farmer has been notified.",
        show: true,
      };

    case "Delivery Issue - Pending Review":
      return {
        icon: Triangle,
        iconColor: "#e02424",
        bgColor: "#fff6e9",
        firstText: "Delivery Issue - Pending Review",
        secondText:
          "We’ve logged your report. Support will contact you within 24-48 hours.",
        show: true,
      };

    case "Shipping In Progress":
    default:
      return { show: false };
  }
};

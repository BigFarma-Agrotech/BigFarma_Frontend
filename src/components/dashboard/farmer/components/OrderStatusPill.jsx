import { cn } from "@/lib/utils";
import {
  getOrderStatusBadge,
  getOrderStatusLabel,
  normalizeOrderStatus,
} from "@/lib/farmerOrder";
import deliveryIssueIcon from "@/assets/icons/delivery-issue.svg";

// Bordered order-status pill from the farmer order screens
const OrderStatusPill = ({ status, className }) => {
  const isIssue = normalizeOrderStatus(status) === "delivery_issue";

  return (
    <span
      className={cn(
        "inline-flex min-h-[30px] shrink-0 items-center justify-center gap-0.5 rounded-xl border p-2 text-xs leading-none",
        getOrderStatusBadge(status),
        className
      )}
    >
      {isIssue && (
        <img src={deliveryIssueIcon} alt="" width="20" height="20" className="h-5 w-5 shrink-0" />
      )}
      {getOrderStatusLabel(status)}
    </span>
  );
};

export default OrderStatusPill;

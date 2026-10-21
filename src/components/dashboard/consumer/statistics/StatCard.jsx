import { formatAmount } from "@/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

const StatCard = ({ title, total, percentage }) => {
  const isPositive = percentage >= 0;
  const isCurrentOrders = title.toLowerCase() === "current orders";

  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
      <p className="mb-2 text-sm font-medium text-gray-600">{title}</p>

      <p className="break-words text-2xl font-bold text-gray-900 lg:text-3xl">
        {isCurrentOrders ? `${total} active` : `₦${formatAmount(total)}`}
      </p>

      <div
        className={`mt-2 flex items-center gap-1 text-xs font-medium ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        <span>{percentage}% growth</span>
      </div>
    </div>
  );
};

export default StatCard;

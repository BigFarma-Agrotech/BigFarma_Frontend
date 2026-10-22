import { formatAmount } from "@/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

// `percentage` shows a growth line (mock cards); `caption` replaces it for
// figures that come from the API
const StatCard = ({ title, total, format = "currency", percentage, caption, isError, refetch }) => {
  const isPositive = percentage >= 0;

  const display =
    format === "active"
      ? `${(Number(total) || 0).toLocaleString()} active`
      : format === "number"
        ? (Number(total) || 0).toLocaleString()
        : `₦${formatAmount(Number(total) || 0)}`;

  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
      <p className="mb-2 text-sm font-medium text-gray-600">{title}</p>

      {isError ? (
        <div className="text-sm text-red-600">
          <p>Couldn&apos;t load this figure.</p>
          {refetch && (
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-1 font-medium text-primary underline"
            >
              Try again
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="break-words text-2xl font-bold text-gray-900 lg:text-3xl">
            {display}
          </p>

          {percentage != null ? (
            <div
              className={`mt-2 flex items-center gap-1 text-xs font-medium ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              <span>{percentage}% growth</span>
            </div>
          ) : (
            caption && <p className="mt-2 text-xs font-medium text-gray-500">{caption}</p>
          )}
        </>
      )}
    </div>
  );
};

export default StatCard;

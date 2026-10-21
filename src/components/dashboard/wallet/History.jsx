import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/shared";
import { ArrowUpRight, ArrowDownLeft, ArrowBigDown } from "lucide-react";
import {
  getStatusClasses,
  getStatusText,
  getStatusIcon,
  getTextColor,
} from "../../../utils/TransactionStatus";
import { walletDashboardQuery } from "../../../lib/walletApi";
import { cn } from "@/lib/utils";

const formatTransactionDate = (transaction) => {
  const rawDate =
    transaction.created_at || transaction.date || transaction.initiated_at;

  if (!rawDate) return "—";

  const date = new Date(rawDate);
  if (isNaN(date)) return "—";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const StateMessage = ({ children }) => (
  <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white text-sm text-gray-500">
    {children}
  </div>
);

const formatTransactionAmount = (amount) => {
  const num = Number(amount);
  return Number.isFinite(num) ? num.toLocaleString() : "0";
};

const History = () => {
  const {
    data: walletData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    ...walletDashboardQuery,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div
        className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 sm:p-6"
        aria-busy="true"
        aria-label="Loading transactions"
      >
        <Skeleton className="mb-4 h-6 w-48 rounded-md" />
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError || !walletData) {
    return (
      <StateMessage>
        <p className="text-red-500">Failed to load transactions</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 text-sm font-medium text-primary underline"
        >
          Try again
        </button>
      </StateMessage>
    );
  }

  const allTransactions = Array.isArray(walletData?.recent_transactions)
    ? walletData.recent_transactions
    : [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Transaction History
      </h2>

      {allTransactions.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center text-sm text-gray-500">
          <ArrowBigDown size={40} strokeWidth={1} className="mb-2" />
          <p>No transactions available</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {allTransactions.map((transaction, index) => {
            const statusClass = getStatusClasses(transaction.status);
            const statusText = getStatusText(transaction.status);
            const StatusIcon = getStatusIcon(transaction.status);

            const isCredit = transaction.type === "credit";
            const ArrowIcon = isCredit ? ArrowDownLeft : ArrowUpRight;

            return (
              <li
                key={transaction.id || index}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-full p-2.5",
                      isCredit
                        ? "bg-primary-subtle text-primary"
                        : "bg-[#fff1c2] text-secondary"
                    )}
                  >
                    <ArrowIcon size={22} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 sm:text-base">
                      {transaction.description ||
                        transaction.category ||
                        (isCredit ? "Credit" : "Debit")}
                    </p>
                    <p className="text-xs text-gray-500 sm:text-sm">
                      {formatTransactionDate(transaction)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p
                    className="text-sm font-semibold sm:text-base"
                    style={{ color: getTextColor(transaction.status) }}
                  >
                    ₦{formatTransactionAmount(transaction.amount)}
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      statusClass
                    )}
                  >
                    {StatusIcon && <StatusIcon size={12} strokeWidth={1.5} />}
                    {statusText}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default History;

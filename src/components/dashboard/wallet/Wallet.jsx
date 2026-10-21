import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wallet, TrendingUp, Eye, EyeClosed } from "lucide-react";
import QuickActions from "./QuickActions";
import History from "./History.jsx";
import { Skeleton } from "@/components/shared";
import { walletDashboardQuery } from "../../../lib/walletApi";

const formatBalance = (value) =>
  Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
  });

const WalletDashboard = () => {
  const {
    data: walletData,
    isLoading,
    isError,
    refetch,
  } = useQuery(walletDashboardQuery);

  const [isVisible, setIsVisible] = useState(true);
  const toggleVisibility = () => setIsVisible((prev) => !prev);
  const historyRef = useRef(null);

  const showHistory = () => {
    historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    historyRef.current?.focus({ preventScroll: true });
  };

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading wallet">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
    );
  }

  const wallet = walletData?.wallet;

  if (isError || !wallet) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
        <p>Failed to load wallet info</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 font-medium text-primary underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const VisibilityIcon = isVisible ? Eye : EyeClosed;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary p-4 text-white sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Wallet size={32} strokeWidth={1} aria-hidden="true" />
            <p className="text-lg font-semibold sm:text-xl">Wallet Balance</p>
          </div>
          <TrendingUp size={36} strokeWidth={1} aria-hidden="true" />
        </div>

        <div className="mt-5 flex flex-col items-start gap-2">
          <div className="flex items-center gap-3">
            <p className="break-all text-2xl font-semibold">
              <span className="pr-0.5 font-light">₦</span>
              {isVisible ? formatBalance(wallet.balance) : "*********"}
            </p>
            <button
              type="button"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide balance" : "Show balance"}
              className="shrink-0 rounded p-1 hover:bg-white/10"
            >
              <VisibilityIcon size={20} strokeWidth={2} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1 text-sm text-white/90">
            <p>Ledger balance</p>
            <span>{formatBalance(wallet.ledger_balance)}</span>
          </div>
        </div>
      </div>

      <QuickActions onShowHistory={showHistory} />

      <div
        id="wallet-history"
        ref={historyRef}
        tabIndex={-1}
        className="max-h-[420px] scroll-mt-4 overflow-y-auto rounded-xl focus:outline-none"
      >
        <History />
      </div>
    </div>
  );
};

export default WalletDashboard;

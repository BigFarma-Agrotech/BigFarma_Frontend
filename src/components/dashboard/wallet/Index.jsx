import { useState } from "react";
import { cn } from "@/lib/utils";
import WalletDashboard from "./Wallet.jsx";
import History from "./History.jsx";

const tabs = [
  { id: "wallet", label: "Dashboard" },
  { id: "history", label: "Transaction History", shortLabel: "History" },
];

const WalletIndex = () => {
  const [activeTab, setActiveTab] = useState("wallet");

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Wallet</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your balance, withdrawals and transactions.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Wallet sections"
        className="grid grid-cols-2 gap-3 sm:flex"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex h-10 items-center justify-center whitespace-nowrap rounded-lg border border-primary px-4 text-sm font-medium transition-colors sm:min-w-44",
              activeTab === tab.id
                ? "bg-primary text-white"
                : "bg-white text-primary hover:bg-primary-subtle"
            )}
          >
            {tab.shortLabel ? (
              <>
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </>
            ) : (
              tab.label
            )}
          </button>
        ))}
      </div>

      {activeTab === "wallet" ? <WalletDashboard /> : <History />}
    </div>
  );
};

export default WalletIndex;

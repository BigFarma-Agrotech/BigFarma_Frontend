import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { History, List, Download } from "lucide-react";
import WithdrawModal from "./WithdrawModal";

const items = [
  { id: "withdraw", icon: Download, label: "Withdraw" },
  { id: "history", icon: History, label: "History" },
  { id: "account", icon: List, label: "Account Details" },
];

const QuickActions = ({ onShowHistory }) => {
  const navigate = useNavigate();
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const handleAction = (id) => {
    if (id === "withdraw") {
      setWithdrawModalOpen(true);
    } else if (id === "history") {
      onShowHistory?.();
    } else if (id === "account") {
      // Existing payment / bank-account setup route
      navigate("/payment");
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleAction(item.id)}
              className="flex min-h-22 flex-col items-center justify-center gap-2 rounded-xl border border-primary px-1 py-3 transition-colors hover:bg-primary-subtle/40"
            >
              <span className="rounded-full bg-primary-subtle p-2">
                <Icon size={22} strokeWidth={2.5} className="text-primary" />
              </span>
              <span className="text-center text-xs font-medium text-gray-700 sm:text-sm">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
      />
    </div>
  );
};

export default QuickActions;

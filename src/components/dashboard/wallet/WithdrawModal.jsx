import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import Button from "@/components/shared/Button";
import { Skeleton } from "@/components/shared";
import { cn } from "@/lib/utils";
import {
  getWalletBalance,
  requestWithdrawal,
  walletDashboardQuery,
} from "../../../lib/walletApi";

const formatBalance = (value) =>
  Number(value ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 });

const validateAmount = (rawAmount, balance) => {
  if (rawAmount === "" || rawAmount == null) return "Enter an amount to withdraw.";
  const amount = Number(rawAmount);
  if (!Number.isFinite(amount)) return "Enter a valid amount.";
  if (amount <= 0) return "Amount must be greater than ₦0.";
  if (amount > balance) {
    return `Amount cannot exceed your available balance of ₦${formatBalance(balance)}.`;
  }
  return "";
};

const WithdrawModalContent = ({ onClose }) => {
  const {
    data: walletData,
    isLoading,
    isError,
    refetch,
  } = useQuery(walletDashboardQuery);
  const balance = getWalletBalance(walletData);

  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);
  const error = validateAmount(amount, balance);
  const showError = touched && !!error;

  const withdrawMutation = useMutation({
    mutationFn: requestWithdrawal,
    onSuccess: () => {
      toast.success("Withdrawal request submitted");
      onClose();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Withdrawal failed. Please try again."
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (error || isLoading || isError) return;
    withdrawMutation.mutate({ amount: Number(amount) });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-title"
      className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 text-left sm:p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 id="withdraw-title" className="text-lg font-semibold text-gray-900">
            Withdraw Funds
          </h3>
          <p className="text-sm text-gray-600">
            Withdraw money from your wallet to the bank account in your{" "}
            <Link
              to="/payment"
              className="font-medium text-primary underline hover:text-primary-dark"
            >
              account details
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5">
        <label
          htmlFor="withdraw-amount"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Amount (₦)
        </label>
        <div
          className={cn(
            "flex h-12 w-full items-center rounded-lg border bg-white transition focus-within:ring-1",
            showError
              ? "border-red-500 focus-within:ring-red-500"
              : "border-grey-100 focus-within:border-primary-light focus-within:ring-primary-light"
          )}
        >
          <span className="pl-4 pr-1 text-base text-gray-500" aria-hidden="true">
            ₦
          </span>
          <input
            id="withdraw-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={showError}
            aria-describedby="withdraw-amount-help"
            className="h-full min-w-0 flex-1 rounded-r-lg bg-transparent pr-4 text-base outline-none"
            required
          />
        </div>
        <div id="withdraw-amount-help" className="mt-2 text-sm">
          {showError && <p className="mb-1 text-red-600">{error}</p>}
          {isLoading ? (
            <Skeleton className="h-4 w-40 rounded" />
          ) : isError ? (
            <p className="text-red-600">
              Couldn&apos;t load your balance.{" "}
              <button
                type="button"
                onClick={() => refetch()}
                className="font-medium underline"
              >
                Retry
              </button>
            </p>
          ) : (
            <p className="font-medium text-grey-200">
              Available: ₦{formatBalance(balance)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={withdrawMutation.isPending}
          className="h-10 flex-1 py-0"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={withdrawMutation.isPending || isLoading || isError}
          className="h-10 flex-1 py-0"
        >
          {withdrawMutation.isPending ? "Processing..." : "Confirm Withdrawal"}
        </Button>
      </div>
    </form>
  );
};

const WithdrawModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Content is mounted only while open, so form state resets on every open.
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <WithdrawModalContent onClose={onClose} />
    </div>
  );
};

export default WithdrawModal;

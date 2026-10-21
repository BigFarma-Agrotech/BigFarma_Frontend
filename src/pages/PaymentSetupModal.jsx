import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronDown, X } from "lucide-react";
import Input from "../components/shared/Input";
import Button from "../components/shared/Button";

const LABEL = "mb-1.5 block text-sm font-medium text-gray-700";

const PaymentSetup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ holder: "", bank: "", account: "" });

  const update = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: field === "account" ? e.target.value.replace(/D/g, "").slice(0, 10) : e.target.value,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.holder.trim() || !form.bank.trim()) {
      toast.error("Enter the account holder name and bank");
      return;
    }
    if (form.account.length !== 10) {
      toast.error("Account number must be 10 digits");
      return;
    }
    // No withdrawal-account endpoint exists yet (wallet.withdraw is commented out)
    toast.info("Linking withdrawal accounts is coming soon");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-setup-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="payment-setup-title" className="text-lg font-semibold text-gray-900 sm:text-xl">
              Set up your withdrawal account
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Enter your bank or mobile money details so you can get paid directly when
              your products sell.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="account-holder" className={LABEL}>
              Account Holder Name
            </label>
            <Input id="account-holder" placeholder="John Doe" className="h-12" value={form.holder} onChange={update("holder")} />
          </div>
          <div>
            <label htmlFor="bank" className={LABEL}>
              Bank
            </label>
            <div className="relative">
              <Input id="bank" placeholder="ABC Bank" className="h-12 pr-10" value={form.bank} onChange={update("bank")} />
              <ChevronDown
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral"
              />
            </div>
          </div>
          <div>
            <label htmlFor="account-number" className={LABEL}>
              Account Number
            </label>
            <Input
              id="account-number"
              placeholder="123456789"
              inputMode="numeric"
              className="h-12"
              value={form.account}
              onChange={update("account")}
            />
          </div>
          <Button type="submit" className="mt-2 h-12 w-full py-0">
            Link Account
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PaymentSetup;

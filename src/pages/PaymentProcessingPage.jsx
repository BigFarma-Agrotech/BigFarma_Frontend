import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks";

export default function PaymentProcessingPage() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { clearCart } = useCart();
  // clearCart is re-created on every cart change; keep the latest in a ref so
  // the timer effect doesn't restart when the cart is cleared.
  const clearCartRef = useRef(clearCart);
  const finishedRef = useRef(false);

  useEffect(() => {
    clearCartRef.current = clearCart;
  }, [clearCart]);

  useEffect(() => {
    if (!localStorage.getItem("bigfarma-order")) {
      navigate("/cart", { replace: true });
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 100));
    }, 300);

    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    if (progress < 100 || finishedRef.current) return;
    finishedRef.current = true;
    clearCartRef.current();
    navigate("/order-confirmation", { replace: true });
  }, [progress, navigate]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-subtle">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Redirecting to Flutterwave</h1>
        <p className="mt-2 text-sm text-gray-600">
          Please do not close this window. Processing Payment...
        </p>

        <div
          className="mt-6 h-2 w-full overflow-hidden rounded-full bg-gray-200"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-4 text-sm text-gray-500">Connecting to secure payment gateway...</p>
      </div>
    </div>
  );
}

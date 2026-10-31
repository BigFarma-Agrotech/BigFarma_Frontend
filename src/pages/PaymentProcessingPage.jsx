import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useCart } from "@/hooks";
import { verifyPaymentHandler } from "@/services";
import { parseApiError } from "@/lib/apiError";
import { farmerOrderKeys } from "@/hooks/useFarmerOrder";
import { CONFIRMED_ORDER_KEY, PENDING_CHECKOUT_KEY } from "@/lib/checkout";

// Paystack can take a moment to settle a payment; check a few times before giving up
const PENDING_RETRIES = 5;
const PENDING_RETRY_MS = 3000;

const readPendingCheckout = () => {
  try {
    return JSON.parse(localStorage.getItem(PENDING_CHECKOUT_KEY)) || null;
  } catch {
    return null;
  }
};

const MESSAGES = {
  abandoned: {
    title: "Payment cancelled",
    body: "You left the Paystack page before paying, so your order wasn't placed. Your cart is still saved.",
  },
  failed: {
    title: "Payment failed",
    body: "Your payment didn't go through and you haven't been charged for this order. Your cart is still saved.",
  },
  pending: {
    title: "Payment still processing",
    body: "Paystack hasn't confirmed your payment yet. Check again in a moment; if you were charged, your order will appear in My Orders once it's confirmed.",
  },
};

// Paystack sends the buyer here (?reference=...) after the payment page
export default function PaymentProcessingPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { removeFromCart } = useCart();
  const removeFromCartRef = useRef(removeFromCart);
  useEffect(() => {
    removeFromCartRef.current = removeFromCart;
  }, [removeFromCart]);

  // checking | pending | failed | abandoned | error
  const [state, setState] = useState({ status: "checking", message: "", gatewayResponse: "" });

  const verify = useCallback(async () => {
    setState({ status: "checking", message: "", gatewayResponse: "" });
    for (let attempt = 0; attempt <= PENDING_RETRIES; attempt += 1) {
      let payment;
      try {
        payment = await verifyPaymentHandler(reference);
      } catch (error) {
        setState({
          status: "error",
          message: parseApiError(error, "We couldn't confirm your payment. Please try again.").message,
          gatewayResponse: "",
        });
        return;
      }

      if (payment.status === "success") {
        const pending = readPendingCheckout();
        if (pending?.reference !== payment.reference) {
          // Already handled (e.g. a second check of the same payment): keep what's saved
          navigate("/order-confirmation", { replace: true });
          return;
        }
        // Only paid items leave the cart
        (pending.productIds || []).forEach((id) => removeFromCartRef.current(id));
        localStorage.removeItem(PENDING_CHECKOUT_KEY);
        queryClient.invalidateQueries({ queryKey: ["consumer-orders"] });
        queryClient.invalidateQueries({ queryKey: farmerOrderKeys.all });
        localStorage.setItem(
          CONFIRMED_ORDER_KEY,
          JSON.stringify({ payment, items: pending.items || [], customerInfo: pending.customerInfo || {} })
        );
        navigate("/order-confirmation", { replace: true });
        return;
      }

      if (payment.status !== "pending" || attempt === PENDING_RETRIES) {
        setState({ status: payment.status, message: "", gatewayResponse: payment.gateway_response || "" });
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, PENDING_RETRY_MS));
    }
  }, [reference, navigate, queryClient]);

  // Check once per reference (React may run effects twice in development)
  const checkedRef = useRef(null);
  useEffect(() => {
    if (!reference) {
      navigate("/cart", { replace: true });
      return;
    }
    if (checkedRef.current === reference) return;
    checkedRef.current = reference;
    verify();
  }, [reference, verify, navigate]);

  if (state.status === "checking") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-subtle">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Confirming your payment</h1>
          <p className="mt-2 text-sm text-gray-600">
            Please don&apos;t close this window while we check with Paystack.
          </p>
        </div>
      </div>
    );
  }

  const copy =
    state.status === "error"
      ? { title: "We couldn't confirm your payment", body: state.message }
      : MESSAGES[state.status] || MESSAGES.failed;
  const canRetryCheck = state.status === "error" || state.status === "pending";

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        role="alert"
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8"
      >
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{copy.title}</h1>
        <p className="mt-2 text-sm text-gray-600">{copy.body}</p>
        {state.gatewayResponse && state.status !== "abandoned" && (
          <p className="mt-2 text-sm text-gray-500">Paystack: {state.gatewayResponse}</p>
        )}
        <p className="mt-2 break-all text-xs text-gray-400">Reference: {reference}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {canRetryCheck ? (
            <button
              type="button"
              onClick={verify}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 font-medium text-white hover:bg-primary-dark"
            >
              Check again
            </button>
          ) : (
            <Link
              to="/checkout"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 font-medium text-white hover:bg-primary-dark"
            >
              Try again
            </Link>
          )}
          <Link
            to="/cart"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-5 font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to cart
          </Link>
        </div>
      </div>
    </div>
  );
}

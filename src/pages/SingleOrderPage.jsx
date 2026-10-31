import { useParams, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useOrder, useUpdateOrderStatus } from "../hooks/useFarmerOrder";
import OrderStatusPill from "../components/dashboard/farmer/components/OrderStatusPill";
import { cn } from "@/lib/utils";
import {
  FARMER_NEXT_STATUS,
  extractOrder,
  formatOrderDate,
  getOrderBuyerEmail,
  getOrderBuyerName,
  getOrderBuyerPhone,
  getOrderNumber,
  getOrderQuantity,
  getOrderStatusLabel,
  getOrderTitle,
  normalizeOrderStatus,
} from "../lib/farmerOrder";

const POLICY = [
  "If the consumer doesn’t confirm within 24 hours, the system sends a reminder automatically.",
  "If the consumer disputes delivery, status becomes Delivery Issue – Pending Review.",
  "If there’s no confirmation after 5 days, the system may auto‑complete with a Soft Delivered status unless an issue is raised.",
];

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.detail ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const cardClass = "rounded-lg bg-white";

const outlineButtonClass =
  "inline-flex shrink-0 items-center justify-center rounded-lg border border-primary bg-white px-4 py-2 text-base font-medium leading-none text-primary transition-colors hover:bg-primary-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light";

const filledButtonClass =
  "inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-base font-medium leading-none text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light";

const ContactRow = ({ label, children }) => (
  <div className="flex justify-between gap-4">
    <dt className="shrink-0">{label}</dt>
    <dd className="min-w-0 break-words text-right">{children}</dd>
  </div>
);

const SingleOrderPage = () => {
  const { productId, orderId: rawOrderId } = useParams();
  const orderId = rawOrderId ? decodeURIComponent(rawOrderId) : rawOrderId;
  const location = useLocation();

  const { data: apiResponse, isLoading, error } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();

  // Show the order passed via router state (from ProductOrdersPage) while the
  // detail request loads; the fetched order replaces it once it arrives.
  const order = extractOrder(apiResponse) || location.state?.order || null;

  const backPath = `/farmer-orders/${productId}`;

  if (isLoading && !order) {
    return (
      <div className={cn(cardClass, "flex flex-col items-center gap-4 py-12")}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={cn(cardClass, "flex flex-col items-center gap-4 py-12 text-center")}>
        <p className="text-sm font-medium text-red-500">
          {error ? "We couldn't load this order. Please try again." : "Order not found."}
        </p>
        <Link to={backPath} className={outlineButtonClass}>
          Back to Orders
        </Link>
      </div>
    );
  }

  const nextStep = FARMER_NEXT_STATUS[normalizeOrderStatus(order.status)];
  const buyer = getOrderBuyerName(order);
  const buyerPhone = getOrderBuyerPhone(order);
  const buyerEmail = getOrderBuyerEmail(order);
  const contactHref = buyerEmail
    ? `mailto:${buyerEmail}?subject=${encodeURIComponent(
        `Your BigFarma order ${getOrderNumber(order)}`
      )}`
    : buyerPhone
      ? `tel:${String(buyerPhone).replace(/[^\d+]/g, "")}`
      : null;

  const advanceStatus = () => {
    updateStatus.mutate(
      { orderId: order.public_id ?? orderId, statusData: { status: nextStep.status } },
      {
        onSuccess: () => toast.success(`Order marked as ${getOrderStatusLabel(nextStep.status)}`),
        onError: (err) => toast.error(getErrorMessage(err, "Failed to update order status")),
      }
    );
  };

  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
      <section className={cn(cardClass, "flex min-w-0 flex-col gap-10 px-2.5 py-5 xl:max-w-[710px] xl:flex-1")}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 p-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-col gap-2.5">
              <h1 className="break-words text-xl font-semibold text-black">{getOrderTitle(order)}</h1>
              <div className="flex flex-wrap items-center gap-2.5 text-base">
                <OrderStatusPill status={order.status} />
                <span className="font-medium text-grey-300">Buyer: {buyer}</span>
                <span className="font-medium text-grey-300">Qty: {getOrderQuantity(order)}</span>
                <span className="text-[#8a8a8a]">{formatOrderDate(order)}</span>
              </div>
            </div>
            <Link to={backPath} className={cn(outlineButtonClass, "self-start sm:self-auto")}>
              Back
            </Link>
          </div>
          <hr className="border-[#b0b0b0]" />
        </div>

        {nextStep && (
          <button
            type="button"
            onClick={advanceStatus}
            disabled={updateStatus.isPending}
            aria-busy={updateStatus.isPending}
            className={cn(filledButtonClass, "self-start px-6 py-3 disabled:cursor-not-allowed disabled:opacity-60")}
          >
            {updateStatus.isPending ? "Updating..." : nextStep.action}
          </button>
        )}

        <div className="flex flex-col gap-5 px-2.5 text-black">
          <h2 className="text-lg font-semibold">Delivery and Confirmation Policy</h2>
          <ul className="flex list-disc flex-col gap-2.5 pl-6 text-base">
            {POLICY.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <aside className={cn(cardClass, "flex flex-col gap-5 p-5 text-black xl:w-[348px] xl:shrink-0")}>
        <h2 className="text-xl font-semibold">Buyer Contact</h2>
        <dl className="flex flex-col gap-2.5 text-base">
          <ContactRow label="Name">{buyer}</ContactRow>
          <ContactRow label="Phone Number">
            <span className="whitespace-nowrap">{buyerPhone || "N/A"}</span>
          </ContactRow>
          <ContactRow label="Address">{order.delivery_address || "N/A"}</ContactRow>
        </dl>
        <div className="flex flex-wrap items-center gap-3">
          {contactHref ? (
            <a href={contactHref} className={cn(outlineButtonClass, "px-3 text-sm")}>
              Message Customer
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="No email or phone number available for this buyer"
              className={cn(outlineButtonClass, "cursor-not-allowed px-3 text-sm opacity-50")}
            >
              Message Customer
            </button>
          )}
          <Link to="/support" className={cn(filledButtonClass, "px-3 text-sm")}>
            Contact Support
          </Link>
        </div>
      </aside>
    </div>
  );
};

export default SingleOrderPage;

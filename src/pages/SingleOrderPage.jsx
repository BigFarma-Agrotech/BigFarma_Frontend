import { useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MessageCircle, Headphones, AlertTriangle, ArrowLeft } from "lucide-react";
import { useOrder, useUpdateOrderStatus } from "../hooks/useFarmerOrder";
import Button from "@/components/shared/Button";
import { cn } from "@/lib/utils";
import {
  FARMER_STATUS_OPTIONS,
  extractOrder,
  formatNaira,
  formatOrderDate,
  getOrderBuyerEmail,
  getOrderBuyerName,
  getOrderBuyerPhone,
  getOrderNumber,
  getOrderProductName,
  getOrderQuantity,
  getOrderStatusColor,
  getOrderStatusLabel,
  getOrderTotal,
  normalizeOrderStatus,
} from "../lib/farmerOrder";

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return isNaN(date) ? "N/A" : date.toLocaleDateString();
};

// Once an order reaches one of these it can no longer be marked as shipped.
const CANNOT_SHIP = [
  "shipping",
  "awaiting_confirmation",
  "delivered",
  "delivery_issue",
  "cancelled",
];

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.detail ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const cardClass = "rounded-xl border border-gray-200 bg-white p-4 sm:p-6";

const backLinkClass =
  "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-primary bg-white px-4 text-base font-medium text-primary transition-colors hover:bg-primary-subtle";

const InfoRow = ({ label, children }) => (
  <div className="flex justify-between gap-4 text-sm">
    <dt className="shrink-0 text-gray-600">{label}</dt>
    <dd className="min-w-0 break-words text-right font-medium text-gray-900">
      {children}
    </dd>
  </div>
);

const SingleOrderPage = () => {
  const { productId, orderId: rawOrderId } = useParams();
  const orderId = rawOrderId ? decodeURIComponent(rawOrderId) : rawOrderId;
  const location = useLocation();
  const navigate = useNavigate();

  const { data: apiResponse, isLoading, error } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();

  // Fall back to the order passed via router state (from ProductOrdersPage)
  // while the detail request is loading or if it fails.
  const stateOrder = location.state?.order;
  const apiOrder = extractOrder(apiResponse) || stateOrder || null;

  const currentStatus = normalizeOrderStatus(apiOrder?.status);
  const [selectedStatus, setSelectedStatus] = useState("");
  const statusToApply = selectedStatus || currentStatus;
  const [pendingAction, setPendingAction] = useState(null);

  const backPath = `/farmer-orders/${productId}`;

  if (isLoading && !apiOrder) {
    return (
      <div className={cn(cardClass, "flex flex-col items-center gap-4 py-12")}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (!apiOrder) {
    return (
      <div
        className={cn(
          cardClass,
          "flex flex-col items-center gap-4 py-12 text-center"
        )}
      >
        <p className="text-sm font-medium text-red-500">
          {error
            ? "We couldn't load this order. Please try again."
            : "Order not found."}
        </p>
        <Link to={backPath} className={backLinkClass}>
          Back to Orders
        </Link>
      </div>
    );
  }

  const buyer = getOrderBuyerName(apiOrder);
  const qty = getOrderQuantity(apiOrder);
  const statusLabel = getOrderStatusLabel(apiOrder.status);
  const statusColor = getOrderStatusColor(apiOrder.status);
  const total = getOrderTotal(apiOrder);
  const qtyNumber = parseFloat(qty);
  const unitPrice =
    total != null && qtyNumber > 0 ? formatNaira(total / qtyNumber) : "N/A";
  const productName = getOrderProductName(apiOrder);
  const totalPrice = formatNaira(total);

  const buyerEmail = getOrderBuyerEmail(apiOrder);
  const buyerPhone = getOrderBuyerPhone(apiOrder);
  const contactHref = buyerEmail
    ? `mailto:${buyerEmail}?subject=${encodeURIComponent(
        `Your BigFarma order ${getOrderNumber(apiOrder)}`
      )}`
    : buyerPhone
      ? `tel:${String(buyerPhone).replace(/[^\d+]/g, "")}`
      : null;

  const isUpdating = updateStatus.isPending;
  const canShip = !CANNOT_SHIP.includes(currentStatus);
  const hasIssue = /issue|dispute/i.test(String(apiOrder.status || ""));

  const changeStatus = (status, action) => {
    if (!apiOrder.id && !orderId) return;
    setPendingAction(action);
    updateStatus.mutate(
      { orderId: apiOrder.id ?? orderId, statusData: { status } },
      {
        onSuccess: () => {
          toast.success(`Order marked as ${getOrderStatusLabel(status)}`);
          setSelectedStatus("");
          // Keep router state in sync so the fallback doesn't show a stale status
          if (stateOrder) {
            navigate(location.pathname, {
              replace: true,
              state: { order: { ...stateOrder, status } },
            });
          }
        },
        onError: (err) => {
          toast.error(getErrorMessage(err, "Failed to update order status"));
        },
        onSettled: () => setPendingAction(null),
      }
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="min-w-0 space-y-6 xl:col-span-2">
        <div className={cardClass}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="break-words text-xl font-bold text-gray-900 sm:text-2xl">
                Order {apiOrder.order_number || `#${orderId}`}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                    statusColor
                  )}
                >
                  {statusLabel}
                </span>
                <span className="font-medium text-gray-600">Buyer: {buyer}</span>
                <span className="font-medium text-gray-600">Qty: {qty}</span>
                <span className="font-medium text-gray-400">
                  {formatOrderDate(apiOrder)}
                </span>
              </div>
            </div>
            <Link to={backPath} className={cn(backLinkClass, "self-start")}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
          </div>

          <div className="mt-4 space-y-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            <p>
              Product:{" "}
              <span className="font-medium text-gray-900">{productName}</span>
            </p>
            <p>
              Total Price:{" "}
              <span className="font-medium text-gray-900">{totalPrice}</span>
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              className="h-10 py-0 text-sm"
              onClick={() => changeStatus("shipping", "ship")}
              disabled={isUpdating || !canShip}
              aria-busy={pendingAction === "ship"}
              title={canShip ? undefined : `Order is already ${statusLabel.toLowerCase()}`}
            >
              {pendingAction === "ship" ? "Updating..." : "Mark as Shipped"}
            </Button>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label htmlFor="order-status" className="sr-only">
                New order status
              </label>
              <select
                id="order-status"
                value={statusToApply}
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={isUpdating}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light"
              >
                {!FARMER_STATUS_OPTIONS.some((s) => s.value === currentStatus) && (
                  <option value={currentStatus}>{statusLabel}</option>
                )}
                {FARMER_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                className="h-10 py-0 text-sm"
                onClick={() => changeStatus(statusToApply, "update")}
                disabled={isUpdating || statusToApply === currentStatus}
                aria-busy={pendingAction === "update"}
                title={
                  statusToApply === currentStatus
                    ? "Choose a different status to update"
                    : undefined
                }
              >
                {pendingAction === "update" ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Order Information</h3>
              <dl className="space-y-3">
                <InfoRow label="Order Number:">{getOrderNumber(apiOrder)}</InfoRow>
                <InfoRow label="Order Date:">{formatOrderDate(apiOrder)}</InfoRow>
                <InfoRow label="Estimated Delivery:">
                  {formatDate(apiOrder.estimated_delivery_date)}
                </InfoRow>
              </dl>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">
                Delivery Information
              </h3>
              <dl className="space-y-3">
                <InfoRow label="Delivery Address:">
                  {apiOrder.delivery_address || "N/A"}
                </InfoRow>
                <InfoRow label="Contact Phone:">{buyerPhone || "N/A"}</InfoRow>
                {apiOrder.delivery_notes && (
                  <InfoRow label="Delivery Notes:">
                    {apiOrder.delivery_notes}
                  </InfoRow>
                )}
              </dl>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">
              Delivery and Confirmation Policy
            </h3>
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600">
              <li>Update status when items leave your farm</li>
              <li>System sends reminder after 24 hours</li>
              <li>Auto-complete after 5 days if no issue</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-6">
        <div className={cardClass}>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Buyer Contact
          </h3>
          <dl className="space-y-3">
            <InfoRow label="Name">{buyer}</InfoRow>
            {buyerEmail && <InfoRow label="Email">{buyerEmail}</InfoRow>}
            <InfoRow label="Phone Number">{buyerPhone || "N/A"}</InfoRow>
            <InfoRow label="Address">{apiOrder.delivery_address || "N/A"}</InfoRow>
          </dl>
          <div className="mt-4 flex flex-col gap-3">
            {contactHref ? (
              <a
                href={contactHref}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary bg-white px-4 text-sm font-medium text-primary transition-colors hover:bg-primary-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Message Customer
              </a>
            ) : (
              // Wrapper carries the tooltip: disabled buttons don't receive hover events.
              <span title="No email or phone number available for this buyer">
                <Button
                  variant="outline"
                  className="h-10 w-full py-0 text-sm"
                  disabled
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Message Customer
                </Button>
              </span>
            )}
            <Link
              to="/support"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2"
            >
              <Headphones className="h-4 w-4" aria-hidden="true" />
              Contact Support
            </Link>
            {hasIssue && (
              <Link
                to="/support"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                Resolve Issue
              </Link>
            )}
          </div>
        </div>

        <div className={cardClass}>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Order Summary
          </h3>
          <dl className="space-y-3">
            <InfoRow label="Product:">{productName}</InfoRow>
            <InfoRow label="Quantity:">{qty}</InfoRow>
            <InfoRow label="Unit Price:">{unitPrice}</InfoRow>
            <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 text-sm font-semibold text-gray-900">
              <dt>Total:</dt>
              <dd>{totalPrice}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default SingleOrderPage;

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronRight, Package, PackageSearch } from "lucide-react";
import { toast } from "react-toastify";
import {
  useConfirmConsumerOrderDelivery,
  useReportConsumerOrderIssue,
} from "@/components/mutations/consumer/order";
import { useConsumerOrders } from "@/components/queries/consumer/order";
import { Skeleton } from "@/components/shared";
import { MOCK_ORDERS, ORDER_STATUS } from "./mock";
import { extractConsumerOrders, mapApiOrder } from "./adapter";
import { DetailsModal, ReportModal } from "./modals";
import OrderFilter from "./Filter";

const ConsumerOrder = () => {
  const [showReport, setShowReport] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  // ?order=<public id> (e.g. from a notification) opens that order's details
  const [searchParams, setSearchParams] = useSearchParams();
  const linkedOrder = searchParams.get("order");
  useEffect(() => {
    if (!linkedOrder) return;
    setSelectedOrder(linkedOrder);
    setSearchParams(
      (params) => {
        params.delete("order");
        return params;
      },
      { replace: true }
    );
  }, [linkedOrder, setSearchParams]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  // Status changes confirmed by the API, keyed by order id
  const [statusOverrides, setStatusOverrides] = useState({});

  const confirmDelivery = useConfirmConsumerOrderDelivery();
  const reportIssue = useReportConsumerOrderIssue();

  const { data, isLoading, isError } = useConsumerOrders();
  // Fall back to the bundled sample orders when the API can't be reached
  const usingSampleData = isError;
  const sourceOrders = usingSampleData
    ? MOCK_ORDERS
    : extractConsumerOrders(data).map(mapApiOrder);

  const orders = sourceOrders.map((order) =>
    statusOverrides[order.id] ? { ...order, status: statusOverrides[order.id] } : order
  );
  const activeOrder = selectedOrder
    ? orders.find((order) => order.id === selectedOrder) ?? null
    : null;

  const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message ||
    (typeof error?.response?.data?.detail === "string" ? error.response.data.detail : null) ||
    fallback;

  const handleMarkDelivered = (order) => {
    if (confirmDelivery.isPending) return;
    confirmDelivery.mutate(order.id, {
      onSuccess: (res) => {
        setStatusOverrides((prev) => ({ ...prev, [order.id]: ORDER_STATUS.DELIVERED }));
        toast.success(res?.message || "Thanks! Order marked as delivered.");
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(error, "Couldn't confirm delivery. Please try again.")
        );
      },
    });
  };

  const handleReport = (description) => {
    if (!activeOrder || reportIssue.isPending) return;
    const orderId = activeOrder.id;
    reportIssue.mutate(
      { order_id: orderId, payload: { description } },
      {
        onSuccess: (res) => {
          setStatusOverrides((prev) => ({ ...prev, [orderId]: ORDER_STATUS.ISSUE }));
          setShowReport(false);
          toast.success(res?.message || "Your report has been submitted.");
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Couldn't submit your report. Please try again."));
        },
      }
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(order.id).includes(searchQuery);

    const matchesStatus =
      statusFilter === "All" || order.status.label === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Orders</h1>
        <p className="text-sm text-gray-600">
          Track orders status, confirm deliveries, or raise an issue
        </p>
      </div>

      <OrderFilter
        onSearch={(query) => setSearchQuery(query)}
        onFilter={(status) => setStatusFilter(status)}
      />

      {usingSampleData && (
        <p className="rounded-lg bg-secondary-light px-4 py-2 text-sm text-secondary-dark">
          We couldn&apos;t load your orders right now, so you&apos;re seeing sample orders.
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          <PackageSearch size={32} aria-hidden="true" />
          <p>
            {orders.length === 0
              ? "You haven't placed any orders yet."
              : "No orders match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
          {filteredOrders.map((order) => (
            <article
              key={order.id}
              className="flex min-w-0 flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 p-1.5 sm:h-20 sm:w-20">
                  {order.productImage ? (
                    <img loading="lazy" decoding="async"
                      src={order.productImage}
                      alt={order.product}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Package className="h-full w-full p-2 text-gray-400" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 space-y-1 text-sm text-grey-300">
                  <p className="truncate font-semibold text-gray-900">{order.product}</p>
                  <p className="break-words">
                    Order #{order.id} - {order.farmer}
                  </p>
                  <span
                    style={{
                      color: order.status.textColor,
                      backgroundColor: order.status.bgColor,
                    }}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  >
                    <order.status.icon size={14} aria-hidden="true" />
                    {order.status.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-3 text-sm sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                <p className="whitespace-nowrap text-gray-500">Updated {order.updatedAt}</p>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(order.id)}
                  className="inline-flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary-dark"
                >
                  View
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {activeOrder && (
        <DetailsModal
          order={activeOrder}
          onClose={() => setSelectedOrder(null)}
          onReport={() => setShowReport(true)}
          onMarkDelivered={() => handleMarkDelivered(activeOrder)}
          isMarkingDelivered={confirmDelivery.isPending}
        />
      )}
      {showReport && activeOrder && (
        <ReportModal
          onClose={() => setShowReport(false)}
          onSubmit={handleReport}
          isSubmitting={reportIssue.isPending}
        />
      )}
    </div>
  );
};

export default ConsumerOrder;

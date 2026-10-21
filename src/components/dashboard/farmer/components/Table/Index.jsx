import { useMemo } from "react";
import { Link } from "react-router-dom";
import Data from "./Data";
import LoadingSkeleton from "./LoadingSkeleton";
import { useFarmerOrder } from "../../../../../hooks/useFarmerOrder";
import {
  extractOrders,
  formatNaira,
  getOrderDate,
  getOrderId,
  getOrderImage,
  getOrderProductName,
  getOrderQuantity,
  getSingleOrderPath,
  normalizeOrderStatus,
} from "../../../../../lib/farmerOrder";

const MAX_ROWS = 5;

const PendingOrders = () => {
  const { data, isLoading, isError, refetch } = useFarmerOrder();

  const pendingOrders = useMemo(
    () =>
      extractOrders(data)
        .filter((order) => normalizeOrderStatus(order?.status) === "pending")
        // newest first
        .sort(
          (a, b) =>
            (getOrderDate(b)?.getTime() ?? 0) - (getOrderDate(a)?.getTime() ?? 0)
        )
        .map((order, index) => ({
          id: getOrderId(order) || `pending-${index}`,
          image: getOrderImage(order),
          product: getOrderProductName(order),
          quantity: getOrderQuantity(order),
          price: formatNaira(order?.total_price),
          location: order?.delivery_address || "N/A",
          path: getSingleOrderPath(order),
          originalData: order,
        })),
    [data]
  );

  const visibleOrders = pendingOrders.slice(0, MAX_ROWS);

  const renderBody = () => {
    if (isLoading) {
      return [...Array(4)].map((_, index) => <LoadingSkeleton key={index} />);
    }

    if (isError) {
      return (
        <tr>
          <td colSpan={5} className="px-4 py-8 text-center text-red-600">
            <p>Couldn&apos;t load pending orders.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-1 font-medium text-primary underline"
            >
              Try again
            </button>
          </td>
        </tr>
      );
    }

    if (visibleOrders.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
            No pending orders
          </td>
        </tr>
      );
    }

    return visibleOrders.map((order) => (
      <tr
        key={order.id}
        className="whitespace-nowrap *:px-4 *:py-3 hover:bg-gray-50 sm:*:px-6"
      >
        <Data order={order} />
      </tr>
    ));
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm text-gray-700">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500 *:px-4 *:py-3 sm:*:px-6">
              <th scope="col">Product Name</th>
              <th scope="col">Quantity</th>
              <th scope="col">Price</th>
              <th scope="col">Delivery Address</th>
              <th scope="col">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {renderBody()}
          </tbody>
        </table>
      </div>

      {!isLoading && !isError && pendingOrders.length > MAX_ROWS && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 text-right sm:px-6">
          <Link
            to="/farmer-orders"
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            View all {pendingOrders.length} pending orders
          </Link>
        </div>
      )}
    </div>
  );
};

export default PendingOrders;

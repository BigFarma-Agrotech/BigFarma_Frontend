import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Data from "./Data";
import LoadingSkeleton from "./LoadingSkeleton";
import { useConsumerOrders } from "@/components/queries/consumer/order";
import { extractOrders, formatOrderDate, getOrderNumber } from "@/lib/farmerOrder";

const MAX_ROWS = 5;

const RecentOrders = () => {
  const { data, isLoading, isError, refetch } = useConsumerOrders();
  const [selectedOrders, setSelectedOrders] = useState([]);

  // The API returns newest first
  const orders = useMemo(
    () =>
      extractOrders(data).map((order) => ({
        id: String(order.id),
        orderNumber: getOrderNumber(order),
        farmName: order.farm_name || order.farmer_name || "Unknown Farm",
        date: formatOrderDate(order),
        status: order.status,
      })),
    [data]
  );
  const visibleOrders = orders.slice(0, MAX_ROWS);

  const toggleSingle = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const renderBody = () => {
    if (isLoading) {
      return [...Array(4)].map((_, index) => <LoadingSkeleton key={index} />);
    }

    if (isError) {
      return (
        <tr>
          <td colSpan={4} className="px-4 py-8 text-center text-red-600">
            <p>Couldn&apos;t load your orders.</p>
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
          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
            No recent orders
          </td>
        </tr>
      );
    }

    return visibleOrders.map((order) => (
      <tr key={order.id} className="*:px-4 *:py-3 hover:bg-gray-50">
        <Data
          props={order}
          isChecked={selectedOrders.includes(order.id)}
          onToggle={() => toggleSingle(order.id)}
        />
      </tr>
    ));
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="*:px-4 *:py-3 *:font-medium">
              <th scope="col">Order ID</th>
              <th scope="col">Farm Name</th>
              <th scope="col">Date</th>
              <th scope="col">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white text-gray-700">
            {renderBody()}
          </tbody>
        </table>
      </div>

      {!isLoading && !isError && orders.length > MAX_ROWS && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 text-right">
          <Link
            to="/orders"
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            View all {orders.length} orders
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;

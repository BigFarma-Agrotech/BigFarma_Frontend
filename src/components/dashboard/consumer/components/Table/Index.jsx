import { useEffect, useState } from "react";
import Data from "./Data";
import LoadingSkeleton from "./LoadingSkeleton";

const orders = [
  { id: "10001", farmName: "Bisi Farm", date: "04-02-2025", status: "delivered" },
  { id: "10002", farmName: "Olu Farm", date: "05-02-2025", status: "pending" },
  { id: "10003", farmName: "Tola Farm", date: "06-02-2025", status: "delivered" },
  { id: "10004", farmName: "Yemi Farm", date: "07-02-2025", status: "cancelled" },
  { id: "10005", farmName: "Kemi Farm", date: "08-02-2025", status: "shipping" },
];

const RecentOrders = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const toggleSingle = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
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
          {isLoading ? (
            [...Array(4)].map((_, index) => <LoadingSkeleton key={index} />)
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                No recent orders
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className="*:px-4 *:py-3 hover:bg-gray-50">
                <Data
                  props={order}
                  isChecked={selectedOrders.includes(order.id)}
                  onToggle={() => toggleSingle(order.id)}
                />
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrders;

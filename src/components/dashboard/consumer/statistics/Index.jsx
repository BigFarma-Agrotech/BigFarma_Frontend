import { useEffect, useState } from "react";
import CardSkeleton from "./CardSkeleton";
import StatCard from "./StatCard";
import { useConsumerOrderStats } from "@/components/queries/consumer/order";

// Investments and ROI have no backend endpoint yet, so these stay mock
const MOCK_CARDS = {
  investments: { title: "Total Investments", total: 1200000, percentage: 5 },
  roi: { title: "ROI", total: 10000, percentage: 10 },
};

const Statistics = () => {
  const [mockLoading, setMockLoading] = useState(true);
  const statsQuery = useConsumerOrderStats();
  const stats = statsQuery.data ?? {};

  useEffect(() => {
    const timer = setTimeout(() => {
      setMockLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const totalOrders = Number(stats.total_orders) || 0;
  // Anything not yet delivered or cancelled is still in progress
  const activeOrders = Math.max(
    totalOrders -
      (Number(stats.delivered_orders) || 0) -
      (Number(stats.cancelled_orders) || 0),
    0
  );
  const totalSpent = Number(stats.total_spent) || 0;

  const orderCard = {
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    refetch: statsQuery.refetch,
  };

  const cards = [
    { ...MOCK_CARDS.investments, isLoading: mockLoading },
    {
      ...orderCard,
      title: "Current Orders",
      total: activeOrders,
      format: "active",
      caption: `${Number(stats.pending_orders) || 0} pending`,
    },
    {
      ...orderCard,
      title: "Total Orders",
      total: totalOrders,
      format: "number",
      caption: totalOrders ? `₦${totalSpent.toLocaleString()} spent` : "No orders yet",
    },
    { ...MOCK_CARDS.roi, isLoading: mockLoading },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
      {cards.map(({ isLoading, ...card }) =>
        isLoading ? <CardSkeleton key={card.title} /> : <StatCard key={card.title} {...card} />
      )}
    </div>
  );
};

export default Statistics;

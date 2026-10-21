import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import CardSkeleton from "./CardSkeleton";
import StatCard from "./StatCard";
import { useFarmerOrder } from "../../../../hooks/useFarmerOrder";
import { useFarmerProducts } from "../../../../hooks/useFarmerProducts";
import { walletDashboardQuery } from "../../../../lib/walletApi";
import {
  extractOrders,
  extractProducts,
  getOrdersRevenue,
  normalizeOrderStatus,
  parseAmount,
} from "../../../../lib/farmerOrder";

const Statistics = () => {
  const ordersQuery = useFarmerOrder();
  const productsQuery = useFarmerProducts();
  const walletQuery = useQuery(walletDashboardQuery);

  const orders = useMemo(() => extractOrders(ordersQuery.data), [ordersQuery.data]);
  const products = useMemo(
    () => extractProducts(productsQuery.data),
    [productsQuery.data]
  );

  // Prefer the wallet's total_earnings; fall back to summing non-cancelled orders.
  const walletEarnings = parseAmount(walletQuery.data?.total_earnings);
  const earnings = walletEarnings ?? getOrdersRevenue(orders);
  const totalWithdrawals = parseAmount(walletQuery.data?.total_withdrawals);

  const pendingCount = orders.filter(
    (o) => normalizeOrderStatus(o?.status) === "pending"
  ).length;

  let earningsCaption = "No earnings yet";
  if (walletEarnings != null && totalWithdrawals != null) {
    earningsCaption = `₦${totalWithdrawals.toLocaleString()} withdrawn`;
  } else if (walletEarnings == null && earnings > 0) {
    earningsCaption = "Estimated from your orders";
  }

  const cards = [
    {
      title: "Total Earnings",
      value: earnings,
      format: "currency",
      // Wait for the wallet; if it has no figure, wait for the orders fallback.
      isLoading:
        walletQuery.isLoading || (walletEarnings == null && ordersQuery.isLoading),
      isError: walletEarnings == null && ordersQuery.isError,
      refetch: () => {
        walletQuery.refetch();
        ordersQuery.refetch();
      },
      caption: earningsCaption,
    },
    {
      title: "Total Orders",
      value: orders.length,
      format: "number",
      isLoading: ordersQuery.isLoading,
      isError: ordersQuery.isError,
      refetch: ordersQuery.refetch,
      caption: orders.length ? `${pendingCount} pending` : "No orders yet",
    },
    {
      title: "Products Listed",
      value: products.length,
      format: "number",
      isLoading: productsQuery.isLoading,
      isError: productsQuery.isError,
      refetch: productsQuery.refetch,
      caption: products.length ? undefined : "No products yet",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
      {cards.map((card) =>
        card.isLoading ? (
          <CardSkeleton key={card.title} />
        ) : (
          <StatCard key={card.title} {...card} />
        )
      )}
    </div>
  );
};

export default Statistics;

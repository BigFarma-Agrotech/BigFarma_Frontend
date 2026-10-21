import { useMemo } from "react";
import { BarChart3, PieChart } from "lucide-react";
import Line from "./LineChart";
import Doughnut from "./Doughnut";
import { Skeleton } from "../../../shared";
import { useFarmerOrder } from "../../../../hooks/useFarmerOrder";
import {
  extractOrders,
  getOrdersByStatus,
  getRevenueByMonth,
} from "../../../../lib/farmerOrder";

const MONTHS = 6;

const PeriodBadge = ({ children }) => (
  <span className="inline-flex shrink-0 items-center rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-neutral">
    {children}
  </span>
);

const ChartState = ({ icon: Icon, title, message, onRetry, className = "h-64 sm:h-72" }) => (
  <div
    className={`flex w-full flex-col items-center justify-center gap-2 text-center ${className}`}
  >
    {Icon && <Icon className="h-10 w-10 text-gray-300" aria-hidden="true" />}
    <p className="text-sm font-medium text-gray-900">{title}</p>
    {message && <p className="max-w-xs text-sm text-gray-500">{message}</p>}
    {onRetry && (
      <button
        type="button"
        onClick={() => onRetry()}
        className="text-sm font-medium text-primary underline"
      >
        Try again
      </button>
    )}
  </div>
);

const Charts = () => {
  const { data, isLoading, isError, refetch } = useFarmerOrder();
  const orders = useMemo(() => extractOrders(data), [data]);

  const revenue = useMemo(() => getRevenueByMonth(orders, MONTHS), [orders]);
  const hasRevenue = revenue.some((b) => b.total > 0);
  const statusSegments = useMemo(() => getOrdersByStatus(orders), [orders]);

  const renderRevenue = () => {
    if (isLoading) return <Skeleton className="h-64 w-full rounded-lg sm:h-72" />;
    if (isError) {
      return (
        <ChartState
          icon={BarChart3}
          title="Couldn't load revenue"
          onRetry={refetch}
        />
      );
    }
    if (!hasRevenue) {
      return (
        <ChartState
          icon={BarChart3}
          title="No revenue yet"
          message={`Revenue from your orders in the last ${MONTHS} months will appear here.`}
        />
      );
    }
    return (
      <Line
        labels={revenue.map((b) => b.label)}
        values={revenue.map((b) => b.total)}
      />
    );
  };

  const renderStatus = () => {
    if (isLoading) return <Skeleton className="h-64 w-64 max-w-full rounded-full" />;
    if (isError) {
      return (
        <ChartState
          icon={PieChart}
          title="Couldn't load orders"
          onRetry={refetch}
        />
      );
    }
    if (!statusSegments.length) {
      return (
        <ChartState
          icon={PieChart}
          title="No orders yet"
          message="A breakdown of your orders by status will appear here."
        />
      );
    }
    return <Doughnut segments={statusSegments} />;
  };

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
      <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Revenue Generated
          </h2>
          <PeriodBadge>Last {MONTHS} months</PeriodBadge>
        </div>

        <div className="mt-5">{renderRevenue()}</div>
      </div>

      <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Orders by Status
          </h2>
          <PeriodBadge>All time</PeriodBadge>
        </div>

        <div className="mt-5 flex items-center justify-center">
          {renderStatus()}
        </div>
      </div>
    </section>
  );
};

export default Charts;

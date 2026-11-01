import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronDown, ShoppingBag } from "lucide-react";
import { useFarmerOrder } from "../hooks/useFarmerOrder";
import OrderStatusPill from "../components/dashboard/farmer/components/OrderStatusPill";
import Button from "@/components/shared/Button";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUSES,
  extractOrders,
  formatNaira,
  formatOrderDate,
  getOrderBuyerName,
  getOrderDate,
  getOrderId,
  getOrderImage,
  getOrderNumber,
  getOrderProductName,
  getOrderQuantity,
  getOrderTotal,
  getSingleOrderPath,
  normalizeOrderStatus,
} from "../lib/farmerOrder";
import watermelon from "../assets/ProductImages/watermelon.png";

const PAGE_SIZE = 8;

const DONE_STATUSES = ["delivered", "cancelled"];

// Filters by order status. Anything not delivered or cancelled (including a
// delivery issue under review) counts as in progress.
const filterOptions = [
  { label: "All", value: "all" },
  {
    label: "In Progress",
    value: "in_progress",
    statuses: ORDER_STATUSES.map((s) => s.value).filter((s) => !DONE_STATUSES.includes(s)),
  },
  { label: "Delivered", value: "delivered", statuses: ["delivered"] },
  { label: "Cancelled", value: "cancelled", statuses: ["cancelled"] },
];

const statusOrder = ORDER_STATUSES.map((s) => s.value);

// Sort accessors for the sortable columns (the ones with an arrow in the header)
const sorters = {
  quantity: (o) => Number.parseFloat(o.quantity) || 0,
  total: (o) => o.total ?? 0,
  date: (o) => o.date?.getTime() ?? 0,
  status: (o) => statusOrder.indexOf(o.status),
};

const columns = [
  { key: "name", label: "Product Name", align: "left" },
  { key: "id", label: "Order I.D" },
  { key: "buyer", label: "Buyer", align: "left" },
  { key: "quantity", label: "Quantity", sortable: true },
  { key: "total", label: "Total", sortable: true },
  { key: "date", label: "Date", sortable: true },
  { key: "status", label: "Status", sortable: true, align: "left" },
  { key: "action", label: "Action", align: "left" },
];

/** [1, 2, 3, "…", 8, 9, 10] style page list, like the design's pagination. */
const getPageNumbers = (page, pageCount) => {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set([1, 2, 3, pageCount - 2, pageCount - 1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["…", p] : [p]));
};

const FarmerOrderPage = () => {
  // Every order is its own row, newest first
  const { data: apiOrders, isLoading, error, refetch } = useFarmerOrder();

  const [filter, setFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sort, setSort] = useState(null); // { key, direction: "asc" | "desc" }
  const [page, setPage] = useState(1);

  const orders = useMemo(
    () =>
      extractOrders(apiOrders)
        .map((order, index) => ({
          key: getOrderId(order) || `order-${index}`,
          raw: order,
          number: getOrderNumber(order),
          productName: getOrderProductName(order),
          image: getOrderImage(order) || watermelon,
          buyer: getOrderBuyerName(order),
          quantity: getOrderQuantity(order),
          total: getOrderTotal(order),
          date: getOrderDate(order),
          status: normalizeOrderStatus(order?.status),
        }))
        .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)),
    [apiOrders]
  );

  const totalOrders = orders.length;

  const visibleOrders = useMemo(() => {
    const option = filterOptions.find((o) => o.value === filter);
    const filtered = option?.statuses
      ? orders.filter((o) => option.statuses.includes(o.status))
      : orders;
    if (!sort) return filtered;
    const value = sorters[sort.key];
    const direction = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => (value(a) - value(b)) * direction);
  }, [orders, filter, sort]);

  const pageCount = Math.max(1, Math.ceil(visibleOrders.length / PAGE_SIZE));
  const pageRows = visibleOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Back to the first page whenever the rows change shape
  useEffect(() => setPage(1), [filter, sort]);
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const toggleSort = (key) =>
    setSort((current) =>
      current?.key === key
        ? { key, direction: current.direction === "desc" ? "asc" : "desc" }
        : { key, direction: "desc" }
    );

  const currentFilterLabel = filterOptions.find((o) => o.value === filter)?.label;

  const renderCell = (order, key) => {
    switch (key) {
      case "name":
        return (
          <div className="flex items-center gap-3">
            <img loading="lazy" decoding="async"
              src={order.image}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)]"
              onError={(e) => {
                e.currentTarget.src = watermelon;
              }}
            />
            <span className="whitespace-normal font-medium text-[#101828]">{order.productName}</span>
          </div>
        );
      case "id":
        return order.number.startsWith("#") ? order.number : `#${order.number}`;
      case "buyer":
        return <span className="whitespace-normal">{order.buyer}</span>;
      case "quantity":
        return order.quantity;
      case "total":
        return order.total != null ? formatNaira(order.total) : "—";
      case "date":
        return formatOrderDate(order.raw);
      case "status":
        return <OrderStatusPill status={order.status} className="max-w-[180px]" />;
      case "action":
        return (
          <Link
            to={getSingleOrderPath(order.raw)}
            state={{ order: order.raw }}
            className="inline-flex rounded-2xl bg-[#acd7f8] px-2 py-0.5 font-semibold leading-[18px] text-[#175cd3] transition-colors hover:bg-[#92c8f3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#175cd3]"
          >
            Manage
          </Link>
        );
      default:
        return null;
    }
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center gap-3 py-12 text-sm text-gray-600">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span>Loading orders...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 text-center">
          <p className="mb-4 text-sm text-red-600">
            <strong>Error loading orders:</strong>{" "}
            {error.response?.data?.detail || error.message}
          </p>
          <Button onClick={() => refetch()} className="h-10 py-0">
            Try Again
          </Button>
        </div>
      );
    }

    if (visibleOrders.length === 0) {
      const hasNoOrders = orders.length === 0;
      return (
        <div className="flex flex-col items-center px-4 py-12 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <ShoppingBag className="h-10 w-10 text-gray-400" aria-hidden="true" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {hasNoOrders ? "No Orders Yet" : "No Orders Match Filter"}
          </h3>
          <p className="mb-4 max-w-md text-sm text-gray-600">
            {hasNoOrders
              ? "Orders will appear here once a buyer places an order for one of your products."
              : "Try changing the filter to see more orders."}
          </p>
          {hasNoOrders && (
            <Link
              to="/my-products"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-base font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Go to My Products
            </Link>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="@container overflow-x-auto px-0 pt-6 lg:px-6">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr>
                {columns.map((column) => {
                  const isSorted = sort?.key === column.key;
                  const SortIcon = isSorted && sort.direction === "asc" ? ArrowUp : ArrowDown;
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={
                        isSorted ? (sort.direction === "asc" ? "ascending" : "descending") : undefined
                      }
                      className={cn(
                        "whitespace-nowrap border-b border-[#eaecf0] px-3 py-3 text-base font-bold @5xl:px-6 @5xl:text-lg text-[#374151]",
                        column.align === "left" ? "text-left" : "text-center"
                      )}
                    >
                      {column.sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(column.key)}
                          className="inline-flex items-center gap-1 focus:outline-none focus-visible:underline"
                        >
                          {column.label}
                          <SortIcon
                            className={cn("h-4 w-4 shrink-0", isSorted ? "text-[#374151]" : "text-[#667085]")}
                            aria-hidden="true"
                          />
                        </button>
                      ) : (
                        column.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((order) => (
                <tr key={order.key} className="h-[72px] hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "whitespace-nowrap border-b border-[#eaecf0] px-3 py-4 text-base font-medium @5xl:px-6 text-[#374151]",
                        column.align === "left" ? "text-left" : "text-center"
                      )}
                    >
                      {renderCell(order, column.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <nav
          aria-label="Pagination"
          className="flex items-center justify-between gap-2 px-4 pb-4 pt-3 sm:px-6"
        >
          <button
            type="button"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="inline-flex items-center gap-2 rounded-lg border border-[#d0d5dd] bg-white px-3.5 py-2 text-sm font-bold text-[#344054] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <ol className="flex items-center gap-0.5">
            {getPageNumbers(page, pageCount).map((p, i) =>
              p === "…" ? (
                <li key={`gap-${i}`} className="flex h-10 w-10 items-center justify-center text-sm font-bold text-[#667085]">
                  …
                </li>
              ) : (
                <li key={p}>
                  <button
                    type="button"
                    onClick={() => setPage(p)}
                    aria-current={p === page ? "page" : undefined}
                    className={cn(
                      "h-10 w-10 rounded-lg text-sm font-bold",
                      p === page
                        ? "bg-[#e6efea] text-[#01582c]"
                        : "text-[#667085] hover:bg-gray-50"
                    )}
                  >
                    {p}
                  </button>
                </li>
              )
            )}
          </ol>

          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === pageCount}
            className="inline-flex items-center gap-2 rounded-lg border border-[#d0d5dd] bg-white px-3.5 py-2 text-sm font-bold text-[#344054] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="hidden sm:inline">Next</span>
            <ArrowRight className="h-5 w-5 text-primary" aria-hidden="true" />
          </button>
        </nav>
      </>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#111827]">Orders</h1>
          <span className="rounded-2xl bg-[#e6efea] px-2 py-0.5 text-xs font-bold leading-[18px] text-[#014522]">
            {totalOrders}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span id="orders-filter-label" className="text-sm text-neutral">
            Filter:
          </span>
          <div className="relative w-full sm:w-[329px]">
            <button
              type="button"
              onClick={() => setIsFilterOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={isFilterOpen}
              aria-labelledby="orders-filter-label"
              className="flex w-full items-center justify-between rounded-lg border border-[#e6e6e6] bg-white p-3.5 text-base font-medium tracking-[0.16px] text-grey-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
            >
              {currentFilterLabel}
              <ChevronDown
                className={cn("h-5 w-5 transition-transform", isFilterOpen && "rotate-180")}
                aria-hidden="true"
              />
            </button>

            {isFilterOpen && (
              <ul
                role="listbox"
                aria-labelledby="orders-filter-label"
                className="absolute right-0 z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
              >
                {filterOptions.map((option) => (
                  <li key={option.value} role="option" aria-selected={filter === option.value}>
                    <button
                      type="button"
                      onClick={() => {
                        setFilter(option.value);
                        setIsFilterOpen(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm",
                        filter === option.value
                          ? "bg-primary-subtle text-primary"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white">{renderBody()}</div>
    </div>
  );
};

export default FarmerOrderPage;

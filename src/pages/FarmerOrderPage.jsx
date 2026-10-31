import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronDown, ShoppingBag } from "lucide-react";
import { useFarmerProducts } from "../hooks/useFarmerProducts";
import Button from "@/components/shared/Button";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUSES,
  PRODUCT_STATUSES,
  extractProducts,
  formatNaira,
  getProductImage,
  getProductStatus,
  parseAmount,
  toProductRouteId,
} from "../lib/farmerOrder";
import watermelon from "../assets/ProductImages/watermelon.png";

const PAGE_SIZE = 8;

const DONE_STATUSES = ["delivered", "cancelled"];

// Filters by order status: a product shows when it has at least one order in
// one of the option's statuses. Anything not delivered or cancelled (including
// a delivery issue under review) counts as in progress.
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

const statusOrder = PRODUCT_STATUSES.map((s) => s.value);

// Sort accessors for the sortable columns (the ones with an arrow in the header)
const sorters = {
  id: (p) => p.id,
  price: (p) => p.price,
  quantity: (p) => parseAmount(p.quantity) ?? 0,
  orders: (p) => p.orders,
  status: (p) => statusOrder.indexOf(p.status.value),
};

const columns = [
  { key: "name", label: "Product Name", align: "left" },
  { key: "id", label: "Product I.D", sortable: true },
  { key: "price", label: "Price", sortable: true },
  { key: "quantity", label: "Quantity", sortable: true },
  { key: "orders", label: "Orders", sortable: true },
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

const ProductStatusBadge = ({ status }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-2xl py-0.5 pl-1.5 pr-2 text-xs font-bold leading-[18px]",
      status.badge
    )}
  >
    <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} aria-hidden="true" />
    {status.label}
  </span>
);

const FarmerOrderPage = () => {
  const { data: apiProducts, isLoading, error, refetch } = useFarmerProducts();

  const [filter, setFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sort, setSort] = useState(null); // { key, direction: "asc" | "desc" }
  const [page, setPage] = useState(1);

  // Only products that have been ordered at least once belong on the orders page
  const products = useMemo(
    () =>
      extractProducts(apiProducts)
        .filter((product) => (product.order_count ?? 0) > 0)
        .map((product) => ({
        id: product.id,
        publicId: product.public_id,
        name: product.name || "Unnamed product",
        image: getProductImage(product) || watermelon,
        price: parseAmount(product.price) ?? 0,
        quantity: product.quantity ?? "—",
        orders: product.order_count ?? 0,
        // { pending: 2, delivered: 1, ... } from the backend
        orderStatusCounts: product.order_status_counts ?? {},
        status: getProductStatus(product),
      })),
    [apiProducts]
  );

  const totalOrders = products.reduce((sum, p) => sum + p.orders, 0);

  const visibleProducts = useMemo(() => {
    // When filtered, the Orders column counts only the orders in that status
    const filtered =
      filter === "all"
        ? products
        : products
            .map((p) => {
              const { statuses } = filterOptions.find((o) => o.value === filter);
              const orders = statuses.reduce((sum, s) => sum + (p.orderStatusCounts[s] ?? 0), 0);
              return { ...p, orders };
            })
            .filter((p) => p.orders > 0);
    if (!sort) return filtered;
    const value = sorters[sort.key];
    const direction = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => (value(a) - value(b)) * direction);
  }, [products, filter, sort]);

  const pageCount = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE));
  const pageRows = visibleProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  const renderCell = (product, key) => {
    switch (key) {
      case "name":
        return (
          <div className="flex items-center gap-3">
            <img
              src={product.image}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)]"
              onError={(e) => {
                e.currentTarget.src = watermelon;
              }}
            />
            <span className="whitespace-normal font-medium text-[#101828]">{product.name}</span>
          </div>
        );
      case "id":
        return `#${product.publicId}`;
      case "price":
        return formatNaira(product.price);
      case "quantity":
        return product.quantity;
      case "orders":
        return product.orders;
      case "status":
        return <ProductStatusBadge status={product.status} />;
      case "action":
        return (
          <Link
            to={`/farmer-orders/${toProductRouteId(product.publicId)}`}
            className="inline-flex rounded-2xl bg-[#acd7f8] px-2 py-0.5 font-semibold leading-[18px] text-[#175cd3] transition-colors hover:bg-[#92c8f3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#175cd3]"
          >
            View
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

    if (visibleProducts.length === 0) {
      const hasNoProducts = products.length === 0;
      return (
        <div className="flex flex-col items-center px-4 py-12 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <ShoppingBag className="h-10 w-10 text-gray-400" aria-hidden="true" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {hasNoProducts ? "No Orders Yet" : "No Products Match Filter"}
          </h3>
          <p className="mb-4 max-w-md text-sm text-gray-600">
            {hasNoProducts
              ? "Orders are grouped by product. A product will appear here once a buyer places an order for it."
              : "Try changing the filter to see more products."}
          </p>
          {hasNoProducts && (
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
          <table className="w-full min-w-[880px]">
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
              {pageRows.map((product) => (
                <tr key={product.id} className="h-[72px] hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "whitespace-nowrap border-b border-[#eaecf0] px-3 py-4 text-base font-medium @5xl:px-6 text-[#374151]",
                        column.align === "left" ? "text-left" : "text-center"
                      )}
                    >
                      {renderCell(product, column.key)}
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

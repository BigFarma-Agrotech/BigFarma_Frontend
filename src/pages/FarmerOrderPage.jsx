import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ShoppingBag } from "lucide-react";
import DataTablePage from "../components/dashboard/farmer/components/farmer-table/dataTable";
import { useFarmerOrder } from "../hooks/useFarmerOrder";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUSES,
  extractOrders,
  formatNaira,
  getOrderStatusColor,
  getOrderStatusLabel,
  normalizeOrderStatus,
  getOrderImage,
  getOrderProductName,
  getOrderQuantity,
  getProductOrdersPath,
} from "../lib/farmerOrder";

// Fallback images
import eggs from "../assets/ProductImages/categories/Egg image.png";
import onions from "../assets/ProductImages/onions.png";
import watermelon from "../assets/ProductImages/watermelon.png";
import carrot from "../assets/ProductImages/categories/Carrot image.png";
import rice from "../assets/ProductImages/Rice.png";
import tomatoes from "../assets/ProductImages/tomatoes.png";
import vegetable from "../assets/ProductImages/categories/vegetables.png";
import cassava from "../assets/ProductImages/cassava.png";
import filterIcon from "../assets/icons/filter.svg";

const productImages = {
  Eggs: eggs,
  Onions: onions,
  Watermelon: watermelon,
  Carrot: carrot,
  Rice: rice,
  Tomatoes: tomatoes,
  Vegetable: vegetable,
  Cassava: cassava,
};

const orderFilterOptions = [
  { label: "All", value: "all" },
  ...ORDER_STATUSES.map(({ value, label }) => ({ value, label })),
];

const FarmerOrderPage = () => {
  const { data: apiOrders, isLoading, error, refetch } = useFarmerOrder();

  const [filter, setFilter] = useState("all");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const transformedOrders = useMemo(() => {
    return extractOrders(apiOrders).map((order, index) => {
      const productName = getOrderProductName(order);
      const productImage =
        getOrderImage(order) || productImages[productName] || watermelon;

      return {
        id: order.id?.toString() || `order-${index}`,
        productOrdersPath: getProductOrdersPath(order),
        images: productImage,
        product: productName,
        productID: order.order_number || `#ORDER${order.id || index}`,
        price: formatNaira(order.total_price),
        quantity: String(getOrderQuantity(order)),
        orders: 1,
        status: normalizeOrderStatus(order.status),
        originalData: order,
      };
    });
  }, [apiOrders]);

  const filteredOrders = useMemo(() => {
    if (filter === "all") return transformedOrders;
    return transformedOrders.filter((order) => order.status === filter);
  }, [filter, transformedOrders]);

  const currentFilterLabel =
    orderFilterOptions.find((opt) => opt.value === filter)?.label || "Filter";

  const handleFilterSelect = (value) => {
    setFilter(value);
    setIsFilterDropdownOpen(false);
  };

  const orderColumns = [
    {
      key: "product",
      label: "Product",
      render: (order) => (
        <div className="flex items-center gap-3">
          <img
            src={order.images}
            alt={order.product}
            className="h-10 w-10 shrink-0 rounded-lg object-cover"
            onError={(e) => {
              e.target.src = watermelon;
            }}
          />
          <div>
            <span className="block text-sm font-medium text-gray-900">
              {order.product}
            </span>
            <span className="block text-xs text-gray-500">
              {order.originalData.farm_name || "Farm"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "productID",
      label: "Order Number",
      render: (order) => <span className="text-gray-500">{order.productID}</span>,
    },
    {
      key: "price",
      label: "Total Price",
      render: (order) => (
        <span className="font-medium text-gray-900">{order.price}</span>
      ),
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (order) => <span className="text-gray-500">{order.quantity}</span>,
    },
    {
      key: "orders",
      label: "Orders",
      render: (order) => <span className="text-gray-500">{order.orders}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (order) => (
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
            getOrderStatusColor(order.status)
          )}
        >
          {getOrderStatusLabel(order.status)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Action",
      render: (order) => (
        <Link
          to={order.productOrdersPath}
          state={{ order: order.originalData }}
          className="inline-flex rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200"
        >
          View
        </Link>
      ),
    },
  ];

  const hasNoOrders = transformedOrders.length === 0;

  const emptyOrdersState = (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <ShoppingBag className="h-10 w-10 text-gray-400" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">
        {hasNoOrders ? "No Orders Yet" : "No Orders Match Filter"}
      </h3>
      <p className="mb-4 max-w-md text-sm text-gray-600">
        {hasNoOrders
          ? "You don't have any orders at the moment. When customers place orders for your products, they will appear here."
          : "No orders match your current filter. Try changing the filter to see more orders."}
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            My Orders
          </h1>
          <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-medium text-primary">
            {filteredOrders.length}{" "}
            {filteredOrders.length === 1 ? "Order" : "Orders"}
          </span>
        </div>

        <div className="relative self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsFilterDropdownOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={isFilterDropdownOpen}
            className="flex h-10 min-w-[140px] items-center gap-2 rounded-lg border border-primary bg-white px-4 text-sm font-medium text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
          >
            <img src={filterIcon} alt="" className="h-4 w-4" />
            <span className="flex-1 text-left">{currentFilterLabel}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isFilterDropdownOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>

          {isFilterDropdownOpen && (
            <div className="absolute left-0 z-30 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg sm:left-auto sm:right-0">
              {orderFilterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleFilterSelect(option.value)}
                  className={cn(
                    "flex w-full items-center px-4 py-2 text-left text-sm",
                    filter === option.value
                      ? "bg-primary-subtle text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <DataTablePage
        title="orders"
        data={filteredOrders}
        isLoading={isLoading}
        error={error}
        refetch={refetch}
        columns={orderColumns}
        emptyState={emptyOrdersState}
        hideHeader
      />
    </div>
  );
};

export default FarmerOrderPage;

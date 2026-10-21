import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useFarmerOrder } from "../hooks/useFarmerOrder";
import { useFarmerProducts } from "../hooks/useFarmerProducts";
import { cn } from "@/lib/utils";
import {
  extractOrders,
  extractProducts,
  formatNaira,
  formatOrderDate,
  fromProductRouteId,
  getOrderBuyerName,
  getOrderId,
  getOrderImage,
  getOrderNumber,
  getOrderProductId,
  getOrderProductName,
  getOrderQuantity,
  getOrderStatusColor,
  getOrderStatusLabel,
  getProductImage,
  getSingleOrderPath,
  normalizeOrderStatus,
} from "../lib/farmerOrder";
import watermelon from "../assets/ProductImages/watermelon.png";

const productStatusClasses = {
  active: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-800",
};

const cardClass = "rounded-xl border border-gray-200 bg-white p-4 sm:p-6";

const BackToOrders = () => (
  <Link
    to="/farmer-orders"
    className="inline-flex h-10 items-center justify-center rounded-lg border border-primary bg-white px-4 text-base font-medium text-primary transition-colors hover:bg-primary-subtle"
  >
    Back to Orders
  </Link>
);

const StateCard = ({ children }) => (
  <div
    className={cn(cardClass, "flex flex-col items-center gap-4 py-12 text-center")}
  >
    {children}
  </div>
);

const ProductOrdersPage = () => {
  // Route param is "product-<id>" (built by getProductOrdersPath in lib/farmerOrder)
  const { productId: routeProductId } = useParams();
  const location = useLocation();
  const stateOrder = location.state?.order;
  const productId = fromProductRouteId(routeProductId);

  const { data: apiOrders, isLoading: ordersLoading, error } = useFarmerOrder();
  // Products only enrich the header (stock / price / status); the page still
  // works from order data alone if this request fails.
  const { data: apiProducts, isLoading: productsLoading } = useFarmerProducts();
  const isLoading = ordersLoading || productsLoading;

  const productOrders = useMemo(() => {
    let orders = extractOrders(apiOrders);
    if (productId) {
      orders = orders.filter(
        (order) => String(getOrderProductId(order)) === productId
      );
    } else {
      // Order without a product_id: we can only show the order we came from.
      orders = stateOrder ? [stateOrder] : [];
    }

    return orders.map((order, index) => ({
      id: getOrderId(order) || `order-${index}`,
      orderNumber: getOrderNumber(order),
      buyer: getOrderBuyerName(order),
      qty: getOrderQuantity(order),
      date: formatOrderDate(order),
      status: getOrderStatusLabel(order.status),
      statusColor: getOrderStatusColor(order.status),
      path: getSingleOrderPath(order),
      originalData: order,
    }));
  }, [apiOrders, productId, stateOrder]);

  // Prefer the farmer's product record, fall back to fields on the orders.
  const productDetails = useMemo(() => {
    const product = productId
      ? extractProducts(apiProducts).find((p) => String(p?.id) === productId)
      : null;
    const sampleOrder = productOrders[0]?.originalData || stateOrder;

    if (!product && !sampleOrder) return null;

    if (product) {
      const quantity = product.quantity ?? product.stock;
      return {
        name: product.name || getOrderProductName(sampleOrder),
        status: product.status || null,
        stock:
          quantity != null ? `${quantity} ${product.unit || ""}`.trim() : null,
        price: product.price != null ? formatNaira(product.price) : null,
        image: getProductImage(product) || getOrderImage(sampleOrder),
      };
    }

    return {
      name: getOrderProductName(sampleOrder),
      status: null,
      stock: null,
      price: null,
      image: getOrderImage(sampleOrder),
    };
  }, [apiProducts, productId, productOrders, stateOrder]);

  if (isLoading) {
    return (
      <StateCard>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-gray-600">Loading orders...</p>
      </StateCard>
    );
  }

  if (error) {
    return (
      <StateCard>
        <p className="text-sm text-red-500">
          Error loading orders: {error?.response?.data?.detail || error?.message}
        </p>
        <BackToOrders />
      </StateCard>
    );
  }

  if (!productDetails) {
    return (
      <StateCard>
        <p className="text-sm text-red-500">Product not found.</p>
        <BackToOrders />
      </StateCard>
    );
  }

  const pendingCount = productOrders.filter(
    (o) => normalizeOrderStatus(o.originalData?.status) === "pending"
  ).length;
  const deliveredCount = productOrders.filter(
    (o) => normalizeOrderStatus(o.originalData?.status) === "delivered"
  ).length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="min-w-0 space-y-6 lg:col-span-2">
        <div className={cardClass}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <img
                src={productDetails.image || watermelon}
                alt={productDetails.name}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = watermelon;
                }}
              />
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {productDetails.name}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  {productDetails.status && (
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                        productStatusClasses[
                          normalizeOrderStatus(productDetails.status)
                        ] || "bg-red-100 text-red-800"
                      )}
                    >
                      {String(productDetails.status).replace(/_/g, " ")}
                    </span>
                  )}
                  {productDetails.stock && (
                    <span className="text-sm text-gray-600">
                      {productDetails.stock} in stock
                    </span>
                  )}
                  {productDetails.stock && productDetails.price && (
                    <span className="text-sm text-gray-600" aria-hidden="true">
                      ·
                    </span>
                  )}
                  {productDetails.price && (
                    <span className="text-sm font-medium text-gray-900">
                      {productDetails.price}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Link
              to="/farmer-orders"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-primary bg-white px-4 text-base font-medium text-primary transition-colors hover:bg-primary-subtle sm:self-auto"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Orders for this product
          </h2>

          {productOrders.length > 0 ? (
            <ul className="space-y-3">
              {productOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      Order {order.orderNumber}
                    </span>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        order.statusColor
                      )}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
                      <span>Buyer: {order.buyer}</span>
                      <span>Qty: {order.qty}</span>
                      <span>{order.date}</span>
                    </div>

                    <Link
                      to={order.path}
                      state={{ order: order.originalData }}
                      className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                    >
                      Manage
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">
              No orders found for this product.
            </p>
          )}
        </div>
      </div>

      <div className="min-w-0 space-y-6">
        <div className={cardClass}>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Tips</h3>
          <ul className="list-disc space-y-3 pl-5 text-sm text-gray-600">
            <li>Update order status as soon as items leave your farm.</li>
            <li>Encourage buyers to confirm delivery quickly to avoid delays.</li>
            <li>Use the issue button if there is a delivery dispute.</li>
          </ul>
        </div>

        <div className={cardClass}>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Order Summary
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600">Total Orders:</dt>
              <dd className="font-medium text-gray-900">
                {productOrders.length}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600">Pending:</dt>
              <dd className="font-medium text-yellow-600">{pendingCount}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600">Delivered:</dt>
              <dd className="font-medium text-green-600">{deliveredCount}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ProductOrdersPage;

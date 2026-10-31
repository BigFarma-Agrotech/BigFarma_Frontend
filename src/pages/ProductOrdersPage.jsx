import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useFarmerOrder } from "../hooks/useFarmerOrder";
import { useFarmerProducts } from "../hooks/useFarmerProducts";
import OrderStatusPill from "../components/dashboard/farmer/components/OrderStatusPill";
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
  getOrderProductName,
  getOrderQuantity,
  getOrderTitle,
  getProductImage,
  getProductStatus,
  getSingleOrderPath,
} from "../lib/farmerOrder";
import watermelon from "../assets/ProductImages/watermelon.png";

const cardClass = "rounded-lg bg-white p-5";

const outlineButtonClass =
  "inline-flex shrink-0 items-center justify-center rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium leading-none text-primary transition-colors hover:bg-primary-subtle";

const BackToOrders = ({ children = "Back" }) => (
  <Link to="/farmer-orders" className={outlineButtonClass}>
    {children}
  </Link>
);

const StateCard = ({ children }) => (
  <div className={cn(cardClass, "flex flex-col items-center gap-4 py-12 text-center")}>
    {children}
  </div>
);

const TIPS = [
  "Update order status as soon as items leave your farm.",
  "Encourage buyers to confirm delivery quickly to avoid delays.",
  "Use the issue button if there is a delivery dispute.",
];

const ProductOrdersPage = () => {
  // Route param is "product-<id>" (built by toProductRouteId in lib/farmerOrder)
  const { productId: routeProductId } = useParams();
  const productId = fromProductRouteId(routeProductId);

  const {
    data: apiOrders,
    isLoading: ordersLoading,
    error,
  } = useFarmerOrder({ product_id: productId }, { enabled: !!productId });
  // The product record fills the header (status / stock / price); the page
  // still works from order data alone if this request fails.
  const { data: apiProducts, isLoading: productsLoading } = useFarmerProducts();
  const isLoading = (!!productId && ordersLoading) || productsLoading;

  const productOrders = useMemo(() => extractOrders(apiOrders), [apiOrders]);

  const productDetails = useMemo(() => {
    const product = extractProducts(apiProducts).find((p) => p?.public_id === productId);
    const sampleOrder = productOrders[0];
    if (!product && !sampleOrder) return null;

    return {
      name: product?.name || getOrderProductName(sampleOrder),
      status: product ? getProductStatus(product) : null,
      stock: product?.quantity ?? null,
      price: product?.price != null ? formatNaira(product.price) : null,
      image: getProductImage(product) || getOrderImage(sampleOrder),
    };
  }, [apiProducts, productId, productOrders]);

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
        <BackToOrders>Back to Orders</BackToOrders>
      </StateCard>
    );
  }

  if (!productDetails) {
    return (
      <StateCard>
        <p className="text-sm text-red-500">Product not found.</p>
        <BackToOrders>Back to Orders</BackToOrders>
      </StateCard>
    );
  }

  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <section className={cn(cardClass, "flex min-w-0 flex-col gap-5 xl:max-w-[750px] xl:flex-1")}>
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4 rounded-lg p-2.5">
            <div className="flex min-w-0 items-center gap-5">
              <img
                src={productDetails.image || watermelon}
                alt=""
                className="h-[50px] w-[50px] shrink-0 object-cover"
                onError={(e) => {
                  e.currentTarget.src = watermelon;
                }}
              />
              <div className="min-w-0 space-y-1">
                <h1 className="break-words text-xl font-semibold text-black">
                  {productDetails.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2.5 text-base text-grey-300">
                  {productDetails.status && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-2xl py-0.5 pl-1.5 pr-2 text-xs font-bold leading-[18px]",
                        productDetails.status.badge
                      )}
                    >
                      <span
                        className={cn("h-1.5 w-1.5 rounded-full", productDetails.status.dot)}
                        aria-hidden="true"
                      />
                      {productDetails.status.label}
                    </span>
                  )}
                  <span>
                    {productDetails.stock != null && `${productDetails.stock} in stock`}
                    {productDetails.stock != null && productDetails.price && " . "}
                    {productDetails.price}
                  </span>
                </div>
              </div>
            </div>
            <BackToOrders />
          </div>
          <hr className="border-[#b0b0b0]" />
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-medium text-black">Orders for this product</h2>

          {productOrders.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {productOrders.map((order, index) => (
                <li
                  key={getOrderId(order) || `order-${index}`}
                  className="flex flex-col gap-3 rounded-lg bg-white px-2.5 py-5 shadow-[0px_0px_2px_rgba(0,0,0,0.25)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 sm:max-w-[561px] sm:justify-between">
                    <span className="text-lg font-medium text-black">{getOrderTitle(order)}</span>
                    <OrderStatusPill status={order.status} className="max-w-[160px]" />
                    <span className="text-sm font-medium text-grey-300">
                      Buyer: {getOrderBuyerName(order)}
                    </span>
                    <span className="text-sm font-medium text-grey-300">
                      Qty: {getOrderQuantity(order)}
                    </span>
                    <span className="text-sm text-[#8a8a8a]">{formatOrderDate(order)}</span>
                  </div>

                  <Link
                    to={getSingleOrderPath(order)}
                    state={{ order }}
                    className="inline-flex shrink-0 items-center justify-center self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium leading-none text-white transition-colors hover:bg-primary-dark sm:self-auto"
                  >
                    Manage
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">
              No orders yet for this product.
            </p>
          )}
        </div>
      </section>

      <aside className={cn(cardClass, "flex flex-col gap-5 text-black xl:w-[307px] xl:shrink-0")}>
        <h2 className="text-xl font-semibold">Tips</h2>
        <ul className="flex list-disc flex-col gap-4 pl-6 text-base">
          {TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

export default ProductOrdersPage;

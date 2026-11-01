import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoMdArrowBack } from "react-icons/io";
import { FaCheck, FaPlus, FaMinus } from "react-icons/fa6";
import { toast } from "react-toastify";
import { fetchProductById, fetchProducts } from "@/lib/api";
import { useCart } from "@/hooks";
import { Button, Skeleton } from "@/components/shared";
import { ProductCard, StockBadge } from "./product-list";
import { canOrder, clampQuantity, formatQuantity, getOrderRules, unitLabel } from "@/lib/units";
import { categoryLabel } from "@/lib/categories";

const BackLink = () => (
  <Link
    to="/marketplace"
    className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-neutral transition-colors hover:bg-gray-50"
  >
    <IoMdArrowBack aria-hidden="true" />
    Back to results
  </Link>
);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id),
  });

  // Similar products: others listed in the same category
  const { data: productsData } = useQuery({
    queryKey: ["products", "similar", data?.category],
    queryFn: () => fetchProducts({ categories: [data.category], pageSize: 9 }),
    enabled: Boolean(data?.category),
  });

  // What a buyer may order: starts at the farmer's minimum, one unit per step, up to the stock
  const rules = getOrderRules(data);
  useEffect(() => {
    if (data) setQuantity(getOrderRules(data).min);
  }, [data]);

  const addedMessage = (product, amount) =>
    `${formatQuantity(amount, getOrderRules(product).unit)} of ${product.name} added to cart!`;

  const handleAddToCart = (product) => {
    if (product.availability !== "in_stock") {
      toast.error("This product is out of stock");
      return;
    }
    addToCart(product, quantity);
    toast.success(addedMessage(product, clampQuantity(quantity, getOrderRules(product))));
  };

  const handleAddSimilarToCart = (product) => {
    if (product.availability !== "in_stock") {
      toast.error("This product is out of stock");
      return;
    }
    // Similar products go in at their own minimum order
    addToCart(product);
    toast.success(addedMessage(product, getOrderRules(product).min));
  };

  const handleBuyNow = (product) => {
    if (product.availability !== "in_stock") {
      toast.error("This product is out of stock");
      return;
    }
    addToCart(product, quantity);
    toast.success(addedMessage(product, clampQuantity(quantity, getOrderRules(product))));
    navigate("/checkout");
  };

  const incrementQuantity = () =>
    setQuantity((prev) => clampQuantity(prev + rules.step, rules));

  const decrementQuantity = () =>
    setQuantity((prev) => clampQuantity(prev - rules.step, rules));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
            <Skeleton className="aspect-[4/3] w-full rounded-lg" />
            <Skeleton className="h-7 w-1/2 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
            <Skeleton className="h-6 w-1/3 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <BackLink />
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-red-600">
          Error loading product
        </div>
      </div>
    );
  }

  const orderable = canOrder(rules);
  const inStock = data.availability === "in_stock" && orderable;
  const unit = rules.unit || "unit";
  const stockCount = rules.max;

  // Find similar products in the same category
  const similar =
    productsData?.products
      ?.filter((item) => item.category === data.category && item.id !== data.id)
      .slice(0, 8) ?? [];

  return (
    <div className="space-y-6">
      <BackLink />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Product summary */}
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
            <img
              src={Array.isArray(data.images) ? data.images[0] : data.images}
              alt={data.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="break-words text-xl font-bold capitalize text-gray-900 sm:text-2xl">
              {data.name}
            </h1>
            <StockBadge inStock={inStock} />
          </div>
          <p className="mt-2 text-gray-600">{data.description}</p>

          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-xl font-semibold text-gray-900">
              ₦{Number(data.discounted_price || data.price || 0).toLocaleString()}
            </p>
            {data.discounted_price && Number(data.discounted_price) < Number(data.price) && (
              <p className="text-sm text-gray-400 line-through">
                ₦{Number(data.price).toLocaleString()}
              </p>
            )}
            <p className="text-sm text-gray-600">per {unit}</p>
          </div>

          {inStock && (
            <>
              <p className="mt-1 text-sm text-primary">
                {stockCount !== null ? `${formatQuantity(stockCount, rules.unit)} in stock` : "In stock"}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Minimum order: {formatQuantity(rules.min, rules.unit)}
              </p>

              {/* Quantity selector */}
              <div className="mt-4 inline-flex items-center rounded-lg bg-primary-subtle/60">
                <button
                  type="button"
                  onClick={decrementQuantity}
                  disabled={quantity <= rules.min}
                  aria-label="Decrease quantity"
                  className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-primary-subtle disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaMinus className="h-6 w-6 rounded-full border-2 p-1" />
                </button>
                <span className="min-w-12 px-6 text-center font-medium" aria-live="polite">
                  {quantity} <span className="text-sm text-gray-600">{unitLabel(quantity, rules.unit)}</span>
                </span>
                <button
                  type="button"
                  onClick={incrementQuantity}
                  disabled={stockCount !== null && quantity + rules.step > stockCount}
                  aria-label="Increase quantity"
                  className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-primary-subtle disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaPlus className="h-6 w-6 rounded-full border-2 p-1" />
                </button>
              </div>
            </>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => handleAddToCart(data)}
              disabled={!inStock}
              className="h-12 py-0 sm:flex-1"
            >
              Add to cart
            </Button>
            <Button
              onClick={() => handleBuyNow(data)}
              disabled={!inStock}
              className="h-12 py-0 sm:flex-1"
            >
              Buy now
            </Button>
          </div>
        </div>

        {/* Product information */}
        <div className="min-w-0 space-y-8 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          <section>
            <h2 className="text-lg font-semibold capitalize text-gray-900 lg:text-xl">
              Fresh {data.name}
            </h2>
            <div className="mt-4 space-y-3 text-sm text-gray-700 lg:text-base">
              <p className="flex flex-wrap gap-x-2 gap-y-1">
                <span>
                  <span className="font-medium">Category:</span>{" "}
                  <span>{categoryLabel(data.category)}</span>
                </span>
                <span aria-hidden="true">|</span>
                <span>
                  <span className="font-medium">Type:</span>{" "}
                  <span className="capitalize">{data.farmer?.farm_type}</span>
                </span>
                <span aria-hidden="true">|</span>
                <span>
                  <span className="font-medium">Origin:</span>{" "}
                  <span className="capitalize">{data.farmer?.farm_location}</span>
                </span>
              </p>
              <p>
                <span className="font-medium">Availability:</span>{" "}
                {inStock ? "In Stock" : "Out of Stock"}
              </p>
              <p>
                <span className="font-medium">Price:</span> ₦{Number(data.discounted_price || data.price || 0).toLocaleString()} per {unit}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 lg:text-xl">Description</h2>
            <p className="text-sm text-gray-700 lg:text-base">{data.description}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 lg:text-xl">Key Details</h2>
            <ul className="space-y-2 text-sm text-gray-700 lg:text-base">
              <li className="flex items-center gap-2">
                <FaCheck className="shrink-0 text-primary" aria-hidden="true" />
                Fresh, high-quality produce
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="shrink-0 text-primary" aria-hidden="true" />
                <span>
                  Bulk packaging <span className="capitalize">(per {unit})</span>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="shrink-0 text-primary" aria-hidden="true" />
                Delivery within 2-5 days
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 lg:text-xl">Farmer&apos;s Details</h2>
            <div className="flex items-start gap-4">
              <img
                src={data.farmer?.profile_picture}
                alt={data.farmer?.full_name}
                className="h-14 w-14 shrink-0 rounded-full bg-gray-100 object-cover"
              />
              <div className="min-w-0 space-y-1 text-sm text-gray-700 lg:text-base">
                <p>
                  <span className="font-medium">Name:</span> {data.farmer?.full_name}
                </p>
                <p>
                  <span className="font-medium">Location:</span> {data.farmer?.farm_location}
                </p>
                <p>
                  <span className="font-medium">Farm type:</span> {data.farmer?.farm_type}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Suggestions */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Similar Products</h2>
        {similar.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:grid-cols-4">
            {similar.map((item) => (
              <ProductCard key={item.id} product={item} onAddToCart={handleAddSimilarToCart} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
            No similar products found
          </p>
        )}
      </section>
    </div>
  );
}

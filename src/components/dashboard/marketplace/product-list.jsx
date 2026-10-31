import { Link } from "react-router-dom";
import { IoIosStar } from "react-icons/io";
import { toast } from "react-toastify";
import { useCart } from "@/hooks";
import { Button, Skeleton } from "@/components/shared";
import { canOrder, formatQuantity, getOrderRules } from "@/lib/units";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300";
const GRID_CLASSES = "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:grid-cols-4";

const getProductImage = (product) => {
  if (!product.images) return PLACEHOLDER_IMAGE;

  if (Array.isArray(product.images)) {
    // Prefer a hosted image over inline base64 data
    const validImage = product.images.find(
      (img) => img && typeof img === "string" && !img.startsWith("data:image")
    );
    return validImage || product.images[0] || PLACEHOLDER_IMAGE;
  }

  return product.images || PLACEHOLDER_IMAGE;
};

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <Skeleton className="aspect-[4/3] w-full rounded-lg" />
      <Skeleton className="mt-4 h-5 w-2/3 rounded" />
      <Skeleton className="mt-2 h-4 w-1/3 rounded" />
      <Skeleton className="mt-2 h-4 w-1/4 rounded" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

export function StockBadge({ inStock }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        inStock ? "bg-primary-subtle text-primary" : "bg-red-100 text-red-700"
      }`}
    >
      {inStock ? "In stock" : "Out of stock"}
    </span>
  );
}

export function ProductCard({ product, onAddToCart }) {
  const rules = getOrderRules(product);
  // Stock below the farmer's minimum order can't be bought either
  const inStock = product.availability === "in_stock" && canOrder(rules);
  const price = product.discounted_price || product.price || 0;

  return (
    <article className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
        <img
          src={getProductImage(product)}
          alt={product.name || "Product"}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.src = PLACEHOLDER_IMAGE;
          }}
        />
      </div>

      <div className="mt-3 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 break-words text-base font-medium capitalize text-gray-900 sm:text-lg">
            {product.name || "Unnamed Product"}
          </h3>
          <StockBadge inStock={inStock} />
        </div>

        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <p className="font-semibold text-gray-900">₦{price}</p>
          {product.discount_percentage > 0 && (
            <p className="text-xs text-gray-500 line-through">₦{product.price}</p>
          )}
          <p className="text-sm text-gray-600">per {rules.unit || "item"}</p>
        </div>
        <p className="text-sm text-gray-600">Min. order: {formatQuantity(rules.min, rules.unit)}</p>

        <div className="flex items-center gap-1 text-sm text-gray-600">
          <IoIosStar className="text-yellow-500" aria-hidden="true" />
          <span>
            {product.average_rating || 0} ({product.total_ratings || 0})
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          onClick={() => onAddToCart(product)}
          disabled={!inStock}
          className="h-10 flex-1 px-3 py-0 text-sm"
        >
          Add to cart
        </Button>
        <Link
          to={`/marketplace/products/${product.public_id}`}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          View details
        </Link>
      </div>
    </article>
  );
}


/**
 * Presentational product grid. Data fetching and filtering live in the
 * marketplace page so the filter panel, category tiles and ?q= search can
 * all drive the same list.
 */
export default function ProductsList({
  products = [],
  hasProducts = false,
  isLoading = false,
  error = null,
  onRetry,
  emptyMessage = "No products match your filters",
}) {
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    if (product.availability !== "in_stock") {
      toast.error("This product is out of stock");
      return;
    }
    // Goes in at the farmer's minimum order
    addToCart(product);
    const { min, unit } = getOrderRules(product);
    toast.success(`${formatQuantity(min, unit)} of ${product.name} added to cart!`);
  };

  if (isLoading) {
    return (
      <div className={GRID_CLASSES}>
        {[...Array(4)].map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="mb-4 text-red-600">We couldn&apos;t load products. Please try again.</p>
        <Button onClick={() => onRetry?.()} className="h-10 py-0">
          Retry
        </Button>
      </div>
    );
  }

  if (!hasProducts) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">No products available</p>
        <Button onClick={() => onRetry?.()} className="mt-4 h-10 py-0">
          Retry
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={GRID_CLASSES}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
      ))}
    </div>
  );
}

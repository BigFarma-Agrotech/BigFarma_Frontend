import { Link } from "react-router-dom";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks";

const PRIMARY_LINK =
  "inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 font-medium text-white transition-colors hover:bg-primary-dark";
const OUTLINE_LINK =
  "inline-flex h-12 w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-6 font-medium text-gray-700 transition-colors hover:bg-gray-50";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();

  const subtotal = getCartTotal();
  const deliveryFee = 1500;
  const taxRate = 0.075;
  const tax = subtotal * taxRate;
  const totalPayment = subtotal + deliveryFee + tax;

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-subtle text-primary">
          <ShoppingCart size={26} aria-hidden="true" />
        </span>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Your cart is empty</h1>
        <p className="text-sm text-gray-600">Add some fresh produce to get started!</p>
        <Link
          to="/marketplace"
          className="mt-3 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Cart</h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-red-600 underline hover:text-red-700"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <ul className="space-y-4 lg:col-span-2">
          {cartItems.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                {/* Product Image */}
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-20 sm:w-20">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-xs text-gray-400">No Image</span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold capitalize text-gray-900 sm:text-lg">
                    {item.name}
                  </h2>
                  <p className="font-semibold text-primary">₦{Number(item.price || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">
                    Available: {item.quantity || "In stock"}
                  </p>
                  <p className="text-xs capitalize text-gray-500">Category: {item.category}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-3 sm:border-t-0 sm:pt-0">
                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={item.cartQuantity <= 1}
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    <FaMinus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center font-semibold" aria-live="polite">
                    {item.cartQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={item.cartQuantity >= (parseInt(item.quantity?.split(" ")[0]) || 999)}
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    <FaPlus className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                  <p className="font-semibold text-gray-900">
                    ₦{(item.price * item.cartQuantity).toLocaleString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Order Summary */}
        <aside className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 lg:sticky lg:top-28">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">Summary</h2>

          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="min-w-0 break-words capitalize">
                  {item.name} x {item.cartQuantity}
                </span>
                <span className="shrink-0">₦{(item.price * item.cartQuantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <hr className="my-4 border-gray-200" />

          <div className="space-y-3 text-sm sm:text-base">
            <div className="flex justify-between">
              <span>Sub Total</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₦{deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (7.5%)</span>
              <span>₦{Math.round(tax).toLocaleString()}</span>
            </div>
          </div>

          <hr className="my-4 border-gray-200" />

          <div className="flex justify-between text-lg font-semibold text-gray-900">
            <span>Total Payment</span>
            <span>₦{Math.round(totalPayment).toLocaleString()}</span>
          </div>

          <div className="mt-6 space-y-3">
            <Link to="/checkout" className={PRIMARY_LINK}>
              Checkout
            </Link>
            <Link to="/marketplace" className={OUTLINE_LINK}>
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

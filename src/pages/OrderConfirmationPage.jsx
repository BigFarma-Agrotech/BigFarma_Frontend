import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

export default function OrderConfirmationPage() {
  const [orderData, setOrderData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedOrder = localStorage.getItem("bigfarma-order");
    if (!savedOrder) {
      navigate("/marketplace");
      return;
    }

    try {
      const order = JSON.parse(savedOrder);
      setOrderData(order);
      const timer = setTimeout(() => {
        localStorage.removeItem("bigfarma-order");
      }, 1000);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Error parsing order data:", error);
      navigate("/marketplace");
    }
  }, [navigate]);

  if (!orderData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  const deliveryText =
    orderData.customerInfo.deliveryOption === "door-delivery" ? "Door delivery" : "Pickup";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm sm:p-8">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-subtle sm:h-20 sm:w-20">
            <FaCheckCircle className="h-10 w-10 text-primary sm:h-12 sm:w-12" aria-hidden="true" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">Order Confirmed</h1>
          <p className="text-sm text-gray-600 sm:text-base">
            Thank you {orderData.customerInfo.firstName}, your produce will be delivered soon.
          </p>
        </div>

        {/* Order Details */}
        <dl className="mb-6 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 text-left sm:grid-cols-2 sm:p-6">
          <div>
            <dt className="text-sm text-gray-600">Order ID</dt>
            <dd className="font-semibold break-all">{orderData.orderId}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Total paid</dt>
            <dd className="font-semibold">₦{orderData.totals.total.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Delivery</dt>
            <dd className="font-semibold">{deliveryText}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Payment Method</dt>
            <dd className="font-semibold capitalize">{orderData.customerInfo.paymentOption}</dd>
          </div>
        </dl>

        {/* Order Items */}
        <div className="mb-6 rounded-lg border border-gray-200 p-4 text-left sm:p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Order Items</h2>
          <div className="space-y-3">
            {orderData.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="break-words font-medium capitalize">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.cartQuantity}{" "}
                    {item.quantity?.split(" ").slice(1).join(" ") || "units"}
                  </p>
                </div>
                <p className="shrink-0 font-semibold">
                  ₦{(item.price * item.cartQuantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <hr className="my-4 border-gray-200" />

          <div className="space-y-2 text-sm sm:text-base">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₦{orderData.totals.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₦{orderData.totals.deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₦{orderData.totals.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-semibold text-gray-900">
              <span>Total</span>
              <span>₦{orderData.totals.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4 text-left sm:p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Delivery Information</h2>
          <div className="space-y-2 break-words text-sm sm:text-base">
            <p>
              <span className="text-gray-600">Name:</span> {orderData.customerInfo.firstName}{" "}
              {orderData.customerInfo.lastName}
            </p>
            <p>
              <span className="text-gray-600">Phone:</span> {orderData.customerInfo.phoneNumber}
            </p>
            {orderData.customerInfo.email && (
              <p>
                <span className="text-gray-600">Email:</span> {orderData.customerInfo.email}
              </p>
            )}
            <p>
              <span className="text-gray-600">Address:</span> {orderData.customerInfo.address}
            </p>
            <p>
              <span className="text-gray-600">Delivery Method:</span> {deliveryText}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to="/marketplace"
          className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-8 font-medium text-white transition-colors hover:bg-primary-dark sm:w-auto"
        >
          Back To Market
        </Link>

        {/* Additional Info */}
        <div className="mt-6 text-sm text-gray-600">
          <p>You will receive SMS updates about your order status.</p>
          <p className="mt-1">Expected delivery: 2-5 business days</p>
        </div>
      </div>
    </div>
  );
}

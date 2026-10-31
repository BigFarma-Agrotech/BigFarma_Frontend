import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "@/hooks";
import { Button, Input } from "@/components/shared";
import { checkoutHandler } from "@/services";
import { parseApiError } from "@/lib/apiError";
import { PENDING_CHECKOUT_KEY } from "@/lib/checkout";

// Shown before checkout; the backend works out the amount Paystack charges
const DELIVERY_FEE = 1500;
const TAX_RATE = 0.075;

const LABEL = "mb-1.5 block text-sm font-medium text-gray-700";
const ERROR = "mt-1 text-sm text-red-600";
const fieldClass = (hasError) =>
  `h-12 w-full rounded-lg border-2 bg-white px-4 text-base focus:border-primary-light focus:outline-none ${
    hasError ? "border-red-500" : "border-gray-300"
  }`;

export default function CheckoutPage() {
  const { cartItems, getCartTotal } = useCart();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    address: "",
    deliveryOption: "door-delivery",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const subtotal = getCartTotal();
  const deliveryFee = formData.deliveryOption === "pickup" ? 0 : DELIVERY_FEE;
  const tax = subtotal * TAX_RATE;
  const totalPayment = subtotal + deliveryFee + tax;

  if (cartItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{11}$/.test(formData.phoneNumber.replace(/\D/g, ""))) {
      newErrors.phoneNumber = "Please enter a valid 11-digit phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.deliveryOption) {
      newErrors.deliveryOption = "Please select a delivery option";
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const { firstName, lastName, phoneNumber, email, address, deliveryOption } = formData;

    let checkout;
    try {
      // Creates the orders (unpaid) and a Paystack transaction for the whole cart
      checkout = await checkoutHandler({
        items: cartItems.map((item) => ({ product_id: item.id, quantity: item.cartQuantity })),
        delivery_address: address.trim(),
        contact_name: `${firstName.trim()} ${lastName.trim()}`,
        contact_phone: phoneNumber.trim(),
        delivery_option: deliveryOption,
        email: email.trim() || undefined,
        callback_url: `${window.location.origin}/payment-processing`,
      });
    } catch (error) {
      setIsSubmitting(false);
      toast.error(parseApiError(error, "Couldn't start your payment. Please try again.").message);
      return;
    }

    if (!checkout?.authorization_url) {
      setIsSubmitting(false);
      toast.error("Couldn't open the payment page. Please try again.");
      return;
    }

    // Kept for when Paystack sends the buyer back to /payment-processing
    try {
      localStorage.setItem(
        PENDING_CHECKOUT_KEY,
        JSON.stringify({
          reference: checkout.reference,
          productIds: cartItems.map((item) => item.id),
          items: cartItems,
          customerInfo: { firstName, lastName, phoneNumber, email, address, deliveryOption },
        })
      );
    } catch {
      // The payment page still works; the confirmation just shows less detail
    }

    window.location.assign(checkout.authorization_url);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Checkout</h1>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Checkout Form */}
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="space-y-8 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 lg:col-span-2"
        >
          {/* Personal Information */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className={LABEL}>
                  First Name
                </label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={`h-12 ${errors.firstName ? "border-red-500" : ""}`}
                  aria-invalid={Boolean(errors.firstName)}
                />
                {errors.firstName && <p className={ERROR}>{errors.firstName}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className={LABEL}>
                  Last Name
                </label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={`h-12 ${errors.lastName ? "border-red-500" : ""}`}
                  aria-invalid={Boolean(errors.lastName)}
                />
                {errors.lastName && <p className={ERROR}>{errors.lastName}</p>}
              </div>

              <div>
                <label htmlFor="phoneNumber" className={LABEL}>
                  Phone Number
                </label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  inputMode="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  className={`h-12 ${errors.phoneNumber ? "border-red-500" : ""}`}
                  aria-invalid={Boolean(errors.phoneNumber)}
                  placeholder="8022222222"
                />
                {errors.phoneNumber && <p className={ERROR}>{errors.phoneNumber}</p>}
              </div>

              <div>
                <label htmlFor="email" className={LABEL}>
                  Email (Optional)
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`h-12 ${errors.email ? "border-red-500" : ""}`}
                  aria-invalid={Boolean(errors.email)}
                  placeholder="example@gmail.com"
                />
                {errors.email ? (
                  <p className={ERROR}>{errors.email}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">Paystack sends your receipt here</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="address" className={LABEL}>
                Address
              </label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className={`h-12 ${errors.address ? "border-red-500" : ""}`}
                aria-invalid={Boolean(errors.address)}
                placeholder="Enter your full address"
              />
              {errors.address && <p className={ERROR}>{errors.address}</p>}
            </div>
          </section>

          {/* Delivery */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Delivery</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="deliveryOption" className={LABEL}>
                  Delivery Option
                </label>
                <select
                  id="deliveryOption"
                  value={formData.deliveryOption}
                  onChange={(e) => handleInputChange("deliveryOption", e.target.value)}
                  className={fieldClass(errors.deliveryOption)}
                  aria-invalid={Boolean(errors.deliveryOption)}
                >
                  <option value="">Select delivery option</option>
                  <option value="door-delivery">Door Delivery</option>
                  <option value="pickup">Pickup</option>
                </select>
                {errors.deliveryOption && <p className={ERROR}>{errors.deliveryOption}</p>}
              </div>
            </div>
          </section>

          {/* Terms */}
          <p className="text-sm text-gray-600">
            You&apos;ll pay securely with Paystack. By placing an order you agree to BigFarma terms
            and refund policy.
          </p>
        </form>

        {/* Order Summary */}
        <aside className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 lg:sticky lg:top-28">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">Order Summary</h2>

          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="min-w-0 break-words capitalize">
                  {item.name} x {item.cartQuantity}
                </span>
                <span className="shrink-0">
                  ₦{(item.price * item.cartQuantity).toLocaleString()}
                </span>
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
              <span>{deliveryFee ? `₦${deliveryFee.toLocaleString()}` : "Free (pickup)"}</span>
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

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <Button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="h-12 w-full py-0"
            >
              {isSubmitting ? "Redirecting to Paystack..." : "Checkout"}
            </Button>
            <Link
              to="/cart"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-6 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Back to cart
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

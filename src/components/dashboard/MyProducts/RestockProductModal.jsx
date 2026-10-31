import { useEffect, useState } from "react";
import { PackagePlus, X } from "lucide-react";
import Button from "@/components/shared/Button";

const RestockProductModal = ({
  isOpen,
  onClose,
  onConfirm,
  product,
  isLoading,
}) => {
  const [quantity, setQuantity] = useState("");

  // Start from an empty field each time the modal opens
  useEffect(() => {
    if (isOpen) setQuantity("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity && !isNaN(quantity)) {
      onConfirm(product?.originalData?.public_id, quantity);
    }
  };

  const handleClose = () => {
    setQuantity("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="restock-product-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 sm:p-6"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-subtle">
              <PackagePlus className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                id="restock-product-title"
                className="text-lg font-semibold text-gray-900"
              >
                Restock Product
              </h3>
              <p className="break-words text-sm text-gray-600">
                Update quantity for {product?.product}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              aria-label="Close"
              className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 rounded-lg bg-gray-50 p-3">
            <p className="text-sm text-gray-600">Current Quantity</p>
            <p className="text-lg font-semibold text-gray-900">
              {product?.quantity}
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="restock-quantity"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              New Quantity
            </label>
            <input
              type="number"
              id="restock-quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter new quantity"
              className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light"
              required
              min="0"
              step="1"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the total quantity you want to set for this product
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="h-10 py-0"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !quantity}
              className="h-10 py-0"
            >
              {isLoading ? "Updating..." : "Update Quantity"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockProductModal;

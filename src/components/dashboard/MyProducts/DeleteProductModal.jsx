import { Trash2, X } from "lucide-react";
import Button from "@/components/shared/Button";

const DeleteProductModal = ({
  isOpen,
  onClose,
  onConfirm,
  product,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 text-center sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <Trash2 className="h-8 w-8 text-red-600" aria-hidden="true" />
        </div>

        <h3
          id="delete-product-title"
          className="mb-2 text-lg font-semibold text-gray-900"
        >
          Delete Product
        </h3>
        <p className="mb-6 text-sm text-gray-600">
          Are you sure you want to delete{" "}
          <strong className="break-words">&quot;{product?.product}&quot;</strong>?
          This action cannot be undone and all product data will be permanently
          removed.
        </p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="h-10 py-0"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="h-10 bg-red-600 py-0 hover:bg-red-700 focus-visible:ring-red-500"
          >
            {isLoading ? "Deleting..." : "Delete Product"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;

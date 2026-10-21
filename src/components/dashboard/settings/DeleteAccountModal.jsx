import { X } from "lucide-react";
import Button from "@/components/shared/Button";

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isPending = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 text-center sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="delete-account-title"
          className="mx-auto mt-6 max-w-xs text-lg font-semibold text-gray-900"
        >
          Are you sure you want to delete your account?
        </h2>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 flex-1 py-0"
          >
            No, Go Back
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="h-10 flex-1 bg-red-600 py-0 hover:bg-red-700"
          >
            {isPending ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;

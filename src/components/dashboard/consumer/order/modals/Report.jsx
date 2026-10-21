import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/shared";

const MIN_LENGTH = 10;

const ReportModal = ({ onClose, onSubmit, isSubmitting = false }) => {
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = description.trim();
    if (text.length < MIN_LENGTH) {
      setError(`Please describe the issue (at least ${MIN_LENGTH} characters).`);
      return;
    }
    onSubmit?.(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-problem-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <h2 id="report-problem-title" className="text-lg font-semibold text-gray-900 sm:text-xl">
            Report a delivery problem
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report dialog"
            className="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        <label htmlFor="report-description" className="mt-6 block text-sm font-medium text-gray-700">
          Describe the issue
        </label>
        <textarea
          id="report-description"
          rows={4}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (error) setError("");
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "report-description-error" : undefined}
          className={`mt-2 w-full resize-none rounded-lg border p-3 text-base focus:border-primary-light focus:outline-none ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="e.g., package left at gate, items missing, never received, etc."
        />
        {error && (
          <p id="report-description-error" className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="h-10 py-0">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-10 py-0">
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ReportModal;

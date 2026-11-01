import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** [1, 2, 3, "…", 8, 9, 10] style page list. */
const getPageNumbers = (page, pageCount) => {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set([1, 2, 3, pageCount - 2, pageCount - 1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["…", p] : [p]));
};

const stepButtonClass =
  "inline-flex items-center gap-2 rounded-lg border border-[#d0d5dd] bg-white px-3.5 py-2 text-sm font-bold text-[#344054] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] disabled:cursor-not-allowed disabled:opacity-50";

const ProductsPagination = ({ page, pageCount, onChange }) => (
  <nav aria-label="Products pages" className="flex items-center justify-between gap-2 pt-2">
    <button
      type="button"
      onClick={() => onChange(page - 1)}
      disabled={page <= 1}
      className={stepButtonClass}
    >
      <ArrowLeft className="h-5 w-5 text-primary" aria-hidden="true" />
      <span className="hidden sm:inline">Previous</span>
    </button>

    <ol className="flex items-center gap-0.5">
      {getPageNumbers(page, pageCount).map((p, i) =>
        p === "…" ? (
          <li
            key={`gap-${i}`}
            className="flex h-10 w-8 items-center justify-center text-sm font-bold text-[#667085] sm:w-10"
          >
            …
          </li>
        ) : (
          <li key={p}>
            <button
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Page ${p}`}
              className={cn(
                "h-10 w-8 rounded-lg text-sm font-bold sm:w-10",
                p === page ? "bg-[#e6efea] text-[#01582c]" : "text-[#667085] hover:bg-gray-50"
              )}
            >
              {p}
            </button>
          </li>
        )
      )}
    </ol>

    <button
      type="button"
      onClick={() => onChange(page + 1)}
      disabled={page >= pageCount}
      className={stepButtonClass}
    >
      <span className="hidden sm:inline">Next</span>
      <ArrowRight className="h-5 w-5 text-primary" aria-hidden="true" />
    </button>
  </nav>
);

export default ProductsPagination;

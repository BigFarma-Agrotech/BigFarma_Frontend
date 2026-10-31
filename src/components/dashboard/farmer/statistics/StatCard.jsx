import { formatAmount } from "@/utils";

const StatCard = ({ title, value, format = "number", caption, isError, refetch }) => {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
      <p className="mb-3 text-sm font-medium text-gray-600">{title}</p>

      {isError ? (
        <div className="text-sm text-red-600">
          <p>Couldn&apos;t load this figure.</p>
          {refetch && (
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-1 font-medium text-primary underline"
            >
              Try again
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="whitespace-nowrap text-2xl font-bold tabular-nums text-gray-900 lg:text-xl xl:text-2xl 2xl:text-3xl">
            {format === "currency"
              ? `₦${formatAmount(Number(value) || 0)}`
              : (Number(value) || 0).toLocaleString()}
          </p>
          {caption && (
            <p className="mt-2 text-xs font-medium text-gray-500">{caption}</p>
          )}
        </>
      )}
    </div>
  );
};

export default StatCard;

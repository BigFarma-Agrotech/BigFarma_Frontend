import { Skeleton } from "../../../shared";

const CardSkeleton = () => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
      <Skeleton className="mb-3 h-4 w-28 rounded-md" />
      <Skeleton className="mb-3 h-8 w-40 max-w-full rounded-md" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-md" />
      </div>
    </div>
  );
};

export default CardSkeleton;

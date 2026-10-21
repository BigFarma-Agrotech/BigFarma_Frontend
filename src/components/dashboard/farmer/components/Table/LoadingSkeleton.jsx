import { Skeleton } from "@/components/shared";

const LoadingSkeleton = () => {
  return (
    <tr className="bg-white *:px-4 *:py-3 sm:*:px-6">
      <td>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-5 w-20 rounded" />
        </div>
      </td>
      <td>
        <Skeleton className="h-5 w-16 rounded" />
      </td>
      <td>
        <Skeleton className="h-5 w-20 rounded" />
      </td>
      <td>
        <Skeleton className="h-5 w-16 rounded" />
      </td>
      <td>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </td>
    </tr>
  );
};

export default LoadingSkeleton;

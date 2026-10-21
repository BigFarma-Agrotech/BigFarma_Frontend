import { Skeleton } from "@/components/shared";

const LoadingSkeleton = () => {
  return (
    <tr className="*:px-4 *:py-3">
      <td>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
      </td>
      <td>
        <Skeleton className="h-4 w-24 rounded" />
      </td>
      <td>
        <Skeleton className="h-4 w-20 rounded" />
      </td>
      <td>
        <Skeleton className="h-5 w-16 rounded-full" />
      </td>
    </tr>
  );
};

export default LoadingSkeleton;

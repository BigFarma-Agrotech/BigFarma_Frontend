import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Shield, Users } from "lucide-react";
import { getStatusText, getStatusClasses } from "@/utils/GroupBuyStatus";
import { groupDetails, normalizeGroup } from "@/lib/groupBuyApi";
import { GroupData } from "@/lib/GroupBuy";
import { Button, Skeleton } from "@/components/shared";

const CARD = "rounded-xl border border-gray-200 bg-white p-4 sm:p-6";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const GroupDetails = () => {
  const { groupId } = useParams();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["groupDetails", groupId],
    queryFn: () => groupDetails(groupId),
    enabled: Boolean(groupId),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // The list falls back to sample groups when the API is down; mirror that here
  const sampleGroup = isError
    ? GroupData.find((item) => String(item.id) === String(groupId))
    : null;
  const raw = data || sampleGroup;
  const group = useMemo(() => (raw ? normalizeGroup(raw) : null), [raw]);

  const handleJoin = () => {
    // No join endpoint exists in the API config yet
    toast.info("Joining groups is coming soon");
  };

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading group">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className={`${CARD} flex flex-col items-center justify-center gap-3 text-center text-gray-500`}>
        <p>We couldn&apos;t load this group.</p>
        {error?.response?.data?.message && (
          <small className="text-red-600">{error.response.data.message}</small>
        )}
        <Link to="/group-buy" className="text-sm font-medium text-primary hover:text-primary-dark">
          Back to groups
        </Link>
      </div>
    );
  }

  const deadline = group.deadline ? formatDate(group.deadline) : null;
  const isFull = group.slotsRemaining === 0;
  const numericId = Number(group.id);
  const displayId = Number.isFinite(numericId)
    ? `BGRP - ${String(numericId).padStart(3, "0")}`
    : String(group.id ?? "-");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="break-words text-xl font-bold text-gray-900 sm:text-2xl">{group.name}</h1>
        {group.location && <p className="text-sm text-gray-600">{group.location}</p>}
      </div>

      {sampleGroup && (
        <p className="rounded-lg bg-secondary-light px-4 py-2 text-sm text-secondary-dark">
          We couldn&apos;t load live data, so this is a sample group.
        </p>
      )}

      <div className={`${CARD} flex gap-4`}>
        <Shield className="shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 space-y-1">
          <p className="text-base font-semibold text-gray-900 sm:text-lg">Escrow Protection:</p>
          <p className="text-sm text-gray-700">
            ₦{group.escrow.toLocaleString()} held in escrow until group is complete or expired
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <div className={CARD}>
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-gray-100 p-4">
            {group.status && (
              <span
                className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(
                  group.status
                )}`}
              >
                {getStatusText(group.status)}!
              </span>
            )}
            {group.image ? (
              <img src={group.image} alt={group.name} className="h-full w-full object-contain" />
            ) : (
              <Users size={48} aria-hidden="true" className="text-gray-300" />
            )}
          </div>

          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p className="text-base font-semibold text-gray-900">{group.name}</p>
            {group.description && <p>{group.description}</p>}
            {group.price !== null && (
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">₦{group.price.toLocaleString()}</p>
                <p>per slot</p>
              </div>
            )}
            {group.quantity !== null && (
              <div className="flex items-center justify-between">
                <p>Target quantity</p>
                <p>
                  {group.quantity} {group.quantityUnit}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <p>Progress</p>
              <p>{group.progress}%</p>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
              role="progressbar"
              aria-label="Group progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={group.progress}
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${group.progress}%` }}
              />
            </div>
            {group.slotsRemaining !== null && (
              <p>
                {group.slotsRemaining} slot{group.slotsRemaining === 1 ? "" : "s"} remaining
              </p>
            )}
            <Button onClick={handleJoin} disabled={isFull} className="mt-2 h-10 w-full py-0">
              {isFull ? "Group is full" : "Join Group"}
            </Button>
          </div>
        </div>

        <div className={CARD}>
          <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Group Details</h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-gray-500">Group ID</dt>
              <dd className="font-medium text-gray-900">{displayId}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Total Slots</dt>
              <dd className="font-medium text-gray-900">{group.totalSlots ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Escrow Amount</dt>
              <dd className="font-medium text-gray-900">₦{group.escrow.toLocaleString()}</dd>
            </div>
            {deadline && (
              <div>
                <dt className="text-gray-500">Deadline</dt>
                <dd className="font-medium text-gray-900">{deadline}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;

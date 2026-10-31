import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CheckCircle2, Minus, Plus, Shield, Users } from "lucide-react";
import { getStatusText, getStatusClasses } from "@/utils/GroupBuyStatus";
import { groupCheckout, groupDetails, normalizeGroup } from "@/lib/groupBuyApi";
import { GroupData } from "@/lib/GroupBuy";
import { Button, Input, Skeleton } from "@/components/shared";
import { parseApiError } from "@/lib/apiError";
import { PENDING_CHECKOUT_KEY } from "@/lib/checkout";
import { formatQuantity, isCountUnit, parseQuantity, unitLabel } from "@/lib/units";

const TAX_RATE = 0.075; // matches the backend's CHECKOUT_TAX_RATE

// ₦1,612.50 (kobo shown only when there are any)
const naira = (value) =>
  `₦${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(Number(value)) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

// Pay for a share of the group through Paystack
const JoinForm = ({ group, lastSlot, topUp = false, myShare = 0, stock = null }) => {
  // Limited by what the group still needs and by the farmer's stock
  const remaining = Math.min(group.remainingQuantity ?? 0, stock ?? Infinity);
  const unit = group.quantityUnit;
  // New members buy at least the group's minimum share; top-ups can be any amount.
  // The last free slot must buy the rest, so the group fills up and closes.
  const minimum = topUp ? Math.min(1, remaining) : Math.min(group.joinMinimum ?? 1, remaining);
  const [quantity, setQuantity] = useState(!topUp && lastSlot ? remaining : minimum || 1);
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  const step = 1;
  const clamp = (value) => {
    let next = Number(value) || step;
    if (isCountUnit(unit)) next = Math.round(next);
    return Math.min(Math.max(next, minimum || step), remaining);
  };
  const subtotal = quantity * (group.unitPrice ?? 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;

  const submit = async (e) => {
    e.preventDefault();
    if (!topUp && (!contact.name.trim() || !/^\d{11}$/.test(contact.phone.replace(/\D/g, "")))) {
      toast.error("Enter your name and an 11-digit phone number");
      return;
    }
    setSubmitting(true);
    try {
      const checkout = await groupCheckout(group.id, {
        quantity,
        // A top-up keeps the contact given when joining
        contact_name: topUp ? undefined : contact.name.trim(),
        contact_phone: topUp ? undefined : contact.phone.trim(),
        email: contact.email.trim() || undefined,
        callback_url: `${window.location.origin}/payment-processing`,
      });
      try {
        localStorage.setItem(
          PENDING_CHECKOUT_KEY,
          JSON.stringify({ reference: checkout.reference, groupId: group.id, productIds: [] })
        );
      } catch {
        // Not needed to confirm the payment
      }
      window.location.assign(checkout.authorization_url);
    } catch (error) {
      setSubmitting(false);
      toast.error(parseApiError(error, "Couldn't start your payment. Please try again.").message);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 border-t border-gray-200 pt-4">
      <p className="font-semibold text-gray-900">{topUp ? "Top up your share" : "Join this group"}</p>
      {topUp && (
        <p className="text-xs text-gray-500">
          Your share is {formatQuantity(myShare, unit)}. Add more, up to what the group still needs.
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <span>{topUp ? "Add" : "Your share"}</span>
        <div className="inline-flex items-center rounded-lg bg-primary-subtle/60">
          <button
            type="button"
            onClick={() => setQuantity((q) => clamp(q - step))}
            disabled={(!topUp && lastSlot) || quantity <= (minimum || step)}
            aria-label="Decrease quantity"
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-primary-subtle disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-20 px-3 text-center font-medium" aria-live="polite">
            {quantity} <span className="text-sm text-gray-600">{unitLabel(quantity, unit)}</span>
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => clamp(q + step))}
            disabled={(!topUp && lastSlot) || quantity + step > remaining}
            aria-label="Increase quantity"
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-primary-subtle disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        {!topUp && lastSlot
          ? `You're taking the last slot, so your share is the remaining ${formatQuantity(remaining, unit)}. This completes the group.`
          : !topUp && minimum > 1
            ? `Each member buys at least ${formatQuantity(minimum, unit)}; up to ${formatQuantity(remaining, unit)} left`
            : `Up to ${formatQuantity(remaining, unit)} left in this group`}
      </p>
      {!topUp && (
        <>
      <Input
        id="join-name"
        aria-label="Your name"
        placeholder="Your name"
        value={contact.name}
        onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
        className="h-11"
      />
      <Input
        id="join-phone"
        aria-label="Phone number"
        type="tel"
        inputMode="tel"
        placeholder="Phone number (e.g. 08022222222)"
        value={contact.phone}
        onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
        className="h-11"
      />
      <Input
        id="join-email"
        aria-label="Email for your receipt (optional)"
        type="email"
        placeholder="Email for your receipt (optional)"
        value={contact.email}
        onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
        className="h-11"
      />
        </>
      )}
      <dl className="space-y-1 rounded-lg bg-gray-50 p-3">
        <div className="flex justify-between">
          <dt>{formatQuantity(quantity, unit)} x {naira(group.unitPrice)}</dt>
          <dd>{naira(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Tax (7.5%)</dt>
          <dd>{naira(tax)}</dd>
        </div>
        <div className="flex justify-between font-semibold text-gray-900">
          <dt>You pay</dt>
          <dd>{naira(subtotal + tax)}</dd>
        </div>
      </dl>
      <Button type="submit" disabled={submitting || remaining <= 0} className="h-10 w-full py-0">
        {submitting ? "Redirecting to Paystack..." : topUp ? "Top up with Paystack" : "Join & pay with Paystack"}
      </Button>
      <p className="text-xs text-gray-500">
        Your money is held in escrow. When the group reaches its target, one order goes to the
        farmer for delivery to the group&apos;s location.
      </p>
    </form>
  );
};

const CARD = "rounded-xl border border-gray-200 bg-white p-4 sm:p-6";

const daysLeft = (value) => {
  const ms = new Date(value).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  if (ms <= 0) return "Deadline passed";
  const days = Math.floor(ms / 86400000);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"} left`;
  const hours = Math.max(1, Math.floor(ms / 3600000));
  return `${hours} hour${hours === 1 ? "" : "s"} left`;
};

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
    refetchOnWindowFocus: false,
  });

  // The list falls back to sample groups when the API is down; mirror that here
  const sampleGroup = isError
    ? GroupData.find((item) => String(item.id) === String(groupId))
    : null;
  const raw = data || sampleGroup;
  const group = useMemo(() => (raw ? normalizeGroup(raw) : null), [raw]);

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
  const status = String(group.status || "").toLowerCase();
  const isOpen = !sampleGroup && status === "active" && !isFull && (group.remainingQuantity ?? 0) > 0;
  const members = Array.isArray(raw?.members) ? raw.members : [];
  const memberCount = group.membersCount ?? members.length;
  const lastSlot = Boolean(group.totalSlots) && memberCount + 1 >= group.totalSlots;
  const timeLeft = group.deadline && status === "active" ? daysLeft(group.deadline) : null;
  const myShare = Number(members.find((m) => m.user_name === "You")?.quantity_committed || 0);
  const stock = parseQuantity(raw?.product?.quantity).amount;
  const canTopUp = !sampleGroup && status === "active" && (group.remainingQuantity ?? 0) > 0;

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
            {group.unitPrice !== null && (
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">₦{group.unitPrice.toLocaleString()}</p>
                <p>per {group.quantityUnit || "unit"}</p>
              </div>
            )}
            {group.quantity !== null && (
              <div className="flex items-center justify-between">
                <p>Target quantity</p>
                <p>{formatQuantity(group.quantity, group.quantityUnit)}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <p>Paid so far</p>
              <p>{formatQuantity(group.currentQuantity, group.quantityUnit)}</p>
            </div>
            {stock !== null && (
              <div className="flex items-center justify-between">
                <p>Farmer&apos;s stock</p>
                <p className={stock > 0 ? "" : "text-red-600"}>{formatQuantity(stock, group.quantityUnit)}</p>
              </div>
            )}
            {group.minShare > 1 && (
              <div className="flex items-center justify-between">
                <p>Minimum per member</p>
                <p>{formatQuantity(group.minShare, group.quantityUnit)}</p>
              </div>
            )}
            {group.totalSlots && (
              <div className="flex items-center justify-between">
                <p>Members</p>
                <p>
                  {memberCount} of {group.totalSlots}
                </p>
              </div>
            )}
            {deadline && (
              <div className="flex items-center justify-between">
                <p>Closes</p>
                <p>
                  {deadline}
                  {timeLeft && <span className="text-gray-500"> ({timeLeft})</span>}
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
            {group.isMember ? (
              <>
                <p className="mt-2 flex items-center gap-2 rounded-lg bg-primary-subtle px-3 py-2 font-medium text-primary">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  You&apos;re in this group{myShare > 0 && ` (${formatQuantity(myShare, group.quantityUnit)})`}
                </p>
                {canTopUp && <JoinForm group={group} topUp myShare={myShare} stock={stock} />}
              </>
            ) : status === "completed" ? (
              <p className="mt-2 rounded-lg bg-primary-subtle px-3 py-2 font-medium text-primary">
                Target reached: the order has gone to the farmer
              </p>
            ) : status === "cancelled" ? (
              <p className="mt-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-700">
                This group closed at its deadline without filling up. Members&apos; payments were refunded.
              </p>
            ) : isOpen ? (
              <JoinForm group={group} lastSlot={lastSlot} stock={stock} />
            ) : (
              <p className="mt-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-600">
                {isFull ? "This group is full" : "This group isn't taking members"}
              </p>
            )}
            {group.isCreator && !group.isMember && isOpen && (
              <p className="text-xs text-gray-500">
                You created this group: pay for your share to count towards the target.
              </p>
            )}
          </div>
        </div>

        <div className={CARD}>
          <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Group Details</h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-gray-500">Group ID</dt>
              <dd className="font-medium text-gray-900">{String(group.id ?? "-")}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Members</dt>
              <dd className="font-medium text-gray-900">{memberCount}</dd>
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

          {members.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900">Members</h3>
              <ul className="mt-2 divide-y divide-gray-100 text-sm">
                {members.map((member) => (
                  <li key={member.id} className="flex justify-between gap-3 py-2">
                    <span className="min-w-0 truncate">{member.user_name}</span>
                    <span className="shrink-0 text-gray-600">
                      {formatQuantity(member.quantity_committed, group.quantityUnit)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;

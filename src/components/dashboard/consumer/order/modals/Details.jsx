import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/shared";
import { TIMELINE_STEPS } from "../mock";
import { getBanner, getCurrentStepIndex, getTimelineStepProps } from "../utils";

const DetailsModal = ({ order, onClose, onReport, onMarkDelivered, isMarkingDelivered = false }) => {
  const currentStepIndex = getCurrentStepIndex(
    order.status.label,
    TIMELINE_STEPS
  );

  const banner = getBanner(order.status.label);
  const canMarkDelivered = order.status.label === "Awaiting Confirmation";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-4 sm:p-6">
          <div className="min-w-0 space-y-2">
            <div>
              <h2 id="order-details-title" className="break-words text-lg font-semibold text-gray-900 sm:text-xl">
                {order.product} ({order.qty} pcs)
              </h2>
              <p className="text-xs italic text-grey-300">
                Order #{order.id} : {order.farmer}
              </p>
            </div>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                color: order.status.textColor,
                backgroundColor: order.status.bgColor,
              }}
            >
              <order.status.icon size={14} aria-hidden="true" />
              {order.status.label}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-6 sm:p-6">
          {banner.show && (
            <div
              className="flex gap-2 rounded-lg p-4 text-sm"
              style={{
                backgroundColor: banner.bgColor,
                color: banner.iconColor,
              }}
            >
              <banner.icon color={banner.iconColor} size={20} className="shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">{banner.firstText}</p>
                <p>{banner.secondText}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <section className="rounded-xl border border-gray-200 p-4 text-grey-300">
            <h3 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">
              Order Timeline
            </h3>

            {TIMELINE_STEPS.map((step, idx) => {
              const stepLabel =
                step.label === "Awaiting Confirmation" &&
                order.status.label === "Delivery Issue - Pending Review"
                  ? "Delivery Issue - Pending Review"
                  : step.label;

              const { IconComponent, iconColor, borderColor, bgColor } =
                getTimelineStepProps(idx, currentStepIndex, order.status);

              return (
                <div key={step.label} className="relative flex items-center gap-3">
                  <div className="relative flex flex-col items-center">
                    {idx !== 0 && (
                      <div
                        className="h-4 w-px border-l-2 border-dashed"
                        style={{ borderColor }}
                      />
                    )}

                    <div
                      className="z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border"
                      style={{ borderColor, backgroundColor: bgColor }}
                    >
                      <IconComponent color={iconColor} size={20} aria-hidden="true" />
                    </div>

                    {idx !== TIMELINE_STEPS.length - 1 && (
                      <div
                        className="h-4 w-px border-l-2 border-dashed"
                        style={{ borderColor }}
                      />
                    )}
                  </div>

                  <div className="flex min-h-[30px] flex-col justify-center text-gray-900">
                    <p className="text-sm font-medium">{stepLabel}</p>
                    {step.subLabel && (
                      <p className="mt-0.5 text-xs text-grey-300">{step.subLabel}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </section>

          {/* Items */}
          <section className="rounded-xl border border-gray-200 p-4 text-grey-300">
            <h3 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">Items</h3>
            <ul className="ml-5 list-disc">
              <li>
                {order.qty}x {order.product}
              </li>
            </ul>
          </section>

          {/* Delivery */}
          <section className="rounded-xl border border-gray-200 p-4 text-grey-300">
            <h3 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">Delivery</h3>
            <p className="break-words">Address: {order.delivery.address}</p>
            <p>Contact: {order.delivery.contact}</p>
          </section>

          {/* Action Buttons */}
          {order.status.label !== "Delivered" && (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={onReport} className="h-10 py-0">
                Report a problem
              </Button>
              <Button
                onClick={onMarkDelivered}
                disabled={!canMarkDelivered || isMarkingDelivered}
                className="h-10 py-0"
              >
                {isMarkingDelivered ? "Confirming..." : "Mark as delivered"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DetailsModal;

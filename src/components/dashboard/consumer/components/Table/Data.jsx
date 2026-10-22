import { getOrderStatusColor, getOrderStatusLabel } from "@/lib/farmerOrder";

const Data = ({ props, isChecked, onToggle }) => {
  const { orderNumber, farmName, date, status } = props;

  return (
    <>
      <td>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => onToggle?.()}
            className="h-4 w-4 accent-primary"
            aria-label={`Select order ${orderNumber}`}
          />
          <span className="font-medium text-gray-900">{orderNumber}</span>
        </label>
      </td>
      <td className="whitespace-nowrap">{farmName}</td>
      <td className="whitespace-nowrap">{date}</td>
      <td>
        <span
          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrderStatusColor(status)}`}
        >
          {getOrderStatusLabel(status)}
        </span>
      </td>
    </>
  );
};

export default Data;

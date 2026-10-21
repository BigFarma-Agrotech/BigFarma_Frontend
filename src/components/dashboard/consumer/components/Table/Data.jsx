import { getStatusClasses, getStatusText } from "@/utils";

const Data = ({ props, isChecked, onToggle }) => {
  const { id, farmName, date, status } = props;

  return (
    <>
      <td>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => onToggle?.()}
            className="h-4 w-4 accent-primary"
            aria-label={`Select order #${id}`}
          />
          <span className="font-medium text-gray-900">#{id}</span>
        </label>
      </td>
      <td className="whitespace-nowrap">{farmName}</td>
      <td className="whitespace-nowrap">{date}</td>
      <td>
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(status)}`}
        >
          {getStatusText(status)}
        </span>
      </td>
    </>
  );
};

export default Data;

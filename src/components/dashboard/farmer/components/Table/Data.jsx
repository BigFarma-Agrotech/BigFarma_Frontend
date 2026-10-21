import { Link } from "react-router-dom";
import fallbackImage from "../../../../../assets/ProductImages/watermelon.png";

const Data = ({ order }) => {
  const { image, product, price, quantity, location, path, originalData } = order;

  return (
    <>
      <td>
        <div className="flex items-center gap-3">
          <img
            src={image || fallbackImage}
            alt=""
            className="h-10 w-10 shrink-0 rounded-lg object-cover"
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
          />
          <p className="font-medium text-gray-900">{product}</p>
        </div>
      </td>
      <td>{quantity}</td>
      <td>{price}</td>
      <td className="max-w-[16rem] truncate" title={location}>
        {location}
      </td>
      <td>
        <Link
          to={path}
          state={{ order: originalData }}
          className="inline-flex rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200"
        >
          View Details
        </Link>
      </td>
    </>
  );
};

export default Data;

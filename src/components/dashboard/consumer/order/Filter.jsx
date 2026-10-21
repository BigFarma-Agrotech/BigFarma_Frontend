import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";

const STATUS_OPTIONS = [
  "All",
  "Placed",
  "Shipping In Progress",
  "Awaiting Confirmation",
  "Delivery Issue - Pending Review",
  "Delivered",
  "Cancelled",
];

const OrderFilter = ({ onSearch, onFilter }) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const dropdownRef = useRef(null);

  const handleSelect = (status) => {
    setSelectedStatus(status);
    setShowDropdown(false);
    onFilter(status);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="relative w-full sm:max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Search orders, farmer, order ID"
          aria-label="Search orders"
          className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-base focus:border-primary-light focus:outline-none"
        />
      </div>

      <div className="relative flex w-full items-center gap-2 sm:w-auto" ref={dropdownRef}>
        <span className="whitespace-nowrap text-sm text-gray-600">Filter:</span>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={showDropdown}
          className="flex h-12 min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-4 text-left text-sm sm:w-72 sm:flex-none"
          onClick={() => setShowDropdown((prev) => !prev)}
        >
          <span className="truncate">{selectedStatus}</span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={`shrink-0 transition-transform ${showDropdown ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-30 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg sm:w-72"
            >
              {STATUS_OPTIONS.map((status) => (
                <li key={status} role="option" aria-selected={status === selectedStatus}>
                  <button
                    type="button"
                    onClick={() => handleSelect(status)}
                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                      status === selectedStatus ? "font-medium text-primary" : ""
                    }`}
                  >
                    {status}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderFilter;

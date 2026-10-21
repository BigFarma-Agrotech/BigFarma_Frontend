import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import flags from "emoji-flags";

const Dropdown = ({ countries = [], onSelect, isOpen, onToggle }) => {
  const [selected, setSelected] = useState(null);
  const dropdownRef = useRef(null);

  const handleSelect = (country) => {
    setSelected(country);
    onSelect(country);
  };
  //Close countries dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        if (isOpen) onToggle(); //closes toggle when open
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div ref={dropdownRef} className="relative w-10">
      {/* Toggle Button */}
      <div
        className="py-1 rounded cursor-pointer bg-white flex items-center justify-between text-xl"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {selected ? selected.flag : flags.countryCode("NG").emoji}
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {/* Animated Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="absolute left-0 top-full z-20 mt-2 max-h-72 w-64 max-w-[calc(100vw-3rem)] overflow-y-auto rounded-lg bg-white py-1 shadow-lg"
          >
            {countries.map((country, id) => (
              <button
                type="button"
                key={id}
                className="flex w-full items-center gap-2 px-3 py-2 text-left font-normal text-neutral hover:bg-[#e9e9e9]"
                onClick={() => handleSelect(country)}
              >
                <span>{country.flag}</span>
                <span className="truncate">{country.name}</span>
                <span className="ml-auto text-sm font-extralight">
                  {country.code}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;

import { useState } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import {
  AVAILABILITY_OPTIONS,
  CATEGORY_OPTIONS,
  EMPTY_FILTERS,
} from "@/components/dashboard/marketplace/filters";

const toggleValue = (list, value) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

const CheckboxOption = ({ checked, onChange, label }) => (
  <label className="flex cursor-pointer items-center gap-3">
    <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
    <span
      aria-hidden="true"
      className={`flex h-5 w-5 items-center justify-center rounded border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-light ${
        checked ? "border-primary bg-primary" : "border-gray-300"
      }`}
    >
      {checked && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
    </span>
    <span className="text-gray-700">{label}</span>
  </label>
);

const Section = ({ id, title, count, expanded, onToggle, children }) => (
  <div className="overflow-hidden rounded-lg border-2 border-gray-300">
    <button
      type="button"
      onClick={() => onToggle(id)}
      aria-expanded={expanded}
      aria-controls={`filter-${id}`}
      className="flex w-full items-center justify-between bg-gray-50 px-4 py-4 text-left"
    >
      <span className="text-lg text-gray-600">
        {title}
        {count > 0 && <span className="ml-2 text-sm font-medium text-primary">({count})</span>}
      </span>
      <ChevronDown
        aria-hidden="true"
        className={`h-5 w-5 text-gray-600 transition-transform ${expanded ? "rotate-180" : ""}`}
      />
    </button>
    {expanded && (
      <div id={`filter-${id}`} className="space-y-3 bg-white px-4 py-4">
        {children}
      </div>
    )}
  </div>
);

/**
 * Marketplace filter panel. Keeps a draft of the filters locally and only
 * hands them to the parent when "Apply Filters" is pressed.
 */
export default function FiltersComponent({
  setFilterOpen,
  initialFilters = EMPTY_FILTERS,
  onApply,
  locationOptions = [],
}) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [draft, setDraft] = useState(() => ({ ...EMPTY_FILTERS, ...initialFilters }));
  const [priceError, setPriceError] = useState("");

  const toggleSection = (section) =>
    setExpandedSection((prev) => (prev === section ? null : section));

  const toggle = (key, value) =>
    setDraft((prev) => ({ ...prev, [key]: toggleValue(prev[key], value) }));

  const clearAll = () => {
    setDraft(EMPTY_FILTERS);
    setPriceError("");
    setExpandedSection(null);
  };

  const handleClose = () => setFilterOpen?.(false);

  const applyFilters = () => {
    const price = String(draft.maxPrice).trim();
    if (price !== "" && (!Number.isFinite(Number(price)) || Number(price) < 0)) {
      setPriceError("Enter a valid price");
      setExpandedSection("maxPrice");
      return;
    }
    onApply?.({ ...draft, maxPrice: price });
    handleClose();
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close filters"
              className="text-gray-900 hover:text-gray-600"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Filters</h1>
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="text-base text-gray-500 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-3">
          <Section
            id="category"
            title="Category"
            count={draft.categories.length}
            expanded={expandedSection === "category"}
            onToggle={toggleSection}
          >
            {CATEGORY_OPTIONS.map((category) => (
              <CheckboxOption
                key={category}
                label={category}
                checked={draft.categories.includes(category)}
                onChange={() => toggle("categories", category)}
              />
            ))}
          </Section>

          <Section
            id="availability"
            title="Availability"
            count={draft.availability.length}
            expanded={expandedSection === "availability"}
            onToggle={toggleSection}
          >
            {AVAILABILITY_OPTIONS.map(({ value, label }) => (
              <CheckboxOption
                key={value}
                label={label}
                checked={draft.availability.includes(value)}
                onChange={() => toggle("availability", value)}
              />
            ))}
          </Section>

          <Section
            id="location"
            title="Location"
            count={draft.locations.length}
            expanded={expandedSection === "location"}
            onToggle={toggleSection}
          >
            {locationOptions.length === 0 ? (
              <p className="text-sm text-gray-500">No locations available</p>
            ) : (
              locationOptions.map((location) => (
                <CheckboxOption
                  key={location}
                  label={location}
                  checked={draft.locations.includes(location)}
                  onChange={() => toggle("locations", location)}
                />
              ))
            )}
          </Section>

          <Section
            id="maxPrice"
            title="Max Price"
            count={draft.maxPrice !== "" ? 1 : 0}
            expanded={expandedSection === "maxPrice"}
            onToggle={toggleSection}
          >
            <label htmlFor="filter-max-price" className="sr-only">
              Max price in Naira
            </label>
            <input
              id="filter-max-price"
              type="number"
              min="0"
              inputMode="numeric"
              value={draft.maxPrice}
              onChange={(e) => {
                setPriceError("");
                setDraft((prev) => ({ ...prev, maxPrice: e.target.value }));
              }}
              placeholder="Enter max price (₦)"
              aria-invalid={Boolean(priceError)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-light focus:outline-none"
            />
            {priceError && <p className="text-sm text-red-600">{priceError}</p>}
          </Section>
        </div>

        <button
          type="button"
          onClick={applyFilters}
          className="mt-6 w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

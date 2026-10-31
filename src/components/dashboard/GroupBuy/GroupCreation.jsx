import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, ChevronDown, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GroupData } from "@/lib/GroupBuy";
import { fetchGroups, normalizeGroup } from "@/lib/groupBuyApi";
import { getStatusText, getStatusClasses } from "@/utils/GroupBuyStatus";
import { Skeleton } from "@/components/shared";

const CATEGORIES = ["Vegetable", "Fruits", "Grains", "Livestock", "Root", "Oil", "Nuts"];
const LOCATIONS = ["Kano", "Lagos", "Jos", "Edo", "Delta", "Enugu", "Cross River"];

// "Vegetables" / "vegetable" / " Vegetable " all compare equal
const normalizeLabel = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/s$/, "");

// "Kano, Nigeria" -> "Kano"
const primaryLocation = (value) => String(value ?? "").split(",")[0].trim();

const mergeOptions = (base, extra) => {
  const seen = new Set(base.map(normalizeLabel));
  const merged = [...base];
  extra.forEach((value) => {
    if (value && !seen.has(normalizeLabel(value))) {
      seen.add(normalizeLabel(value));
      merged.push(value);
    }
  });
  return merged;
};

const toggleValue = (list, value) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

const FilterDropdown = ({ id, label, options, selected, onChange, isOpen, onToggle }) => (
  <div className="w-full rounded-lg border border-gray-300 bg-white sm:max-w-xs">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={`${id}-options`}
      className="flex h-12 w-full items-center justify-between gap-2 rounded-lg px-4 text-left text-sm hover:bg-gray-50"
    >
      <span className={selected.length ? "font-medium text-primary" : ""}>
        {selected.length ? `${label} (${selected.length})` : `All ${label}`}
      </span>
      <ChevronDown
        size={18}
        aria-hidden="true"
        className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          id={`${id}-options`}
          key={`${id}-dropdown`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-2 gap-1 border-t border-gray-200 p-3">
            {options.map((item) => (
              <label key={item} className="flex cursor-pointer items-center gap-2 p-1.5 text-sm">
                <input
                  type="checkbox"
                  name={item}
                  checked={selected.includes(item)}
                  onChange={() => onChange(toggleValue(selected, item))}
                  className="h-4 w-4 accent-primary"
                />
                {item}
              </label>
            ))}
          </div>
          {selected.length > 0 && (
            <div className="border-t border-gray-200 px-3 py-2 text-right">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-sm text-red-600 underline hover:text-red-700"
              >
                Clear
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const GroupCardSkeleton = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-4">
    <Skeleton className="aspect-[4/3] w-full rounded-lg" />
    <Skeleton className="mt-4 h-5 w-2/3 rounded" />
    <Skeleton className="mt-2 h-4 w-1/3 rounded" />
    <Skeleton className="mt-4 h-2 w-full rounded-full" />
    <Skeleton className="mt-4 h-10 w-full rounded-lg" />
  </div>
);

const GroupCard = ({ group }) => (
  <article className="flex flex-col rounded-xl border border-gray-200 bg-white p-4">
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
        <img loading="lazy" decoding="async" src={group.image} alt={group.name} className="h-full w-full object-contain" />
      ) : (
        <Users size={40} aria-hidden="true" className="text-gray-300" />
      )}
    </div>

    <div className="mt-4 flex flex-1 flex-col gap-2 text-sm text-gray-700">
      <h2 className="break-words text-base font-semibold text-gray-900">{group.name}</h2>
      {group.location && <p>{group.location}</p>}
      {group.price !== null && (
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-900">₦{group.price.toLocaleString()}</p>
          <p>per slot</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <p>Progress</p>
        <p>
          {group.totalSlots !== null
            ? `${group.takenSlots ?? 0}/${group.totalSlots} slots`
            : `${group.progress}%`}
        </p>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-label={`${group.name} progress`}
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
      {group.deadline && String(group.status).toLowerCase() === "active" && (
        <p>Closes {new Date(group.deadline).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</p>
      )}
      <Link
        to={`/group-buy/${group.id}`}
        className="mt-auto inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary font-medium text-white transition-colors hover:bg-primary-dark"
      >
        View Details & Join
      </Link>
    </div>
  </article>
);

const GroupCreation = () => {
  const [openCategory, setOpenCategory] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
    refetchOnWindowFocus: false,
  });

  // Fall back to the bundled sample groups when the API can't be reached
  const usingSampleData = isError;
  const groups = useMemo(
    () => (usingSampleData ? GroupData : data ?? []).map(normalizeGroup),
    [data, usingSampleData]
  );

  const categoryOptions = useMemo(
    () => mergeOptions(CATEGORIES, groups.map((g) => g.category)),
    [groups]
  );
  const locationOptions = useMemo(
    () => mergeOptions(LOCATIONS, groups.map((g) => primaryLocation(g.location))),
    [groups]
  );

  const filteredGroups = useMemo(() => {
    const categories = selectedCategories.map(normalizeLabel);
    const locations = selectedLocations.map(normalizeLabel);
    return groups.filter((group) => {
      const categoryOk =
        categories.length === 0 || categories.includes(normalizeLabel(group.category));
      const locationOk =
        locations.length === 0 ||
        locations.includes(normalizeLabel(primaryLocation(group.location)));
      return categoryOk && locationOk;
    });
  }, [groups, selectedCategories, selectedLocations]);

  const hasFilters = selectedCategories.length > 0 || selectedLocations.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Group Buy</h1>
          <p className="text-sm text-gray-600">
            Join group purchases to get better prices on quality goods
          </p>
        </div>
        <Link
          to="/group-buy/create"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <Plus size={20} aria-hidden="true" />
          Create A Group
        </Link>
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row">
        <FilterDropdown
          id="group-category"
          label="Categories"
          options={categoryOptions}
          selected={selectedCategories}
          onChange={setSelectedCategories}
          isOpen={openCategory}
          onToggle={() => setOpenCategory((prev) => !prev)}
        />
        <FilterDropdown
          id="group-location"
          label="Locations"
          options={locationOptions}
          selected={selectedLocations}
          onChange={setSelectedLocations}
          isOpen={openLocation}
          onToggle={() => setOpenLocation((prev) => !prev)}
        />
      </div>

      {usingSampleData && (
        <p className="rounded-lg bg-secondary-light px-4 py-2 text-sm text-secondary-dark">
          We couldn&apos;t load live groups right now, so you&apos;re seeing sample groups.
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <GroupCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          <p>{hasFilters ? "No groups match your filters." : "No groups yet. Be the first to create one!"}</p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategories([]);
                setSelectedLocations([]);
              }}
              className="text-sm text-red-600 underline hover:text-red-700"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {filteredGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupCreation;

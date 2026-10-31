import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Button from "@/components/shared/Button";
import FiltersComponent from "@/lib/filterOptions";
import { fetchProducts } from "@/lib/api";
import filterIcon from "@/assets/icons/filter.svg";
import vegetablesCategory from "@/assets/ProductImages/categories/vegetables.png";
import fruitsCategory from "@/assets/ProductImages/categories/fruits.png";
import grainsCategory from "@/assets/ProductImages/categories/grains.png";
import proteinCategory from "@/assets/ProductImages/categories/protein.png";
import ProductsList from "./product-list";
import {
  EMPTY_FILTERS,
  AVAILABILITY_OPTIONS,
  countActiveFilters,
  filterProducts,
  getLocationOptions,
  normalizeProducts,
} from "./filters";

const TOP_PRODUCTS_LIMIT = 8;

const categories = [
  { id: 1, name: "Vegetables", image: vegetablesCategory },
  { id: 2, name: "Fruits", image: fruitsCategory },
  { id: 3, name: "Grains", image: grainsCategory },
  { id: 4, name: "Protein", image: proteinCategory },
];

const slides = [
  {
    id: 1,
    title: "Up to 10% offer",
    subtitle: "Enjoy our big offer.",
    image: "/marketplaceSlider/1_.webp",
    bg: "bg-[#9affa1]",
    titleColor: "text-neutral-dark",
    subtitleColor: "text-neutral-dark",
    button: "bg-primary text-white hover:bg-primary-dark",
  },
  {
    id: 2,
    title: "Up to 5% offer",
    subtitle: "On first buyers.",
    image: "/marketplaceSlider/2_.webp",
    bg: "bg-primary-dark",
    titleColor: "text-white",
    subtitleColor: "text-white",
    button: "bg-white text-neutral-dark hover:bg-gray-100",
  },
  {
    id: 3,
    title: "Up to 15% offer",
    subtitle: "Enjoy our big offer.",
    image: "/marketplaceSlider/3_.webp",
    bg: "bg-secondary",
    titleColor: "text-neutral-dark",
    subtitleColor: "text-primary",
    button: "bg-primary text-white hover:bg-primary-dark",
  },
];

const availabilityLabel = (value) =>
  AVAILABILITY_OPTIONS.find((option) => option.value === value)?.label || value;

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showAll, setShowAll] = useState(false);
  const productsRef = useRef(null);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const products = useMemo(() => normalizeProducts(data), [data]);
  const locationOptions = useMemo(() => getLocationOptions(products), [products]);
  const filteredProducts = useMemo(
    () => filterProducts(products, { filters, query }),
    [products, filters, query]
  );

  const activeFilterCount = countActiveFilters(filters);
  const isFiltering = activeFilterCount > 0 || Boolean(query);
  // Unfiltered, this section is "Top Products": show a preview until "View all".
  const isLimited = !showAll && !isFiltering;
  const visibleProducts = isLimited
    ? filteredProducts.slice(0, TOP_PRODUCTS_LIMIT)
    : filteredProducts;

  // Clicking a tile filters to that category; clicking it again clears it.
  const selectCategory = (name) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.length === 1 && prev.categories[0] === name ? [] : [name],
    }));
  };

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("q");
    setSearchParams(next, { replace: true });
  };

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    if (query) clearSearch();
  };

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activeChips = [
    ...filters.categories,
    ...filters.availability.map(availabilityLabel),
    ...filters.locations,
    ...(filters.maxPrice !== "" ? [`Up to ₦${Number(filters.maxPrice).toLocaleString()}`] : []),
  ];

  let sectionTitle = "Top Products";
  if (query) sectionTitle = `Results for "${query}"`;
  else if (activeFilterCount > 0) sectionTitle = "Filtered Products";
  else if (showAll) sectionTitle = "All Products";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Marketplace</h1>
        <p className="text-sm text-gray-600">Buy fresh produce directly from farmers</p>
      </div>

      {/* Promo slider */}
      <section className="min-w-0">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={16}
          slidesPerView={1}
          breakpoints={{ 1024: { slidesPerView: 1.4, spaceBetween: 20 } }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          loop={true}
          className="w-full"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div
                className={`relative flex h-48 w-full items-center overflow-hidden rounded-xl px-6 sm:h-60 sm:px-10 lg:h-72 lg:px-14 ${slide.bg}`}
              >
                <div className="relative z-10 flex max-w-full flex-col gap-2 sm:max-w-[55%] sm:gap-3">
                  <h2 className={`text-2xl font-bold sm:text-3xl lg:text-4xl ${slide.titleColor}`}>
                    {slide.title}
                  </h2>
                  <p className={`text-base sm:text-xl ${slide.subtitleColor}`}>{slide.subtitle}</p>
                  <button
                    type="button"
                    onClick={scrollToProducts}
                    className={`h-10 w-fit rounded-lg px-6 font-semibold transition-colors sm:h-12 sm:px-10 ${slide.button}`}
                  >
                    Buy Now
                  </button>
                </div>
                <img
                  src={slide.image}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 right-0 hidden h-full max-w-[50%] object-contain object-right-bottom sm:block"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Explore categories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Explore Categories</h2>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className="h-10 border-2 px-4 py-0 sm:px-6"
          >
            <img src={filterIcon} alt="" aria-hidden="true" className="h-5 w-5" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {categories.map((category) => {
            const isActive = filters.categories.includes(category.name);
            return (
              <button
                type="button"
                key={category.id}
                onClick={() => selectCategory(category.name)}
                aria-pressed={isActive}
                className={`flex min-w-0 items-center gap-3 rounded-xl border bg-white p-3 text-left transition-colors sm:gap-4 sm:p-4 ${
                  isActive
                    ? "border-primary ring-1 ring-primary"
                    : "border-gray-200 hover:border-primary-light"
                }`}
              >
                <img
                  src={category.image}
                  alt=""
                  aria-hidden="true"
                  className="h-10 w-12 shrink-0 rounded-lg object-contain sm:h-14 sm:w-16"
                />
                <span className="truncate text-sm font-medium text-gray-900 sm:text-base md:text-lg">
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {filterOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setFilterOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="flex max-h-[90vh] w-full max-w-md justify-center overflow-y-auto rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <FiltersComponent
              setFilterOpen={setFilterOpen}
              initialFilters={filters}
              onApply={setFilters}
              locationOptions={locationOptions}
            />
          </div>
        </div>
      )}

      {/* Product list */}
      <section ref={productsRef} className="scroll-mt-24 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="min-w-0 break-words text-lg font-semibold text-gray-900 sm:text-xl">
            {sectionTitle}
          </h2>
          {!isFiltering && filteredProducts.length > TOP_PRODUCTS_LIMIT && (
            <Button
              variant="ghost"
              onClick={() => setShowAll((prev) => !prev)}
              className="h-auto shrink-0 p-0 text-sm font-medium text-primary hover:text-primary-dark sm:text-base"
            >
              {showAll ? "Show less" : `View all (${filteredProducts.length})`}
            </Button>
          )}
        </div>

        {isFiltering && !isLoading && !error && products.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <p className="text-gray-600">
              {filteredProducts.length} result{filteredProducts.length === 1 ? "" : "s"}
            </p>
            {query && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-800">
                &ldquo;{query}&rdquo;
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="text-gray-500 hover:text-gray-900"
                >
                  &times;
                </button>
              </span>
            )}
            {activeChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-primary-subtle px-2.5 py-0.5 font-medium text-primary"
              >
                {chip}
              </span>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="text-red-600 underline hover:text-red-700"
            >
              Clear all
            </button>
          </div>
        )}

        <ProductsList
          products={visibleProducts}
          hasProducts={products.length > 0}
          // isLoading is only true on the first load, so also show the skeleton
          // while Retry refetches from the error / empty state
          isLoading={isLoading || (isFetching && (Boolean(error) || products.length === 0))}
          error={error}
          onRetry={() => refetch({ cancelRefetch: true })}
          emptyMessage={
            query ? `No products found for "${query}"` : "No products match your filters"
          }
        />
      </section>
    </div>
  );
};

export default Marketplace;

const MarketplaceSlider = () => {
  return (
    <div className="flex min-h-48 w-full items-center justify-start rounded-lg bg-[#9affa1] px-6 py-8 sm:min-h-64 sm:px-12 lg:h-[300px] lg:w-2/3 lg:px-20 lg:py-10">
      <div className="flex flex-col gap-3">
        <h4 className="text-2xl font-bold text-neutral-dark sm:text-3xl lg:text-4xl">
          Up to 10% offer
        </h4>
        <p className="text-base sm:text-xl">Enjoy our big offer.</p>
        <button
          type="button"
          className="w-fit rounded-lg bg-primary px-8 py-3 font-semibold text-white hover:bg-primary-dark sm:px-10"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default MarketplaceSlider;

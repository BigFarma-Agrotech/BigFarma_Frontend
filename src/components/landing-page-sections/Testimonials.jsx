import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { reviewers } from "../../lib/reviewers";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

const arrowButtonClass =
  "group pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-grey-100 bg-white text-grey-300 shadow-lg transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-xl";

const Testimonials = () => {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateEdges = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const handleSwiper = (swiper) => {
    swiperRef.current = swiper;
    updateEdges(swiper);
  };

  const goNext = () => swiperRef.current?.slideNext();
  const goPrev = () => swiperRef.current?.slidePrev();

  return (
    <section id="testimonials" className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl md:mb-12 lg:text-4xl">
          Testimonials
        </h2>

        <div className="relative overflow-hidden">
          {/* Faded edges (desktop only) */}
          <div className="pointer-events-none absolute top-0 left-0 z-10 hidden h-full w-12 bg-linear-to-r from-white to-transparent lg:block" />
          <div className="pointer-events-none absolute top-0 right-0 z-10 hidden h-full w-12 bg-linear-to-l from-white to-transparent lg:block" />

          {/* Custom navigation arrows (desktop only) */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-between px-4 lg:flex">
            {!isBeginning ? (
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous testimonial"
                className={arrowButtonClass}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : (
              <span />
            )}
            {!isEnd && (
              <button
                type="button"
                onClick={goNext}
                aria-label="Next testimonial"
                className={arrowButtonClass}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>

          <Swiper
            modules={[Navigation, Autoplay]}
            onSwiper={handleSwiper}
            onSlideChange={updateEdges}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            spaceBetween={12}
            slidesPerView={1}
            grabCursor={true}
            breakpoints={{
              768: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
            }}
          >
            {reviewers.map((reviewer) => (
              <SwiperSlide key={reviewer.id} className="h-auto!">
                <div className="mx-auto flex h-full w-full flex-col items-center justify-start gap-5 rounded-xl bg-white px-4 pt-4 pb-8">
                  <img
                    src={reviewer.profileImage}
                    alt={`Photo of ${reviewer.name}`}
                    className="h-24 w-24 rounded-full object-cover shadow-2xl"
                  />
                  <p className="max-w-xs text-center text-base text-grey-300 italic">
                    {reviewer.review}
                  </p>
                  <div className="flex flex-col items-center justify-center text-center font-bold">
                    <p className="text-lg">{reviewer.name}</p>
                    <p className="text-sm text-grey-300">
                      {reviewer.additionalDetails}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

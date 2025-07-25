import React from "react";
import { Link } from "react-router-dom";
import bgBack from "../assets/images/bg-image-back.png";
import bgFront from "../assets/images/bigfarma-brandimage.png";
import { ArrowDown } from "lucide-react";

const Home = () => {
  return (
    <section className=" w-full min-h-screen flex flex-col items-center justify-evenly sm:flex-row px-0 sm:px-6 relative">
      <div className="w-full max-w-[40rem] h-[20rem] sm:h-[35rem] ">
        {/* Brand TagLine */}
        <div className="flex flex-col gap-3 m-4 ">
          <span className=" bg-[var(--color-primary-transparent)] w-[4.5rem] h-[2rem] text-[var(--color-primary)] text-base py-3.5 px-1.5 font-bold leading-[0.34]">
            We Are
          </span>
          <div
            className="font-extrabold text-[2rem] sm:text-[55px] text-[var(--color-primary)] leading-snug break-word
"
          >
            Empowering Farmers <br />
            Connecting Markets <br />
            Growing Agriculture
          </div>
          <span className="italic text-base sm:text-[18px] text-[var(--color-primary)] ">
            Transforming Africa’s agro business
          </span>
          <Link
            to="sign-up"
            className="bg-[var(--color-primary)] text-[var(--color-neutral-light)] w-[9rem] h-[2.5rem] sm:w-[18rem] sm:h-[4rem] flex justify-center items-center rounded-lg text-sm sm:text-2xl leading-none font-bold"
          >
            Create an account
          </Link>
        </div>

        {/* Arrow Down */}
        <Link
          to="/next-page"
          className="w-[2.5rem] h-[2.5rem] border-1 border-[var(--color-secondary)] bg-[var(--color-secondary-transparent)] flex items-center justify-center rounded-full sm:w-[4rem] sm:h-[4rem] absolute sm:bottom-1/10 sm:left-1/15 bottom-2 left-2"
        >
          <ArrowDown className="text-[var(--color-secondary-dark)]" />
        </Link>
      </div>

      {/* Brand  Image */}
      <div className="w-full max-w-[40rem] h-[33rem] sm:h-[35rem] flex justify-center mt-4">
        <div className="w-full h-[23rem] sm:w-[35rem] sm:h-[38rem] pr-3 relative">
          <img
            src={bgBack}
            alt="backImage"
            className="w-full h-full object-contain"
          />
          <img
            src={bgFront}
            alt="frontImage"
            className="absolute left-1/2 transform -translate-x-1/2 top-1/16  sm:w-full sm:h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Home;

import { Link } from "react-scroll";
import { NavLink } from "react-router-dom";
import { ArrowDown } from "lucide-react";
import bgFront from "../../assets/images/bigfarma-brandimage.webp";
import bgBack from "../../assets/images/bg-image-back.png";

const Hero = () => {
  return (
    <section id="home" className="w-full overflow-hidden">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 md:py-16 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-2 lg:gap-12 lg:px-8">
        {/* Tagline */}
        <div className="flex flex-col items-start gap-4 sm:gap-5">
          <span className="inline-flex w-fit rounded-md bg-primary-transparent px-3 py-1.5 text-sm font-bold text-primary sm:text-base">
            We Are
          </span>
          <h1 className="text-3xl leading-tight font-extrabold text-primary sm:text-4xl md:text-5xl xl:text-6xl">
            <span className="block">Empowering Farmers</span>
            <span className="block">Connecting Markets</span>
            <span className="block">Growing Agriculture</span>
          </h1>
          <p className="text-base text-primary italic sm:text-lg">
            Transforming Africa&apos;s agro business
          </p>
          <NavLink
            to="/role"
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow transition-colors hover:bg-primary-dark sm:text-lg"
          >
            Create an account
          </NavLink>

          <Link
            to="about-us"
            href="#about-us"
            smooth={true}
            duration={500}
            aria-label="Scroll to About Us"
            className="mt-4 hidden h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-secondary bg-secondary-transparent shadow-md transition-transform hover:translate-y-0.5 sm:flex lg:mt-10 lg:h-14 lg:w-14"
          >
            <ArrowDown className="text-secondary-dark" aria-hidden="true" />
          </Link>
        </div>

        {/* Image */}
        <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-lg">
          <img
            src={bgBack}
            alt=""
            aria-hidden="true"
            className="mx-auto block h-auto w-4/5 drop-shadow-lg"
          />
          <img
            src={bgFront}
            alt="Smiling woman holding a basket of fresh fruit"
            className="absolute bottom-0 left-1/2 h-auto w-[92%] -translate-x-1/2 drop-shadow-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;

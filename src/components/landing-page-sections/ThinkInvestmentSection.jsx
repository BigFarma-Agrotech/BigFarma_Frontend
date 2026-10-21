import { Link } from "react-router-dom";
import bgImage from "../../assets/svgs/InvestmentBg.svg";

export default function ThinkInvestment() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-primary">
          <img
            src={bgImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="relative flex flex-col items-center px-6 py-12 text-center text-white sm:px-10 md:py-20">
            <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
              Think Investment, Think BigFarma
            </h2>
            <div className="mt-4 max-w-xl space-y-1 text-base md:mt-6 md:text-lg">
              <p>Grow your money while supporting real farmers.</p>
              <p>
                Choose verified farm projects, track your returns, and invest
                with confidence.
              </p>
            </div>
            <Link
              to="/sign-in"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary-subtle"
            >
              Start investing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

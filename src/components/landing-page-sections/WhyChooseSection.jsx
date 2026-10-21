import { Link } from "react-router-dom";
import flowerIcon from "../../assets/icons/flower.svg";
import cartIcon from "../../assets/icons/cart.svg";
import mobileIcon from "../../assets/icons/mobile.svg";

function FeatureCard({ title, description, image, bgColor }) {
  return (
    <div
      className={`${bgColor} flex h-full min-h-60 flex-col justify-center p-6 text-white shadow-sm md:min-h-80 md:p-8`}
    >
      <img src={image} alt="" aria-hidden="true" className="mb-6 h-12 w-12" />
      <h3 className="mb-2 text-xl font-semibold md:text-2xl">{title}</h3>
      <p className="text-base leading-relaxed md:text-lg">{description}</p>
    </div>
  );
}

const featureItems = [
  {
    title: "Made for Farmers",
    image: flowerIcon,
    description:
      "Farm and do what you do best, BigFarma will take care of the rest: sales, payments and the distribution of fresh produce.",
    bgColor: "bg-primary",
  },
  {
    title: "Great for Buyers",
    image: cartIcon,
    description:
      "We save you money and time, and streamline the procurement of fresh produce.",
    bgColor: "bg-primary-light",
  },
  {
    title: "Modular Platform",
    image: mobileIcon,
    description: "Expandable for finance, logistics, and investment.",
    bgColor: "bg-primary",
  },
];

export default function WhyChooseSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl md:mb-12 lg:text-4xl">
          Why Choose BigFarma
        </h2>

        <div className="mb-8 grid gap-6 md:mb-12 lg:grid-cols-3">
          {featureItems.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/role"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Create an account
          </Link>
        </div>
      </div>
    </section>
  );
}

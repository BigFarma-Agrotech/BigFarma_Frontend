import marketplaceIcon from "../../assets/icons/marketplace.svg";
import investmentIcon from "../../assets/icons/investment.svg";
import logisticsIcon from "../../assets/icons/logistics.svg";
import insightsIcon from "../../assets/icons/insights.svg";

function WorkCard({ title, description, image, bgColor, textColor }) {
  return (
    <div
      className={`${bgColor} ${textColor} flex h-full min-h-44 flex-col justify-center p-6 shadow-sm md:min-h-72 md:p-8`}
    >
      <img loading="lazy" decoding="async" src={image} alt="" aria-hidden="true" className="mb-4 h-12 w-12" />
      <h3 className="mb-2 text-xl font-semibold md:text-2xl">{title}</h3>
      <p className="text-base md:text-lg">{description}</p>
    </div>
  );
}

const workItems = [
  {
    title: "Marketplace",
    image: marketplaceIcon,
    description: "Farmers list products, buyers order directly on the platform.",
    bgColor: "bg-primary",
    textColor: "text-white",
  },
  {
    title: "Investment Hub",
    image: investmentIcon,
    description: "Individuals invest in farms with transparency.",
    bgColor: "bg-secondary",
    textColor: "text-secondary-dark",
  },
  {
    title: "Logistics Integration",
    image: logisticsIcon,
    description: "Enjoy reliable farm-to-door delivery.",
    bgColor: "bg-primary-light",
    textColor: "text-white",
  },
  {
    title: "Insights & Alerts",
    image: insightsIcon,
    description: "Stay ahead with weather, pest, and disease alerts.",
    bgColor: "bg-secondary-dark",
    textColor: "text-secondary-light",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl md:mb-12 lg:text-4xl">
          How BigFarma Works
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {workItems.map((item) => (
            <WorkCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

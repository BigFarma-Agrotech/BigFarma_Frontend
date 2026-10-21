import { useState, useRef, useEffect, useId } from "react";
import openIcon from "../../assets/icons/open.svg";
import closeIcon from "../../assets/icons/close.svg";

const faqs = [
  {
    question: "What can I do with BigFarma?",
    answer:
      "You can sell or buy farm produce, invest in farm projects, access helpful tools, and manage deliveries all in one place.",
  },
  {
    question: "Are the people on BigFarma verified?",
    answer:
      "Yes. Every user is verified so you can feel safe whether you're selling, buying, or investing.",
  },
  {
    question: "Is it safe to make payments on BigFarma?",
    answer:
      "Yes. Payments are secure, and every transaction is tracked with clear receipts and updates.",
  },
  {
    question: "What kind of support does BigFarma offer?",
    answer:
      "You can sell or buy farm produce, invest in farm projects, access helpful tools, and manage deliveries all in one place.",
  },
  {
    question: "Can I use BigFarma without a smartphone?",
    answer:
      "Yes. You can use BigFarma through the web app, USSD, or even WhatsApp if you prefer.",
  },
  {
    question: "How does investment on BigFarma work?",
    answer:
      "You choose a verified farm project, invest, track its progress, and receive returns based on the plan you select.",
  },
];

function AccordionItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  const [maxHeight, setMaxHeight] = useState("0px");
  const contentRef = useRef(null);
  const panelId = useId();

  const toggleAccordion = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (contentRef.current) {
      setMaxHeight(isOpen ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [isOpen]);

  return (
    <div className="w-full overflow-hidden rounded-lg border border-primary">
      <button
        type="button"
        onClick={toggleAccordion}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left font-semibold transition-colors md:px-6 md:py-4 ${
          isOpen ? "bg-primary text-white" : "hover:bg-primary-subtle"
        }`}
      >
        <span className="text-sm md:text-base">{question}</span>
        <img
          src={isOpen ? closeIcon : openIcon}
          alt=""
          aria-hidden="true"
          className="h-4 w-4 shrink-0"
        />
      </button>

      <div
        id={panelId}
        ref={contentRef}
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight }}
      >
        <div className="bg-primary px-4 pb-4 text-sm text-white md:px-6 md:text-base">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function FAQsSection() {
  return (
    <section id="faqs" className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl md:mb-12 lg:text-4xl">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((data) => (
            <AccordionItem
              key={data.question}
              question={data.question}
              answer={data.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

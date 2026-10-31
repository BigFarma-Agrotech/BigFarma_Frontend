import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  AboutUsSection,
  HowItWorksSection,
  WhyChooseSection,
  ThinkInvestment,
  NavBar,
  Hero,
  FAQsSection,
  ContactUs,
  Footer,
} from "./index";

// The testimonial slider is far down the page and brings in Swiper (~100 KB of
// script), so it's only downloaded when the visitor scrolls near it
const Testimonials = lazy(() => import("./Testimonials"));

const WhenNearViewport = ({ children, placeholder }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (visible || !el) return undefined;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);
  return visible ? children : <div ref={ref}>{placeholder}</div>;
};

// Keeps the #testimonials anchor for nav links while the slider loads
const testimonialsPlaceholder = <section id="testimonials" className="min-h-96" />;

const Home = () => {
  return (
    <>
      <div className="w-full bg-white lg:bg-[url('./assets/images/Background-Image.webp')] lg:bg-cover lg:bg-center">
        <NavBar />
        <Hero />
      </div>

      <main>
        <AboutUsSection />
        <HowItWorksSection />
        <WhyChooseSection />
        <ThinkInvestment />
        <FAQsSection />
        <WhenNearViewport placeholder={testimonialsPlaceholder}>
          <Suspense fallback={testimonialsPlaceholder}>
            <Testimonials />
          </Suspense>
        </WhenNearViewport>
        <ContactUs />
      </main>

      <Footer />
    </>
  );
};

export default Home;

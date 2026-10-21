import { lazy, Suspense } from "react";
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

// The testimonial slider is far down the page and brings in Swiper, so load it
// after the rest of the page
const Testimonials = lazy(() => import("./Testimonials"));

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
        {/* Placeholder keeps the #testimonials anchor for nav links while loading */}
        <Suspense fallback={<section id="testimonials" className="min-h-96" />}>
          <Testimonials />
        </Suspense>
        <ContactUs />
      </main>

      <Footer />
    </>
  );
};

export default Home;

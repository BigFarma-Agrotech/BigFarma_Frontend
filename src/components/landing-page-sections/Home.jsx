import {
  AboutUsSection,
  HowItWorksSection,
  WhyChooseSection,
  ThinkInvestment,
  NavBar,
  Hero,
  FAQsSection,
  Testimonials,
  ContactUs,
  Footer,
} from "./index";

const Home = () => {
  return (
    <>
      <div className="w-full bg-white lg:bg-[url('./assets/images/Background-Image.png')] lg:bg-cover lg:bg-center">
        <NavBar />
        <Hero />
      </div>

      <main>
        <AboutUsSection />
        <HowItWorksSection />
        <WhyChooseSection />
        <ThinkInvestment />
        <FAQsSection />
        <Testimonials />
        <ContactUs />
      </main>

      <Footer />
    </>
  );
};

export default Home;

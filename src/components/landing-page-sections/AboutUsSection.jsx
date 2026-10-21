import aboutUsImage from "../../assets/svgs/about.svg";

export default function AboutUsSection() {
  return (
    <section id="about-us" className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <img
            src={aboutUsImage}
            alt="Farmers with fresh produce"
            className="order-2 mx-auto h-auto w-full max-w-md lg:order-1 lg:max-w-none"
          />

          <div className="order-1 space-y-6 lg:order-2">
            <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
              About Us
            </h2>
            <div className="space-y-4 text-base leading-relaxed md:text-lg">
              <p>
                BigFarma is a digital platform that connects farmers and
                consumers in one simple app. Farmers sell produce, access
                finance, and get farming support, while consumers buy fresh
                farm products and invest directly in verified farm projects.
              </p>

              <p>
                With our marketplace, investment hub, delivery network, and
                advisory tools, BigFarma makes farming profitable and food more
                accessible across Nigeria.
              </p>

              <p>
                Our vision is to be the leading platform that makes farming
                simple and food accessible across Nigeria. We believe in
                creating a transparent, efficient agricultural value chain
                where farmers, consumers, and investors all succeed together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

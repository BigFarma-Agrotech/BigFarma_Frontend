// Search metadata for every route. Plain JS (only importing other plain JS)
// because vite.config.js also reads it at build time to write a static HTML
// file per public page and the sitemap.

import { SOCIAL_LINKS } from "./social.js";

export const SITE_URL = "https://bigfarma.ng";
export const SITE_NAME = "BigFarma";
export const OG_IMAGE = `${SITE_URL}/logo.png`;

const DEFAULT_DESCRIPTION =
  "BigFarma connects farmers and consumers in Nigeria. Farmers sell produce, access finance and get farming support. Consumers buy fresh farm products and invest in verified farm projects.";

// Public pages Google should index. Order matters for the sitemap.
export const publicPages = {
  "/": {
    title: "BigFarma | Buy Fresh Farm Produce Direct from Farmers in Nigeria",
    description: DEFAULT_DESCRIPTION,
    priority: "1.0",
  },
  "/sign-in": {
    title: "Log In | BigFarma",
    description:
      "Log in to your BigFarma account to manage your farm products, orders, wallet and investments.",
    priority: "0.9",
  },
  "/role": {
    title: "Sign Up | BigFarma - Join as a Farmer or Consumer",
    description:
      "Create a free BigFarma account. Join as a farmer to sell your produce, or as a consumer to buy fresh farm products directly from farmers.",
    priority: "0.9",
  },
  "/sign-up/farmer": {
    title: "Sign Up as a Farmer | BigFarma",
    description:
      "Join BigFarma as a farmer. List and sell your farm produce to buyers across Nigeria, access farm finance and get farming support.",
    priority: "0.8",
  },
  "/sign-up/consumer": {
    title: "Sign Up as a Consumer | BigFarma",
    description:
      "Join BigFarma as a consumer. Buy fresh farm produce directly from verified farmers, join group buys and invest in farm projects.",
    priority: "0.8",
  },
  "/support": {
    title: "Support | BigFarma",
    description: "Get help with your BigFarma account, orders and payments.",
    priority: "0.5",
  },
};

// Pages that exist outside the dashboard but shouldn't appear in search results
const noindexPages = {
  "/sign-up": { title: "Sign Up | BigFarma", canonical: "/role" },
  "/forgot-password": { title: "Forgot Password | BigFarma" },
  "/otp": { title: "Verify Code | BigFarma" },
  "/verify-otp": { title: "Verify Code | BigFarma" },
  "/reset-password": { title: "Reset Password | BigFarma" },
  "/success": { title: "Success | BigFarma" },
};

// Returns the metadata for a path. Anything unlisted (the dashboard) is noindex.
export const getSeo = (pathname) => {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const page = publicPages[path];
  if (page) {
    return { ...page, canonical: `${SITE_URL}${path === "/" ? "/" : path}`, noindex: false };
  }
  const hidden = noindexPages[path];
  return {
    title: hidden?.title || SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    canonical: hidden?.canonical ? `${SITE_URL}${hidden.canonical}` : null,
    noindex: true,
  };
};

// Structured data for the home page: names the site "BigFarma" in results and
// points Google at the logo and the main entry points.
export const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: OG_IMAGE,
      description: DEFAULT_DESCRIPTION,
      email: "support@bigfarma.ng",
      sameAs: Object.values(SOCIAL_LINKS).map(({ url }) => url),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: ["Big Farma", "bigfarma.ng"],
      url: `${SITE_URL}/`,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "ItemList",
      name: "BigFarma",
      itemListElement: [
        ["Log In", "/sign-in"],
        ["Sign Up", "/role"],
        ["Sign Up as a Farmer", "/sign-up/farmer"],
        ["Sign Up as a Consumer", "/sign-up/consumer"],
      ].map(([name, path], i) => ({
        "@type": "SiteNavigationElement",
        position: i + 1,
        name,
        url: `${SITE_URL}${path}`,
      })),
    },
  ],
};

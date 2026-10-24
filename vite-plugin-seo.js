import fs from "fs";
import path from "path";
import {
  getSeo,
  homeJsonLd,
  OG_IMAGE,
  publicPages,
  SITE_NAME,
  SITE_URL,
} from "./src/lib/seo.js";

// Routes that get their own static HTML file, so crawlers see the right
// title, description and canonical before any JavaScript runs
const PRERENDERED_ROUTES = [
  ...Object.keys(publicPages),
  "/sign-up",
  "/forgot-password",
  "/otp",
  "/verify-otp",
  "/reset-password",
  "/success",
];

const START = "<!-- seo:start -->";
const END = "<!-- seo:end -->";

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const renderHead = (route) => {
  const seo = getSeo(route);
  const url = seo.canonical || `${SITE_URL}${route}`;
  const tags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="robots" content="${seo.noindex ? "noindex, follow" : "index, follow"}" />`,
    seo.canonical && `<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
    route === "/" &&
      `<script type="application/ld+json">${JSON.stringify(homeJsonLd)}</script>`,
  ];
  return [START, ...tags.filter(Boolean), END].join("\n    ");
};

const renderSitemap = () => {
  const urls = Object.entries(publicPages).map(
    ([route, { priority }]) =>
      `  <url>\n    <loc>${SITE_URL}${route}</loc>\n    <priority>${priority}</priority>\n  </url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
};

// Fills the <!-- seo --> placeholder in index.html with the home page tags,
// then after the build writes one HTML file per public route plus sitemap.xml.
// vercel.json's cleanUrls serves dist/sign-in.html at /sign-in.
export default function seoPlugin() {
  let outDir;
  return {
    name: "bigfarma-seo",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html) {
      return html.replace("<!-- seo -->", renderHead("/"));
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: renderSitemap() });
    },
    writeBundle() {
      const indexHtml = fs.readFileSync(path.join(outDir, "index.html"), "utf8");
      const block = new RegExp(`${START}[\\s\\S]*?${END}`);
      for (const route of PRERENDERED_ROUTES) {
        if (route === "/") continue;
        const file = path.join(outDir, `${route.slice(1)}.html`);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, indexHtml.replace(block, renderHead(route)));
      }
    },
  };
}

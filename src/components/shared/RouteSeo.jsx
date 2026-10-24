import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getSeo, SITE_URL } from "@/lib/seo";

// Finds the head tag matching `selector`, creating it if needed, and sets attr
const setTag = (selector, create, attr, value) => {
  let el = document.head.querySelector(selector);
  if (!value) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement(create.tag);
    Object.entries(create.attrs).forEach(([k, v]) => el.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const meta = (key, value, keyAttr = "name") =>
  setTag(`meta[${keyAttr}="${key}"]`, { tag: "meta", attrs: { [keyAttr]: key } }, "content", value);

// Keeps the title and search tags in step with the route during in-app
// navigation. The first load already has them from the static HTML.
const RouteSeo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = getSeo(pathname);
    document.title = seo.title;
    meta("description", seo.description);
    meta("robots", seo.noindex ? "noindex, follow" : "index, follow");
    meta("og:title", seo.title, "property");
    meta("og:description", seo.description, "property");
    meta("og:url", seo.canonical || `${SITE_URL}${pathname}`, "property");
    meta("twitter:title", seo.title);
    meta("twitter:description", seo.description);
    setTag('link[rel="canonical"]', { tag: "link", attrs: { rel: "canonical" } }, "href", seo.canonical);
  }, [pathname]);

  return null;
};

export default RouteSeo;

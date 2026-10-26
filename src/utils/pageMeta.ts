const SITE_URL = "https://glitchbooth.online";

function upsert(
  selector: string,
  create: () => HTMLElement,
  attr: string,
  value: string,
) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

const setMeta = (key: string, content: string, attr: "name" | "property" = "name") =>
  upsert(
    `meta[${attr}="${key}"]`,
    () => {
      const m = document.createElement("meta");
      m.setAttribute(attr, key);
      return m;
    },
    "content",
    content,
  );

export function applyPageMeta(opts: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}) {
  const path = opts.path === "/" ? "/" : opts.path.replace(/\/+$/, "");
  const url = `${SITE_URL}${path}`;
  document.title = opts.title;
  setMeta("description", opts.description);
  setMeta("og:title", opts.title, "property");
  setMeta("og:description", opts.description, "property");
  setMeta("og:url", url, "property");
  setMeta("robots", opts.noindex ? "noindex, follow" : "index, follow");
  upsert(
    'link[rel="canonical"]',
    () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    },
    "href",
    url,
  );
}


import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://glitchbooth.online";
const DIST = "dist";

// KEEP IN SYNC with your routes and event slugs.
const ROUTES = [
  {
    path: "/archive",
    title: "Archive — GLITCH BOOTH",
    description: "Browse captures from the Glitch Booth archive.",
  },
  {
    path: "/events",
    title: "Event Directory — GLITCH BOOTH",
    description: "Events where the Glitch Booth has appeared.",
  },
  {
    path: "/synthistan2026",
    title: "Synthistan 2026 — GLITCH BOOTH",
    description: "Glitch Booth captures from Synthistan 2026.",
  },
  {
    path: "/watergardencaw2026",
    title: "Watergarden CAW 2026 — GLITCH BOOTH",
    description: "Glitch Booth captures from Watergarden CAW 2026.",
  },
  {
    path: "/testfest",
    title: "TEST FEST — GLITCH BOOTH",
    description: "Glitch Booth TEST captures.",
  },
];

const html = readFileSync(join(DIST, "index.html"), "utf8");
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function setTag(doc, regex, tag) {
  return regex.test(doc)
    ? doc.replace(regex, () => tag)
    : doc.replace("</head>", () => `  ${tag}\n</head>`);
}

function render({ path, title, description }) {
  const url = `${SITE}${path}`;
  let doc = html;
  // Remove leftover malformed text after the OG title meta tag

  doc = doc.replace(
    /(<meta\s+property=["']og:title["'][^>]*>)\s*GLITCHBOOTH"\s*\/>/i,
    "$1",
  );

  doc = setTag(
    doc,
    /<title>[\s\S]*?<\/title>/i,
    `<title>${esc(title)}</title>`,
  );
  doc = setTag(
    doc,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${esc(description)}" />`,
  );
  doc = setTag(
    doc,
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${url}" />`,
  );
  doc = setTag(
    doc,
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${esc(title)}" />`,
  );
  doc = setTag(
    doc,
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${esc(description)}" />`,
  );
  doc = setTag(
    doc,
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${url}" />`,
  );
  return doc;
}

for (const route of ROUTES) {
  const dir = join(DIST, route.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), render(route));
}
console.log(`Prerendered metadata for ${ROUTES.length} routes`);

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://glitchbooth.online";
const DIST = "dist";
const EVENTS_DIR = "src/events_pages";
const IMAGES_API_PATH = "api/images.ts";

// Static routes that are always prerendered
const STATIC_ROUTES = [
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
];

function parseEventConfig(filePath) {
  const content = readFileSync(filePath, "utf8");

  // Extract slug: `const SLUG = "..."` or `slug: "..."`
  let slug = null;
  const slugConstMatch = content.match(/const\s+SLUG\s*=\s*["']([^"']+)["']/);
  if (slugConstMatch) {
    slug = slugConstMatch[1];
  } else {
    const slugPropMatch = content.match(/\bslug:\s*["']([^"']+)["']/);
    if (slugPropMatch) slug = slugPropMatch[1];
  }

  if (!slug) return null;

  // Extract display name: cardTitle wins, fallback to name, fallback to slug
  const cardTitleMatch = content.match(/\bcardTitle:\s*["']([^"']+)["']/);
  const nameMatch = content.match(/\bname:\s*["']([^"']+)["']/);
  const displayName = cardTitleMatch ? cardTitleMatch[1] : (nameMatch ? nameMatch[1] : slug);
  const title = `${displayName} — GLITCH BOOTH`;

  // Extract description
  let description = `Glitch Booth captures from ${displayName}.`;
  const descMatch = content.match(/\bdescription:\s*(`[\s\S]*?`|"[\s\S]*?"|'[\s\S]*?')/);
  if (descMatch) {
    const rawDesc = descMatch[1].slice(1, -1).trim();
    const firstPara = rawDesc.split(/\n\s*\n/)[0].replace(/\s+/g, " ");
    if (firstPara.length > 0) {
      description = firstPara.length > 160 ? `${firstPara.slice(0, 157)}...` : firstPara;
    }
  }

  return { slug, displayName, title, description };
}

function discoverEvents() {
  if (!existsSync(EVENTS_DIR)) return [];
  const entries = readdirSync(EVENTS_DIR, { withFileTypes: true });
  const events = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith("_") || entry.name.startsWith(".")) {
      continue;
    }
    const configPath = join(EVENTS_DIR, entry.name, "event.config.ts");
    if (!existsSync(configPath)) continue;

    const event = parseEventConfig(configPath);
    if (event) {
      events.push(event);
    }
  }

  return events;
}

function syncApiImages(events) {
  if (!existsSync(IMAGES_API_PATH)) return;

  const currentContent = readFileSync(IMAGES_API_PATH, "utf8");
  // Sort events alphabetically by slug
  const sortedEvents = [...events].sort((a, b) => a.slug.localeCompare(b.slug));
  const entriesFormatted = sortedEvents
    .map((e) => `  [${JSON.stringify(e.slug)}, ${JSON.stringify(e.displayName)}],`)
    .join("\n");
  const newMapBlock = `const ALLOWED_EVENTS = new Map<string, string>([\n${entriesFormatted}\n]);`;

  // Matches either ALLOWED_EVENTS Map or legacy ALLOWED_EVENT_SLUGS Set
  const regex = /const\s+(?:ALLOWED_EVENTS|ALLOWED_EVENT_SLUGS)\s*=\s*new\s+(?:Map(?:<string,\s*string>)?|Set)\(\[\s*[\s\S]*?\s*\]\);/;
  if (!regex.test(currentContent)) {
    console.warn("Could not find ALLOWED_EVENTS pattern in api/images.ts");
    return;
  }

  const updatedContent = currentContent.replace(regex, newMapBlock);
  if (updatedContent !== currentContent) {
    writeFileSync(IMAGES_API_PATH, updatedContent, "utf8");
    console.log(`Updated api/images.ts with events:\n${entriesFormatted}`);
  } else {
    console.log("api/images.ts is already in sync with discovered events.");
  }
}

const discoveredEvents = discoverEvents();
syncApiImages(discoveredEvents);

const eventRoutes = discoveredEvents.map((e) => ({
  path: `/${e.slug}`,
  title: e.title,
  description: e.description,
}));

const ROUTES = [...STATIC_ROUTES, ...eventRoutes];

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

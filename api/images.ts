// Capture IDs are Unix-epoch milliseconds minted by the booth
// (server.py: int(time.time_ns() // 1000000)), so the ID is the true capture time.
// (Duplicated from src/utils/captureTime.ts because /api is bundled separately.)
function timestampFromCaptureId(id: string): string | undefined {
  if (!/^\d{13}$/.test(id)) return undefined;
  const ms = Number(id);
  if (ms < 1577836800000 || ms > 4102444800000) return undefined;
  return new Date(ms).toISOString();
}

// Event folders this API is allowed to list, with the name shown in posts.
// KEEP IN SYNC with the `slug` in each events_pages/*/event.config.ts. Anything else
// gets a 404, so unpublished folders under /booth_captures/ can never be enumerated.
// To add an event: add one line here (slug, then display name).
const ALLOWED_EVENTS = new Map<string, string>([
  ["synthistan2026", "SYNTHISTAN 2026"],
  ["watergardencaw2026", "WATERGARDEN COMICS & ARTS WEEKEND 2026"],
  ["testfest", "TEST FEST"],
  ["gist2026", "GAMING ISTANBUL 2026"],
  ["icaf2026", "ISTANBUL COMICS AND ARTS FESTIVAL 2026"],
  ["icf2026", "12TH ISTANBUL COFFEE FESTIVAL 2026"],
]);

// Old events whose captures were never moved into their own ImageKit folder
// (ImageKit refused the move). Their captures stay in the root folder and are
// picked by capture time instead. Dates are Istanbul days, both ends included.
// These slugs must ALSO exist in ALLOWED_EVENTS above (the build keeps that one
// in sync). Not touched by prerender-routes.mjs.
const DATE_EVENTS = new Map<string, { from: string; to: string }>([
  ["icaf2026", { from: "2026-06-13", to: "2026-06-14" }],
  ["icf2026", { from: "2026-09-10", to: "2026-09-13" }],
  ["gist2026", { from: "2026-09-18", to: "2026-09-20" }],
]);


const LIST_URL = "https://api.imagekit.io/v1/files";
const PAGE_MAX = 100; // per page for events and the home first page
const ALL_MAX = 1000; // ImageKit's per-request maximum
const CACHE_OK = "public, s-maxage=60, stale-while-revalidate=120";
// Date-based events are in the past, so their lists never change.
const CACHE_FROZEN = "public, s-maxage=3600, stale-while-revalidate=86400";
const DATE_EVENT_MEMORY_MS = 10 * 60 * 1000;

const captureMs = (file: any): number => {
  const id = String(file?.name ?? "").replace("_color.jpg", "").replace(".jpg", "");
  return /^\d{13}$/.test(id) ? Number(id) : NaN;
};

const inRange = (ms: number, range: { from: string; to: string }) =>
  ms >= Date.parse(`${range.from}T00:00:00.000+03:00`) &&
  ms <= Date.parse(`${range.to}T23:59:59.999+03:00`);

// Root listings leave out captures that belong to a date-based event, as if
// they had been moved into that event's folder.
const dropDateEventFiles = (files: any[]) =>
  files.filter((file) => {
    const ms = captureMs(file);
    if (Number.isNaN(ms)) return true;
    for (const range of DATE_EVENTS.values()) if (inRange(ms, range)) return false;
    return true;
  });

// Kept in memory while the server instance stays warm, so "load more" on an
// event page does not list ImageKit again.
const dateEventMemory = new Map<string, { at: number; files: any[] }>();

const firstValue = (value: unknown): string | undefined => {
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === "string" ? v : undefined;
};

const parseCount = (value: string | undefined): number | undefined =>
  value !== undefined && /^\d+$/.test(value)
    ? Math.min(Number(value), 100_000)
    : undefined;

const isCaptureFile = (file: any) =>
  file?.type !== "folder" &&
  typeof file?.url === "string" &&
  typeof file?.name === "string";

const formatFile = (file: any) => {
  const cleanId = file.name.replace("_color.jpg", "").replace(".jpg", "");
  // True capture time from the ID; ImageKit's createdAt (upload time) is the fallback.
  const captureIso = timestampFromCaptureId(cleanId) ?? file.createdAt ?? "";
  return {
    id: cleanId,
    url: file.url,
    filename: file.name,
    title: `CAPTURE_${cleanId}`,
    date: captureIso.split("T")[0],
    timestamp: captureIso,
  };
};

// Keep real captures only, drop duplicate IDs (e.g. `<id>.jpg` next to
// `<id>_color.jpg`), newest first.
function toImages(files: any[]) {
  const seen = new Set<string>();
  const images: ReturnType<typeof formatFile>[] = [];
  for (const file of files) {
    if (!isCaptureFile(file)) continue;
    const image = formatFile(file);
    if (seen.has(image.id)) continue;
    seen.add(image.id);
    images.push(image);
  }
  return images.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export default async function handler(req: any, res: any) {
  // Event list mode (?events=1): slugs and display names only, no ImageKit call.
  if (firstValue(req.query?.events) !== undefined) {
    res.setHeader("Cache-Control", CACHE_OK);
    return res.status(200).json({
      events: Array.from(ALLOWED_EVENTS, ([slug, name]) => ({ slug, name })),
    });
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    console.error("IMAGEKIT_PRIVATE_KEY is missing");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const eventSlug = firstValue(req.query?.event)?.trim() || undefined;
  if (eventSlug && !ALLOWED_EVENTS.has(eventSlug)) {
    return res.status(404).json({ error: "Unknown event" });
  }

  const imageKitPath = eventSlug
    ? `/booth_captures/${eventSlug}/`
    : "/booth_captures/";
  const base64Auth = Buffer.from(`${privateKey}:`).toString("base64");

  // Lookup mode (?id=<id>): find ONE capture wherever it lives, so QR links keep
  // working after files are moved between ImageKit folders. Only the old root
  // folder and the allowed event folders are searched; anything else (including
  // /booth_captures_clean/) is ignored.
  const lookupId = firstValue(req.query?.id)?.trim();
  if (lookupId !== undefined) {
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(lookupId)) {
      return res.status(400).json({ error: "Bad id" });
    }
    try {
      const query = new URLSearchParams({
        type: "file",
        searchQuery: `name = "${lookupId}_color.jpg" OR name = "${lookupId}.jpg"`,
        limit: "20",
      });
      const response = await fetch(`${LIST_URL}?${query}`, {
        headers: { Authorization: `Basic ${base64Auth}` },
      });
      if (!response.ok) {
        throw new Error(`ImageKit responded with status ${response.status}`);
      }
      const found = await response.json();
      const matches = (Array.isArray(found) ? found : []).filter((file: any) => {
        if (!isCaptureFile(file) || typeof file.filePath !== "string") return false;
        const parts = file.filePath.split("/"); // ["", "booth_captures", ...folders, name]
        if (parts[1] !== "booth_captures") return false;
        return parts.length === 3 || (parts.length === 4 && ALLOWED_EVENTS.has(parts[2]));
      });
      // Prefer the mutated `_color.jpg` over a plain `<id>.jpg`.
      const match =
        matches.find((file: any) => file.name.endsWith("_color.jpg")) ?? matches[0];
      if (!match) {
        res.setHeader("Cache-Control", "public, s-maxage=30");
        return res.status(404).json({ error: "Capture not found" });
      }
      res.setHeader("Cache-Control", CACHE_OK);
      return res.status(200).json({ image: formatFile(match) });
    } catch (error: any) {
      console.error("images lookup failed:", error?.message);
      res.setHeader("Cache-Control", "no-store");
      return res.status(502).json({ error: "Image lookup unavailable" });
    }
  }

  const fetchFiles = async (skip: number, limit: number): Promise<any[]> => {
    const query = new URLSearchParams({
      path: imageKitPath,
      type: "file",
      sort: "DESC_CREATED",
      skip: String(skip),
      limit: String(limit),
    });
    const response = await fetch(`${LIST_URL}?${query}`, {
      headers: { Authorization: `Basic ${base64Auth}` },
    });
    if (!response.ok) {
      throw new Error(`ImageKit responded with status ${response.status}`);
    }
    const files = await response.json();
    return Array.isArray(files) ? files : [];
  };

  try {
    // Date-based event: its captures live in the root folder, picked by capture time.
    const dateRange = eventSlug ? DATE_EVENTS.get(eventSlug) : undefined;
    if (eventSlug && dateRange) {
      let files: any[];
      const remembered = dateEventMemory.get(eventSlug);
      if (remembered && Date.now() - remembered.at < DATE_EVENT_MEMORY_MS) {
        files = remembered.files;
      } else {
        const listAll = async (path: string) => {
          const all: any[] = [];
          for (let skip = 0; ; skip += ALL_MAX) {
            const query = new URLSearchParams({
              path,
              type: "file",
              sort: "DESC_CREATED",
              skip: String(skip),
              limit: String(ALL_MAX),
            });
            const response = await fetch(`${LIST_URL}?${query}`, {
              headers: { Authorization: `Basic ${base64Auth}` },
            });
            if (!response.ok) {
              throw new Error(`ImageKit responded with status ${response.status}`);
            }
            const batch = await response.json();
            const rows = Array.isArray(batch) ? batch : [];
            all.push(...rows);
            if (rows.length < ALL_MAX) break;
          }
          return all;
        };
        const rootFiles = await listAll("/booth_captures/");
        const ownFolderFiles = await listAll(`/booth_captures/${eventSlug}/`);
        files = [
          ...rootFiles.filter((file) => {
            const ms = captureMs(file);
            return !Number.isNaN(ms) && inRange(ms, dateRange);
          }),
          ...ownFolderFiles,
        ];
        dateEventMemory.set(eventSlug, { at: Date.now(), files });
      }

      const images = toImages(files);
      const pagedRequest =
        parseCount(firstValue(req.query?.skip)) !== undefined ||
        parseCount(firstValue(req.query?.limit)) !== undefined;
      res.setHeader("Cache-Control", CACHE_FROZEN);
      if (!pagedRequest) {
        return res.status(200).json({
          images: images.slice(0, ALL_MAX),
          hasMore: images.length > ALL_MAX,
        });
      }
      const skip = parseCount(firstValue(req.query?.skip)) ?? 0;
      const limit = Math.min(
        Math.max(parseCount(firstValue(req.query?.limit)) ?? PAGE_MAX, 1),
        PAGE_MAX,
      );
      const page = images.slice(skip, skip + limit);
      return res.status(200).json({
        images: page,
        hasMore: skip + limit < images.length,
        nextSkip: skip + page.length,
      });
    }

    const rawSkip = parseCount(firstValue(req.query?.skip));
    const rawLimit = parseCount(firstValue(req.query?.limit));

    // Paged mode: ONE upstream call. Ask for one extra record to learn
    // whether another page exists, and return a server-computed cursor.
    if (rawSkip !== undefined || rawLimit !== undefined) {
      const skip = rawSkip ?? 0;
      const limit = Math.min(Math.max(rawLimit ?? PAGE_MAX, 1), PAGE_MAX);
      const files = await fetchFiles(skip, limit + 1);
      const pageFiles = files.slice(0, limit);

      res.setHeader("Cache-Control", CACHE_OK);
      return res.status(200).json({
        images: toImages(eventSlug ? pageFiles : dropDateEventFiles(pageFiles)),
        hasMore: files.length > limit,
        nextSkip: skip + pageFiles.length, // raw upstream offset, not displayed count
      });
    }

    // Default mode: everything (up to 1000) in ONE upstream call.
    const files = await fetchFiles(0, ALL_MAX);
    res.setHeader("Cache-Control", CACHE_OK);
    return res.status(200).json({
      images: toImages(eventSlug ? files : dropDateEventFiles(files)),
      hasMore: files.length === ALL_MAX,
    });
  } catch (error: any) {
    console.error("images API failed:", error?.message);
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: "Image listing unavailable" });
  }
}

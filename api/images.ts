// Capture IDs are Unix-epoch milliseconds minted by the booth
// (server.py: int(time.time_ns() // 1000000)), so the ID is the true capture time.
// (Duplicated from src/utils/captureTime.ts because /api is bundled separately.)
function timestampFromCaptureId(id: string): string | undefined {
  if (!/^\d{13}$/.test(id)) return undefined;
  const ms = Number(id);
  if (ms < 1577836800000 || ms > 4102444800000) return undefined;
  return new Date(ms).toISOString();
}

// Event folders this API is allowed to list. KEEP IN SYNC with the `slug` in each
// events_pages/*/event.config.ts. Anything else gets a 404, so unpublished folders
// under /booth_captures/ can never be enumerated.
const ALLOWED_EVENT_SLUGS = new Set(["synthistan2026", "watergardencaw2026"]);

const LIST_URL = "https://api.imagekit.io/v1/files";
const PAGE_MAX = 100; // per page for events and the home first page
const ALL_MAX = 1000; // ImageKit's per-request maximum
const CACHE_OK = "public, s-maxage=30, stale-while-revalidate=120";

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
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    console.error("IMAGEKIT_PRIVATE_KEY is missing");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const eventSlug = firstValue(req.query?.event)?.trim() || undefined;
  if (eventSlug && !ALLOWED_EVENT_SLUGS.has(eventSlug)) {
    return res.status(404).json({ error: "Unknown event" });
  }

  const imageKitPath = eventSlug
    ? `/booth_captures/${eventSlug}/`
    : "/booth_captures/";
  const base64Auth = Buffer.from(`${privateKey}:`).toString("base64");

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
        images: toImages(pageFiles),
        hasMore: files.length > limit,
        nextSkip: skip + pageFiles.length, // raw upstream offset, not displayed count
      });
    }

    // Default mode: everything (up to 1000) in ONE upstream call.
    const files = await fetchFiles(0, ALL_MAX);
    res.setHeader("Cache-Control", CACHE_OK);
    return res.status(200).json({
      images: toImages(files),
      hasMore: files.length === ALL_MAX,
    });
  } catch (error: any) {
    console.error("images API failed:", error?.message);
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: "Image listing unavailable" });
  }
}

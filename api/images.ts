// Capture IDs are Unix-epoch milliseconds minted by the booth
// (server.py: int(time.time_ns() // 1000000)), so the ID is the true capture time.
// (Duplicated from src/utils/captureTime.ts because /api is bundled separately.)
function timestampFromCaptureId(id: string): string | undefined {
  if (!/^\d{13}$/.test(id)) return undefined;
  const ms = Number(id);
  if (ms < 1577836800000 || ms > 4102444800000) return undefined;
  return new Date(ms).toISOString();
}

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/i;

const isCaptureFile = (file: any) =>
  file?.type !== "folder" &&
  typeof file?.url === "string" &&
  typeof file?.name === "string";

// ISO strings sort lexicographically, so newest-first is a plain string compare.
const newestFirst = (a: any, b: any) => b.timestamp.localeCompare(a.timestamp);

function parseEventSkip(value: unknown): number | undefined {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  return Math.min(Number(value), 100_000);
}

function parseEventLimit(value: unknown): number {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return 100;
  return Math.min(Math.max(Number(value), 1), 100);
}

export default async function handler(req: any, res: any) {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = "https://api.imagekit.io/v1/files";

  if (!privateKey) {
    return res.status(500).json({
      error:
        "Server configuration error: IMAGEKIT_PRIVATE_KEY is missing from your .env file.",
    });
  }

  try {
    const rawEvent = Array.isArray(req.query?.event)
      ? req.query.event[0]
      : req.query?.event;

    const eventSlug =
      typeof rawEvent === "string" && rawEvent.trim().length > 0
        ? rawEvent.trim()
        : undefined;

    if (eventSlug && !SLUG_PATTERN.test(eventSlug)) {
      return res.status(400).json({ error: "Invalid event slug" });
    }

    const imageKitPath = eventSlug
      ? `/booth_captures/${eventSlug}/`
      : "/booth_captures/";

    const base64Auth = Buffer.from(`${privateKey}:`).toString("base64");

    const fetchFiles = async (skip: number, limit: number) => {
      const query = new URLSearchParams({
        path: imageKitPath,
        type: "file",
        sort: "DESC_CREATED",
        skip: String(skip),
        limit: String(limit),
      });

      const response = await fetch(`${urlEndpoint}?${query}`, {
        headers: {
          Authorization: `Basic ${base64Auth}`,
        },
      });

      if (!response.ok) {
        throw new Error(`ImageKit responded with status ${response.status}`);
      }

      return response.json();
    };

    const formatFile = (file: any) => {
      const cleanId = file.name.replace("_color.jpg", "").replace(".jpg", "");
      // True capture time from the ID; ImageKit's createdAt (upload time) is the fallback.
      const captureIso =
        timestampFromCaptureId(cleanId) ?? file.createdAt ?? "";
      return {
        id: cleanId,
        url: file.url,
        filename: file.name,
        title: `CAPTURE_${cleanId}`,
        date: captureIso.split("T")[0],
        timestamp: captureIso,
      };
    };

    const rawSkip = Array.isArray(req.query?.skip)
      ? req.query.skip[0]
      : req.query?.skip;
    const rawLimit = Array.isArray(req.query?.limit)
      ? req.query.limit[0]
      : req.query?.limit;

    // 1. If explicit skip is passed by client, perform single page query
    if (rawSkip !== undefined && rawSkip !== null && rawSkip !== "") {
      const skip = parseEventSkip(rawSkip) ?? 0;
      const limit = parseEventLimit(rawLimit);

      const [files, nextPageProbe] = await Promise.all([
        fetchFiles(skip, limit),
        fetchFiles(skip + limit, 1),
      ]);

      res.setHeader(
        "Cache-Control",
        "public, s-maxage=30, stale-while-revalidate=120",
      );
      return res.status(200).json({
        images: files.filter(isCaptureFile).map(formatFile).sort(newestFirst),
        hasMore: nextPageProbe.length > 0,
      });
    }

    // 2. Default fetch: Automatically loop through all ImageKit pages (batches of 100)
    let allFiles: any[] = [];
    let currentSkip = 0;
    const batchSize = 100;
    let hasMore = true;

    while (hasMore && allFiles.length < 1000) {
      const files = await fetchFiles(currentSkip, batchSize);
      if (!Array.isArray(files) || files.length === 0) {
        hasMore = false;
        break;
      }
      allFiles = allFiles.concat(files);

      if (files.length < batchSize) {
        hasMore = false;
      } else {
        currentSkip += batchSize;
      }
    }

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=120",
    );
    return res.status(200).json({
      images: allFiles.filter(isCaptureFile).map(formatFile).sort(newestFirst),
      hasMore,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

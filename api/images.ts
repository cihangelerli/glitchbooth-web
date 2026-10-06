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

    const imageKitPath = eventSlug
      ? `/booth_captures/${eventSlug}/`
      : "/booth_captures/";

    const base64Auth = Buffer.from(`${privateKey}:`).toString("base64");

    const fetchFiles = async (skip: number, limit: number) => {
      const query = new URLSearchParams({
        path: imageKitPath,
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
      return {
        id: cleanId,
        url: file.url,
        filename: file.name,
        title: `CAPTURE_${cleanId}`,
        date: file.createdAt.split("T")[0],
        timestamp: file.createdAt,
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

      return res.status(200).json({
        images: files.map(formatFile),
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

    return res.status(200).json({
      images: allFiles.map(formatFile),
      hasMore,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

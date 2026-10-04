export default async function handler(req: any, res: any) {
  // 1. Securely read the private key from your local .env file
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = "https://api.imagekit.io/v1/files";

  if (!privateKey) {
    return res.status(500).json({
      error:
        "Server configuration error: IMAGEKIT_PRIVATE_KEY is missing from your .env file.",
    });
  }

  try {
    // 2. Generate the Basic Authentication header ImageKit expects
    const base64Auth = Buffer.from(`${privateKey}:`).toString("base64");

    const fetchFiles = async (skip: number, limit: number) => {
      const query = new URLSearchParams({
        path: "/booth_captures/",
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

    const [files, nextPageProbe] = await Promise.all([
      fetchFiles(0, 1000),
      fetchFiles(1000, 1),
    ]);

    const formattedImages = files.map((file: any) => {
      const cleanId = file.name.replace("_color.jpg", "").replace(".jpg", "");

      return {
        id: cleanId,
        url: file.url,
        filename: file.name,
        title: `CAPTURE_${cleanId}`,
        date: file.createdAt.split("T")[0],
        timestamp: file.createdAt,
      };
    });

    return res.status(200).json({
      images: formattedImages,
      hasMore: nextPageProbe.length > 0,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

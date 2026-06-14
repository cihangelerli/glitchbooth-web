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

    // Fetch only images inside your booth_captures folder, sorted by newest first
    const imagekitResponse = await fetch(
      `${urlEndpoint}?path=/booth_captures/&sort=DESC_CREATED`,
      {
        headers: {
          Authorization: `Basic ${base64Auth}`,
        },
      },
    );

    if (!imagekitResponse.ok) {
      throw new Error(
        `ImageKit responded with status ${imagekitResponse.status}`,
      );
    }

    const files = await imagekitResponse.json();

    // 3. Reformat the payload into the clean structure your components are expecting
    const formattedImages = files.map((file: any) => {
      const cleanId = file.name.replace("_color.jpg", "").replace(".jpg", "");
      return {
        id: cleanId,
        url: file.url,
        name: file.name,
        title: `CAPTURE_${cleanId}`,
        date: file.createdAt.split("T")[0], // extracts YYYY-MM-DD for UI text components
        timestamp: file.createdAt, // PRESERVES HIGH-PRECISION TIME: Full ISO string for exact sorting
      };
    });

    // 4. Send the clean array safely back to your React frontend
    return res.status(200).json(formattedImages);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

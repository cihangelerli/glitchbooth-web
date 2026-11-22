// Asks the API where a capture lives right now (it may have been moved between
// ImageKit folders since a QR code was printed). Returns null if not found.
export interface CaptureLookup {
  url: string;
  filename?: string;
}

export async function lookupCapture(id: string): Promise<CaptureLookup | null> {
  try {
    const response = await fetch(`/api/images?id=${encodeURIComponent(id)}`);
    if (!response.ok) return null;
    const payload = await response.json();
    const image = payload?.image;
    return image && typeof image.url === "string"
      ? { url: image.url, filename: image.filename }
      : null;
  } catch {
    return null;
  }
}

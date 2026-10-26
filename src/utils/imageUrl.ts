// Returns a resized, compressed ImageKit rendition. Other URLs pass through unchanged.
// Use ONE width per context so the CDN caches each rendition once.
export function thumbUrl(url: string, width = 480, quality = 70): string {
  if (!url || !url.includes("ik.imagekit.io")) return url;
  return `${url.split("?")[0]}?tr=w-${width},q-${quality},f-webp`;
}


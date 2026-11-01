// Clean (unmutated) captures live in a sibling ImageKit folder:
//   /booth_captures/<id>_color.jpg        -> /booth_captures_clean/<id>_clean.jpg
//   /booth_captures/<event>/<id>_color.jpg -> /booth_captures_clean/<event>/<id>_clean.jpg
//
// Captures older than the first clean upload can never have a clean pair, so we
// skip them without making a request (no wasted 404s).
//
// TODO(launch): set this to the ID (13-digit ms timestamp) of the FIRST capture
// that has a clean file. While it is Infinity, the slider never appears.
// export const CLEAN_CAPTURES_SINCE_MS = Number.POSITIVE_INFINITY;
export const CLEAN_CAPTURES_SINCE_MS = 1793521165378;

export function getCleanUrl(image: { id: string; url: string }): string | null {
  if (!/^\d{13}$/.test(image.id)) return null;
  if (Number(image.id) < CLEAN_CAPTURES_SINCE_MS) return null;
  if (!image.url.includes("/booth_captures/")) return null;
  return image.url
    .split("?")[0]
    .replace("/booth_captures/", "/booth_captures_clean/")
    .replace(/[^/]+$/, `${image.id}_clean.jpg`);
}

export function compareFileName(id: string, mix: number): string {
  return mix <= 0 ? `${id}_clean.jpg` : `${id}_mix${mix}.jpg`;
}

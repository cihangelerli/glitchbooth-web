// Capture IDs are Unix-epoch milliseconds minted by the booth
// (server.py: int(time.time_ns() // 1000000)), so the ID is the true capture time.
export function timestampFromCaptureId(id: string): string | undefined {
  if (!/^\d{13}$/.test(id)) return undefined;
  const ms = Number(id);
  // Sanity window: 2020-01-01 .. 2100-01-01
  if (ms < 1577836800000 || ms > 4102444800000) return undefined;
  return new Date(ms).toISOString();
}

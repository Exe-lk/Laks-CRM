/**
 * Branch `location` is often saved as "lng, lat" from the map picker; avoid showing that as a second "address" line.
 */
export function isLikelyLatLngPair(text: string | null | undefined): boolean {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim();
  const m = t.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return false;
  const n1 = parseFloat(m[1]);
  const n2 = parseFloat(m[2]);
  if (!Number.isFinite(n1) || !Number.isFinite(n2)) return false;
  return Math.abs(n1) <= 180 && Math.abs(n2) <= 180;
}

/** Human-readable lines for branch details (no raw coordinates). */
export function getBranchAddressLines(
  address: string | null | undefined,
  location: string | null | undefined
): string[] {
  const addr = (address ?? '').trim();
  const loc = (location ?? '').trim();
  const addrIsCoord = isLikelyLatLngPair(addr);
  const locIsCoord = isLikelyLatLngPair(loc);

  if (addrIsCoord && !locIsCoord && loc) return [loc];
  if (addrIsCoord && !locIsCoord && !loc) return [];
  if (!addrIsCoord && addr) {
    const lines = [addr];
    if (loc && !locIsCoord && loc !== addr) lines.push(loc);
    return lines;
  }
  if (!addr && loc && !locIsCoord) return [loc];
  return [];
}

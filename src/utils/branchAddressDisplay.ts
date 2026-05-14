/**
 * Branch `location` is often saved as "lng, lat" from the map picker; avoid showing that as a second "address" line.
 */
export function isLikelyLatLngPair(text: string | null | undefined): boolean {
  if (!text || typeof text !== 'string') return false;
  const t = text.replace(/，/g, ',').trim();
  const m = t.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return false;
  const n1 = parseFloat(m[1]);
  const n2 = parseFloat(m[2]);
  if (!Number.isFinite(n1) || !Number.isFinite(n2)) return false;
  if (Math.abs(n1) > 180 || Math.abs(n2) > 180) return false;
  const looksDecimal = m[1].includes('.') || m[2].includes('.');
  if (!looksDecimal && Math.abs(n1) <= 90 && Math.abs(n2) <= 90) {
    return false;
  }
  return true;
}

function stripCoordLines(lines: string[]): string[] {
  return lines
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !isLikelyLatLngPair(l));
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

  let lines: string[] = [];

  if (addrIsCoord && !locIsCoord && loc) lines = [loc];
  else if (addrIsCoord && !locIsCoord && !loc) lines = [];
  else if (!addrIsCoord && addr) {
    lines = [addr];
    if (loc && !locIsCoord && loc !== addr) lines.push(loc);
  } else if (!addr && loc && !locIsCoord) lines = [loc];
  else if (addrIsCoord && locIsCoord) lines = [];
  else if (!addrIsCoord && !addr && loc) {
    lines = locIsCoord ? [] : [loc];
  }

  return stripCoordLines(lines);
}

/**
 * Booking `location` sometimes stores map coords; prefer branch or practice street address when it does.
 */
export function getBookingLocationDisplay(opts: {
  bookingLocation: string | null | undefined;
  branch?: { address?: string | null; location?: string | null } | null;
  practice?: { address?: string | null; location?: string | null } | null;
}): string {
  const raw = (opts.bookingLocation ?? '').trim();
  if (raw && !isLikelyLatLngPair(raw)) return raw;

  const branchLines = getBranchAddressLines(
    opts.branch?.address,
    opts.branch?.location
  );
  if (branchLines.length > 0) return branchLines.join(', ');

  const practiceLines = getBranchAddressLines(
    opts.practice?.address,
    opts.practice?.location
  );
  if (practiceLines.length > 0) return practiceLines.join(', ');

  if (raw) return raw;
  return 'Address not provided';
}

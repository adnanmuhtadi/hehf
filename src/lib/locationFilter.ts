/**
 * Build a PostgREST `.or()` filter matching any of the given locations.
 * Each value is wrapped in double quotes, so a location name containing a
 * comma or bracket (e.g. "Loughton, Essex") can't break the whole query.
 */
export function locationOrFilter(locations: string[]): string {
  return locations
    .map((loc) => loc.trim().replace(/["\\]/g, ''))
    .filter(Boolean)
    .map((loc) => `location.ilike."%${loc}%"`)
    .join(',');
}

/** Today's date as YYYY-MM-DD in the user's own time zone (not UTC). */
export function localToday(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

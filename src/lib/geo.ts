/** Schematic map coordinates (0-100 grid). Replace with real lat/lng + a map library (Leaflet/Mapbox) in production. */
export const CITIES: Record<string, [number, number]> = {
  Seattle: [12, 12], Denver: [38, 44], Dallas: [50, 72], Chicago: [66, 32], 'New York': [90, 28], Atlanta: [76, 64], Miami: [84, 90],
}
export const lerp = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
export const isoDate = (offset: number) => new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10)

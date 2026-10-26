export function googleMapsUrl(address: string, district?: string | null) {
  const query = [address, district, "Đà Nẵng"].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

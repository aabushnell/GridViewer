export function coordToIndexCoarse(lat, lon) {
  const y = 45 - Math.ceil((lat * 1) / 2);
  const x = (180 + Math.floor((lon * 1) / 2)) % 180;
  return [y, x];
}

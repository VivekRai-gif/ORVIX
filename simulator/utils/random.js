/**
 * Seedable Pseudo-Random Number Generator (Mulberry32)
 * Ensures 100% reproducible synthetic data generation when given the same seed.
 */

let currentSeed = 42;

export function setSeed(seed) {
  currentSeed = typeof seed === 'number' ? seed : parseInt(seed, 10) || 42;
}

export function random() {
  let t = (currentSeed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randomInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

export function randomFloat(min, max, decimals = 2) {
  const val = random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

export function choice(arr) {
  if (!arr || arr.length === 0) return null;
  const index = Math.floor(random() * arr.length);
  return arr[index];
}

export function weightedChoice(items) {
  // items: [{ value: 'X', weight: 40 }, { value: 'Y', weight: 60 }]
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let rand = random() * totalWeight;
  for (const item of items) {
    if (rand < item.weight) {
      return item.value;
    }
    rand -= item.weight;
  }
  return items[items.length - 1].value;
}

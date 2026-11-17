// Seeded random numbers (mulberry32): the state lives in a plain object so a run can be copied, replayed and hashed.
export function makeRng(seed) {
  const state = { value: Number(seed) >>> 0 };
  return {
    next() {
      state.value = (state.value + 0x6D2B79F5) >>> 0;
      let t = state.value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    int(n) { if (!Number.isInteger(n) || n <= 0) throw new RangeError('n must be a positive integer'); return Math.floor(this.next() * n); },
    range(a, b) { return a + this.next() * (b - a); },
    pick(arr) { if (!arr.length) return undefined; return arr[this.int(arr.length)]; },
    state,
  };
}

export function hashState(obj) {
  const text = JSON.stringify(obj);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

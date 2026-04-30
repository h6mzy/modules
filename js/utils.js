export function pickRandom(arr, count) {
  return [...arr]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

export function chunkIntoGroups(arr, size = 11) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export function formatDate(value, opts = {}) {
  const {
    locale = 'en-US',
    day = 'numeric',
    month = 'short',
    year = 'numeric',
    hour = 'numeric',
    minute = undefined,
    hour12 = true
  } = opts;

  return new Intl.DateTimeFormat(locale, {
    day,
    month,
    year,
    hour,
    minute,
    hour12
  }).format(new Date(value));
}

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

export function startCountdown(target, { onTick, onEnd } = {}) {
  const t = typeof target === 'number'
    ? target
    : new Date(target).getTime();

  let id;

  const tick = () => {
    let diff = t - Date.now();

    if (diff <= 0) {
      clearInterval(id);
      onTick?.({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      onEnd?.();
      return;
    }

    const d = Math.floor(diff / 86400000); diff %= 86400000;
    const h = Math.floor(diff / 3600000);  diff %= 3600000;
    const m = Math.floor(diff / 60000);    diff %= 60000;
    const s = Math.floor(diff / 1000);

    onTick?.({ days: d, hours: h, minutes: m, seconds: s });
  };

  tick(); // now safe

  id = setInterval(tick, 1000); // assign after

  return () => clearInterval(id);
}

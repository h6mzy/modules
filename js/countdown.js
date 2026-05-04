const Countdown = (() => {
  const pad = n => String(n).padStart(2, '0');

  function mount(selector, target) {
    const root = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!root) return;

    const els = {
      days: root.querySelector('#days'),
      hours: root.querySelector('#hours'),
      minutes: root.querySelector('#minutes'),
      seconds: root.querySelector('#seconds'),
    };

    const t = typeof target === 'number'
      ? target
      : new Date(target).getTime();

    let id;

    const tick = () => {
      let diff = t - Date.now();

      if (diff <= 0) {
        clearInterval(id);

        // update UI to 0
        update(0, 0, 0, 0);

        root.classList.add('ended'); // optional styling hook
        return;
      }

      const d = Math.floor(diff / 86400000); diff %= 86400000;
      const h = Math.floor(diff / 3600000);  diff %= 3600000;
      const m = Math.floor(diff / 60000);    diff %= 60000;
      const s = Math.floor(diff / 1000);

      update(d, h, m, s);
    };

    const update = (d, h, m, s) => {
      if (els.days) els.days.textContent = pad(d);
      if (els.hours) els.hours.textContent = pad(h);
      if (els.minutes) els.minutes.textContent = pad(m);
      if (els.seconds) els.seconds.textContent = pad(s);
    };

    id = setInterval(tick, 1000);
    tick();

    // 🔥 return controller (same pattern as your Dialog)
    return {
      stop() {
        clearInterval(id);
      },
      reset(newTarget) {
        clearInterval(id);
        return mount(root, newTarget);
      }
    };
  }

  return { mount };
})();

export default Countdown;

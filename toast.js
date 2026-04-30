const Toast = (() => {
  let root;

  function init(selector = '#toastRoot') {
    root = document.querySelector(selector);

    if (!root) {
      root = document.createElement('div');
      root.id = selector.replace('#','');
      root.className = 'toast-root';
      document.body.appendChild(root);
    }
  }

  function show(message, opts = {}) {
    const {
      type = 'default',   // success | error | warning
      duration = 2500
    } = opts;

    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;

    root.appendChild(el);

    // trigger animation
    requestAnimationFrame(() => el.classList.add('show'));

    // auto remove
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 200);
    }, duration);
  }

  return { init, show };
})();

export default Toast;

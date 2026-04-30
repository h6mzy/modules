const Dialog = (() => {
  let el, content;

  function init(selector = '#dialog') {
    el = document.querySelector(selector);

    // create content wrapper once
    content = el.querySelector('.dialog-content');
    if (!content) {
      content = document.createElement('div');
      content.className = 'dialog-content';
      el.appendChild(content);
    }

    // click outside
    el.addEventListener('click', e => {
      if (!content.contains(e.target)) close();
    });

    // esc key
    el.addEventListener('cancel', e => {
      e.preventDefault();
      close();
    });
  }

  function open(html, { onSubmit, onMount } = {}) {
    content.innerHTML = html;

    const form = content.querySelector('form');

    onMount?.(content);

    if (form && onSubmit) {
      form.onsubmit = async e => {
        e.preventDefault();
        const data = getFormData(form);
        await onSubmit(data, content);
        close();
      };
    }

    el.showModal();
    requestAnimationFrame(() => el.classList.add('show'));
  }

  function close() {
    el.classList.remove('show');
    setTimeout(() => el.open && el.close(), 150);
  }

  function getFormData(form) {
    return Object.fromEntries(
      [...form.elements]
        .filter(el => el.name)
        .map(el => [
          el.name,
          el.type === 'checkbox' ? el.checked : el.value
        ])
    );
  }

  return { init, open, close };
})();

export default Dialog;

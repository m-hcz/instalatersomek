/* ==========================================================================
   Instalatér Šomek — progressive enhancement only.
   Everything on this site works with JavaScript disabled; this file only
   makes two things nicer. No trackers, no third-party scripts, ever.
   ========================================================================== */

(function () {
  'use strict';

  /* --- Gallery lightbox -------------------------------------------------
     The gallery items are real links to the image file, so without JS a
     click just opens the photo. Here we intercept and show it in place. */

  var gallery = document.querySelector('[data-gallery]');

  if (gallery) {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.hidden = true;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Zvětšená fotografie');
    box.innerHTML =
      '<button type="button" class="lightbox__close" aria-label="Zavřít">' +
        '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">' +
          '<path d="M6 6 18 18M18 6 6 18" fill="none" stroke="currentColor" ' +
                'stroke-width="2.5" stroke-linecap="round"/>' +
        '</svg>' +
      '</button>' +
      '<div><img alt=""><p class="lightbox__caption"></p></div>';
    document.body.appendChild(box);

    var boxImg = box.querySelector('img');
    var boxCap = box.querySelector('.lightbox__caption');
    var closeBtn = box.querySelector('.lightbox__close');
    var lastFocused = null;

    function open(href, alt, caption) {
      lastFocused = document.activeElement;
      boxImg.src = href;
      boxImg.alt = alt || '';
      boxCap.textContent = caption || '';
      box.hidden = false;
      closeBtn.focus();
    }

    function close() {
      box.hidden = true;
      boxImg.removeAttribute('src');
      if (lastFocused) { lastFocused.focus(); }
    }

    gallery.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link || !gallery.contains(link)) { return; }
      var img = link.querySelector('img');
      var cap = link.querySelector('figcaption');
      e.preventDefault();
      open(link.getAttribute('href'),
           img ? img.getAttribute('alt') : '',
           cap ? cap.textContent.trim() : '');
    });

    closeBtn.addEventListener('click', close);

    box.addEventListener('click', function (e) {
      if (e.target === box) { close(); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !box.hidden) { close(); }
    });
  }

  /* --- Inquiry form -----------------------------------------------------
     Submits to Web3Forms over fetch so the visitor stays on the page.
     Without JS the same <form> posts natively and Web3Forms redirects to
     the thank-you page, so the markup must stay a valid plain form. */

  var form = document.querySelector('[data-form]');
  if (!form) { return; }

  var errBox = form.querySelector('[data-form-error]');
  var submit = form.querySelector('[type="submit"]');
  var submitLabel = submit ? submit.textContent : '';

  form.addEventListener('submit', function (e) {
    var action = form.getAttribute('action') || '';
    var key = form.querySelector('[name="access_key"]');

    /* No key yet (pre-launch placeholder) — let the browser do its normal
       thing rather than swallow the submission into a silent failure. */
    if (!key || !key.value || key.value.indexOf('PLACEHOLDER') !== -1) { return; }

    e.preventDefault();

    if (errBox) { errBox.hidden = true; }
    if (submit) { submit.disabled = true; submit.textContent = 'Odesílám…'; }

    fetch(action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.success) {
          window.location.href = 'poptavka-odeslana.html';
        } else {
          fail();
        }
      })
      .catch(fail);
  });

  function fail() {
    if (submit) { submit.disabled = false; submit.textContent = submitLabel; }
    if (errBox) {
      errBox.hidden = false;
      errBox.focus();
      errBox.scrollIntoView({ block: 'center' });
    }
  }
})();

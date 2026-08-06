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
      /* Bez zamknutí se pod otevřenou fotkou posouvá stránka. Na dotyku je to
         nejvíc znát: tažení prstem míří na stránku, ne na overlay, takže se
         návštěvník po zavření vrátí jinam, než kde byl. Šířka posuvníku, který
         tím zmizí, se dorovná odsazením, aby layout neposkočil tam, kde
         posuvník zabírá místo (typicky myš na desktopu). */
      var barW = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (barW > 0) { document.body.style.paddingRight = barW + 'px'; }
      closeBtn.focus();
    }

    function close() {
      box.hidden = true;
      boxImg.removeAttribute('src');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
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
     Submits to Web3Forms over fetch so the visitor stays on the page, and
     reports the outcome in a centred <dialog>. Without JS the same <form>
     posts natively and Web3Forms redirects to poptavka-odeslana.html, so
     the markup must stay a valid plain form.

     Everything below is enhancement. The same constraints are declared on
     the elements themselves (required / pattern / minlength / maxlength),
     so a visitor without JS still cannot submit nonsense — they just get
     the browser's own bubbles instead of coloured fields. Change a rule
     here and you must change it in the attribute and in the Czech .hint
     on kontakt.html too; those three are one rule written three times. */

  var form = document.querySelector('[data-form]');
  if (!form) { return; }

  var MIN_POPIS = 20;
  var MAX_POPIS = 2000;
  var MIN_DIGITS = 9;

  /* Czech counts in three: 1 znak, 2–4 znaky, 5+ znaků. */
  function znaku(n) {
    if (n === 1) { return 'znak'; }
    if (n >= 2 && n <= 4) { return 'znaky'; }
    return 'znaků';
  }

  /* One validator per field. Each returns the Czech message to show, or an
     empty string when the value passes. Wording stays descriptive — it says
     what is expected, not what the visitor did wrong. */
  var RULES = {
    jmeno: function (value) {
      var v = value.trim();
      if (!v) { return 'Vyplňte prosím jméno a příjmení.'; }
      var words = v.split(/\s+/);
      if (words.length < 2) { return 'Napište celé jméno — jméno i příjmení.'; }
      var short = words.filter(function (w) { return w.length < 2; });
      if (short.length) { return 'Jméno i příjmení musí mít alespoň 2 znaky.'; }
      return '';
    },

    telefon: function (value) {
      var v = value.trim();
      if (!v) { return 'Vyplňte prosím telefon — ozvu se vám na něj zpátky.'; }
      /* Reject anything that is not part of how a phone number is written,
         before counting: "volejte odpoledne" has no digits to count at all
         and deserves a different message than a number that is too short. */
      if (/[^\d+()\/\s.\-]/.test(v)) {
        return 'Telefon pište číslicemi, případně s +, mezerami nebo pomlčkami.';
      }
      var digits = v.replace(/\D/g, '');
      if (digits.length < MIN_DIGITS) {
        return 'Číslo je krátké — potřebuji alespoň ' + MIN_DIGITS + ' číslic.';
      }
      return '';
    },

    /* Optional: empty passes. Only the shape is checked, and loosely. There
       is no usable regular expression for RFC-valid addresses, and a strict
       one mostly rejects real people — whether the address works is settled
       by delivery, not here. */
    email: function (value) {
      var v = value.trim();
      if (!v) { return ''; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        return 'E-mail nevypadá správně — čekám tvar jmeno@domena.cz.';
      }
      return '';
    },

    popis: function (value) {
      var len = value.trim().length;
      if (!len) { return 'Napište prosím krátce, o co jde.'; }
      if (len < MIN_POPIS) {
        var missing = MIN_POPIS - len;
        return 'Ještě ' + missing + ' ' + znaku(missing) + ' — popište to prosím trochu podrobněji.';
      }
      if (len > MAX_POPIS) {
        var over = len - MAX_POPIS;
        return 'Zpráva je o ' + over + ' ' + znaku(over) + ' delší, než dovolím (nejvýše ' + MAX_POPIS + ').';
      }
      return '';
    }
  };

  /* --- Tidying ----------------------------------------------------------
     Rewrites an already-valid value into the form it is conventionally
     written in. Enhancement on top of enhancement: without JS the value is
     submitted exactly as typed, which is why nothing here may reject
     anything — RULES decides what passes, this only decides how it looks. */

  var FORMATTERS = {
    /* Czech numbers are written in three groups of three, with the country
       code standing apart from them: "+420 777 123 456" (ČSN 01 6910). The
       prefix is added because the number is read out of an e-mail and dialled
       later, sometimes from a phone abroad; nine bare digits are ambiguous there.

       Only a number we can be certain about is touched: nine digits, on their
       own or already carrying 420 / +420 / 00420. Everything else is returned
       untouched — a foreign number grouped by Czech habit is harder to read,
       not easier, and stamping +420 onto a Slovak number would make it wrong.
       Slovak numbers are the realistic case here: Zlínský kraj borders Slovakia. */
    telefon: function (value) {
      var v = value.trim();
      var digits = v.replace(/\D/g, '');

      /* A written prefix is the only thing that distinguishes the country code
         from a national number that merely starts with the same digits, so
         "420…" counts as one only when the visitor wrote it as one. */
      if (v.charAt(0) === '+' || digits.indexOf('00') === 0) {
        if (digits.indexOf('00') === 0) { digits = digits.slice(2); }
        if (digits.indexOf('420') !== 0) { return v; }
        digits = digits.slice(3);
      } else if (digits.length === 12 && digits.indexOf('420') === 0) {
        digits = digits.slice(3);
      }

      if (digits.length !== 9) { return v; }
      return '+420 ' + digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6);
    }
  };

  /* Runs on blur and again on submit, never on input: rewriting the value
     while it is being typed moves the caret out from under the visitor. A
     field that does not pass yet is left alone — half a number is not a
     number, and "correcting" it mid-way reads as the form fighting back. */
  function tidy(field) {
    var format = FORMATTERS[field.id];
    if (!format || RULES[field.id](field.input.value)) { return; }
    var next = format(field.input.value);
    if (next !== field.input.value) { field.input.value = next; }
  }

  /* --- Result dialogs ---------------------------------------------------
     Both live in kontakt.html so the Czech in them can be proofread like any
     other copy. showModal() puts them in the top layer, which centres them
     over everything and makes focus trapping and Escape the browser's job. */

  var modals = {
    ok: document.querySelector('[data-modal="ok"]'),
    err: document.querySelector('[data-modal="err"]')
  };

  function closeModal(dlg) {
    stopCountdown();
    if (typeof dlg.close === 'function') { dlg.close(); }
    else { dlg.removeAttribute('open'); }
  }

  function openModal(kind) {
    var dlg = modals[kind];
    if (!dlg) { return; }
    stopCountdown();                 /* a second open must not leave one running */
    if (typeof dlg.showModal === 'function') {
      dlg.showModal();
    } else {
      dlg.setAttribute('open', '');  /* pre-<dialog> browser: at least show it */
    }
    startCountdown(dlg);
  }

  Object.keys(modals).forEach(function (kind) {
    var dlg = modals[kind];
    if (!dlg) { return; }

    /* A click on ::backdrop is reported on the <dialog> itself. The panel
       inside carries all the padding, so nothing else can be the target. */
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) { closeModal(dlg); }
    });

    dlg.querySelectorAll('[data-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { closeModal(dlg); });
    });

    /* Escape closes natively without going through closeModal(), and so does
       a form-method="dialog" submit — catch the outcome rather than the route. */
    dlg.addEventListener('close', stopCountdown);

    /* The one way to keep the dialog up: press a key. Deliberately NOT hover.
       showModal() puts the panel wherever the pointer already happens to be,
       so mouseenter fires on open without the visitor doing anything, and the
       countdown would sit at "3 s" forever with no way to notice why. */
    dlg.addEventListener('keydown', cancelCountdown);
  });

  /* --- Auto-close countdown ---------------------------------------------
     How long a dialog stays up is declared per dialog, as data-autoclose in
     milliseconds; a dialog without the attribute waits to be dismissed.

     Three seconds is short, and the countdown has exactly one brake (a key
     press). That is defensible only because the dialog never holds anything
     you cannot get back: the phone number is in the header, the footer and
     the mobile call bar, and poptavka-odeslana.html says what the "odesláno"
     dialog says. Put something in one of these dialogs that exists nowhere
     else and the auto-close has to go.

     The bar is moved frame by frame from here instead of by a CSS animation
     on purpose: the global prefers-reduced-motion rule in css/style.css
     collapses every animation to 0.01ms, which would run the bar to the end
     instantly while the dialog still sat there for the full three seconds.
     One clock drives the bar, the seconds and the close, so they cannot
     disagree about how much time is left. */

  var timer = null;

  function clock() {
    return (window.performance && performance.now) ? performance.now() : Date.now();
  }

  function paint() {
    if (!timer) { return; }
    var left = Math.max(0, timer.left);
    /* The bar grows left to right: it fills up as the wait runs out, so it
       reads as "this much done" rather than "this much left". */
    if (timer.bar) {
      timer.bar.style.transform = 'scaleX(' + (1 - left / timer.total) + ')';
    }
    /* Ceil so it counts 3 → 2 → 1 and never shows a 0 nobody has time to read. */
    if (timer.secs) { timer.secs.textContent = Math.ceil(left / 1000) + ' s'; }
  }

  function tick() {
    if (!timer) { return; }
    var t = clock();
    timer.left -= t - timer.last;
    timer.last = t;

    if (timer.left <= 0) {
      closeModal(timer.dlg);   /* closeModal stops the timer itself */
      return;
    }
    paint();
    timer.frame = requestAnimationFrame(tick);
  }

  function startCountdown(dlg) {
    var total = parseInt(dlg.getAttribute('data-autoclose'), 10);
    var bar = dlg.querySelector('[data-timer-bar]');
    var secs = dlg.querySelector('[data-timer-secs]');

    /* No countdown declared: leave the button reading a plain "Zavřít". */
    if (!total || total <= 0 || !window.requestAnimationFrame) {
      if (bar) { bar.style.transform = 'scaleX(0)'; }
      if (secs) { secs.textContent = ''; }
      return;
    }

    timer = {
      dlg: dlg, bar: bar, secs: secs,
      total: total, left: total, last: clock(), frame: 0
    };
    paint();
    timer.frame = requestAnimationFrame(tick);
  }

  function stopCountdown() {
    if (!timer) { return; }
    cancelAnimationFrame(timer.frame);
    timer = null;
  }

  /* Ends the countdown but leaves the dialog open, and empties the bar and the
     seconds so the button stops implying it is still counting. */
  function cancelCountdown() {
    if (!timer) { return; }
    if (timer.bar) { timer.bar.style.transform = 'scaleX(0)'; }
    if (timer.secs) { timer.secs.textContent = ''; }
    stopCountdown();
  }

  /* --- Live validation --------------------------------------------------
     Colour is applied per field: green border once a filled field passes,
     red border plus a message when it does not. Nothing turns red until the
     visitor has left the field once, so a half-typed value is never scolded;
     after that first blur the field re-checks on every keystroke, so the red
     clears the moment it is fixed. */

  var submit = form.querySelector('[type="submit"]');
  var submitLabel = submit ? submit.textContent : '';

  /* Fields are found by id, never by their name attribute. The names on
     kontakt.html are Czech prose with diacritics ("Jméno a příjmení") because
     Web3Forms uses them verbatim as the row labels in the e-mail it sends, so
     they are copy the owner may reword at any time. The ids are ASCII and are
     not going to move. RULES is keyed by id for the same reason. */
  var fields = Object.keys(RULES).map(function (id) {
    var input = form.querySelector('#' + id);
    if (!input) { return null; }
    var wrap = input.closest('[data-field]');
    return {
      id: id,
      input: input,
      wrap: wrap,
      msg: wrap ? wrap.querySelector('[data-msg]') : null,
      touched: false
    };
  }).filter(Boolean);

  function check(field, force) {
    var error = RULES[field.id](field.input.value);

    /* Before the first blur we only report the verdict, we do not paint it. */
    if (!field.touched && !force) { return !error; }

    var filled = field.input.value.trim() !== '';
    field.input.setAttribute('aria-invalid', error ? 'true' : 'false');
    /* Only the text changes — the slot itself stays in the layout whether it
       says anything or not, or the submit button moves out from under the
       click that is landing on it. See .field__msg in css/style.css. */
    if (field.msg) { field.msg.textContent = error; }
    if (field.wrap) {
      field.wrap.classList.toggle('is-err', !!error);
      field.wrap.classList.toggle('is-ok', !error && filled);
    }
    return !error;
  }

  function clearAll() {
    fields.forEach(function (field) {
      field.touched = false;
      field.input.removeAttribute('aria-invalid');
      if (field.msg) { field.msg.textContent = ''; }
      if (field.wrap) { field.wrap.classList.remove('is-err', 'is-ok'); }
    });
    updateCount();
  }

  fields.forEach(function (field) {
    field.input.addEventListener('blur', function () {
      field.touched = true;
      tidy(field);
      check(field);
    });
    field.input.addEventListener('input', function () {
      if (field.touched) { check(field); }
    });
  });

  /* Character counter under the message box. It counts down to the minimum
     while the message is too short, then switches to counting up towards the
     ceiling — the number the visitor needs is different on each side of 20. */

  var popis = form.querySelector('#popis');
  var counter = form.querySelector('[data-count]');

  function updateCount() {
    if (!popis || !counter) { return; }
    var len = popis.value.trim().length;
    var text, ok = false, bad = false;

    if (len === 0) {
      text = '0 z ' + MAX_POPIS + ' znaků';
    } else if (len < MIN_POPIS) {
      text = 'Ještě ' + (MIN_POPIS - len) + ' ' + znaku(MIN_POPIS - len) + ' do minima (' + MIN_POPIS + ')';
    } else if (len <= MAX_POPIS) {
      text = len + ' z ' + MAX_POPIS + ' znaků';
      ok = true;
    } else {
      text = 'O ' + (len - MAX_POPIS) + ' ' + znaku(len - MAX_POPIS) + ' přes limit ' + MAX_POPIS;
      bad = true;
    }

    counter.textContent = text;
    counter.hidden = false;
    counter.classList.toggle('is-ok', ok);
    counter.classList.toggle('is-err', bad);
  }

  if (popis && counter) {
    popis.addEventListener('input', updateCount);
    updateCount();
  }

  /* --- Submit -----------------------------------------------------------
     novalidate is set from script, never in the markup: without JS the
     browser's own validation is the only validation there is. */

  form.noValidate = true;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var firstBad = null;
    fields.forEach(function (field) {
      field.touched = true;
      /* Enter submits straight from the field without a blur, so the number
         would otherwise be sent in whatever shape it was typed. */
      tidy(field);
      if (!check(field, true) && !firstBad) { firstBad = field; }
    });

    if (firstBad) {
      firstBad.input.focus();
      return;
    }
    send();
  });

  function busy(on) {
    if (!submit) { return; }
    submit.disabled = on;
    submit.textContent = on ? 'Odesílám…' : submitLabel;
  }

  function send() {
    var key = form.elements.access_key;

    /* No key yet (pre-launch placeholder). Submitting anyway would put the
       visitor on Web3Forms' own English error page, so we send nothing and
       show the same dialog as a genuine failure — which is what it is, from
       the visitor's side. See PLACEHOLDERS.md. */
    if (!key || !key.value || key.value.indexOf('PLACEHOLDER') !== -1) {
      console.warn('Web3Forms: access_key is still a placeholder — nothing was sent. See PLACEHOLDERS.md.');
      openModal('err');
      return;
    }

    /* Web3Forms takes multipart or JSON. JSON, because it is what their own
       guide uses and what is legible in the network tab. The form has no
       multi-value controls, so flattening the entries loses nothing.

       Empty fields are dropped rather than sent as "". The service builds the
       notification e-mail out of whatever it receives, one bold heading per
       field, so an empty string buys a heading with nothing under it. It also
       matters for `email` specifically: that field is what sets reply-to, and
       handing it an empty value is worse than not mentioning it. Only the
       optional e-mail can be empty here — everything else was validated
       non-empty a moment ago. */
    var payload = {};
    new FormData(form).forEach(function (value, name) {
      if (String(value).trim() !== '') { payload[name] = value; }
    });

    /* `redirect` exists for the no-JS path only. Left in, the service may
       answer with a 303 to the thank-you page instead of the JSON we parse. */
    delete payload.redirect;

    busy(true);

    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        /* An error response still carries a JSON body; a proxy or an outage
           may not. Either way we need the status, so carry both forward. */
        return res.json()
          .catch(function () { return {}; })
          .then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (out) {
        /* 200 and success:true both have to hold. 400 (bad key, honeypot
           tripped), 429 (rate limit) and 500 all arrive as success:false. */
        if (out.ok && out.data && out.data.success) {
          busy(false);
          form.reset();
          clearAll();
          openModal('ok');
        } else {
          fail(out.data);
        }
      })
      .catch(function () { fail(null); });
  }

  function fail(data) {
    busy(false);
    /* The service answers in English ("Too may requests. Please try later!"),
       which is no use to the visitor — the dialog says it in Czech. Keep the
       original where whoever is debugging will look. */
    var detail = data && (data.message || (data.body && data.body.message));
    if (detail) { console.warn('Web3Forms: ' + detail); }
    openModal('err');
  }

})();

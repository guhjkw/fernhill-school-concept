/* Fernhill Studio School (concept): interactivity for every page.
   Vanilla JS, no libraries and no network requests of any kind.
   Every form is a demo: it validates in the browser, shows an on-page
   confirmation and sends nothing anywhere. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const money = n => (n === 0 ? 'Free' : '$' + (Number.isInteger(n) ? n.toLocaleString('en-US') : n.toFixed(2)));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const params = new URLSearchParams(location.search);

  /* Storage wrapper. localStorage can be blocked (private windows, strict
     settings), so every call is guarded and the page still works without it. */
  const store = {
    ok: (() => { try { localStorage.setItem('fh-test', '1'); localStorage.removeItem('fh-test'); return true; } catch (e) { return false; } })(),
    get(key, fallback) { try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ } },
    remove(key) { try { localStorage.removeItem(key); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------- Mobile navigation ---------- */
  const navToggle = $('.nav-toggle'), nav = $('#site-nav');
  if (navToggle && nav) {
    const setNav = open => { navToggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); };
    navToggle.addEventListener('click', () => setNav(navToggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setNav(false); navToggle.focus(); }
    });
    document.addEventListener('click', e => { if (nav.classList.contains('is-open') && !e.target.closest('.site-header')) setNav(false); });
    matchMedia('(min-width: 900px)').addEventListener('change', e => { if (e.matches) setNav(false); });
  }

  /* ---------- Toast: a polite live region for demo-only buttons ---------- */
  const toastEl = document.createElement('div');
  toastEl.className = 'toast';
  toastEl.setAttribute('role', 'status');
  document.body.appendChild(toastEl);
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.classList.remove('is-visible'); }, 4200);
  }
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-demo-note]');
    if (btn) { e.preventDefault(); toast(btn.dataset.demoNote); }
  });

  /* ---------- Validation shared by every demo form ----------
     Each field reports into an element with id "<field id>-error"
     (radio groups use "<group name>-error"). */
  function setError(form, el, msg) {
    const key = el.type === 'radio' ? el.name : el.id;
    const box = form.querySelector('#' + key + '-error');
    if (box) box.textContent = msg;
    const targets = el.type === 'radio' ? $$('input[name="' + el.name + '"]', form) : [el];
    targets.forEach(t => (msg ? t.setAttribute('aria-invalid', 'true') : t.removeAttribute('aria-invalid')));
  }
  function validate(form) {
    let first = null;
    const seen = new Set();
    for (const el of form.elements) {
      if (!el.name || !el.willValidate) continue;
      const key = el.type === 'radio' ? el.name : el.id;
      if (seen.has(key)) continue;
      seen.add(key);
      const bad = !el.checkValidity();
      setError(form, el, bad ? (el.dataset.error || 'Please complete this field.') : '');
      if (bad && !first) first = el;
    }
    if (first) first.focus();
    return !first;
  }
  function resetForm(form) {
    form.reset();
    $$('.error-msg', form).forEach(m => { m.textContent = ''; });
    $$('[aria-invalid]', form).forEach(el => el.removeAttribute('aria-invalid'));
  }
  // Clear a field's error message as soon as it becomes valid
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.form && el.getAttribute('aria-invalid') === 'true' && el.checkValidity()) setError(el.form, el, '');
  });

  /* ---------- Simple demo forms (newsletter): validate, then swap in the success panel ---------- */
  $$('form[data-demo-form]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate(form)) return;
      const done = $(form.dataset.demoForm);
      form.hidden = true;
      done.hidden = false;
      done.focus();
    });
  });

  /* ---------- Modal dialogs: Esc closes (native dialog), focus is trapped and returned ---------- */
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const visibleFocusables = root => $$(FOCUSABLE, root).filter(el => el.offsetParent !== null);
  function openModal(dlg, opener) {
    dlg.opener = opener || document.activeElement;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    const first = $('[data-autofocus]', dlg) || visibleFocusables(dlg)[0];
    if (first) first.focus();
  }
  function closeModal(dlg) {
    if (typeof dlg.close === 'function') dlg.close();
    else { dlg.removeAttribute('open'); dlg.dispatchEvent(new Event('close')); }
  }
  $$('dialog.modal').forEach(dlg => {
    dlg.addEventListener('close', () => { if (dlg.opener && dlg.opener.focus) dlg.opener.focus(); });
    // A click on the backdrop targets the dialog element itself
    dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-close]')) closeModal(dlg); });
    dlg.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const items = visibleFocusables(dlg);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  });

  /* ---------- Demo checkout (course enrollment and membership sign-up) ----------
     Any button with data-checkout opens the dialog with its own item and price.
     No payment fields exist: the live site would hand off to Squarespace Commerce. */
  const checkout = $('#checkout');
  if (checkout) {
    const form = $('#checkout-form', checkout), done = $('#checkout-done', checkout);
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-checkout]');
      if (!btn) return;
      $$('[data-co]', checkout).forEach(el => { el.textContent = btn.dataset[el.dataset.co] || ''; });
      resetForm(form);
      form.hidden = false;
      done.hidden = true;
      openModal(checkout, btn);
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate(form)) return;
      $('#co-first-name').textContent = form.elements['co-name'].value.trim().split(/\s+/)[0];
      $('#co-sent-to').textContent = form.elements['co-email'].value.trim();
      form.hidden = true;
      done.hidden = false;
      $('h3', done).focus();
    });
  }

  /* ---------- Course catalogue: search, filters, sort and a live result count ---------- */
  const filters = $('#filters');
  if (filters) {
    const grid = $('#course-grid'), cards = $$('.course-card', grid), count = $('#result-count');
    const empty = $('#empty-state'), toggle = $('.filter-toggle'), F = filters.elements;
    // Pre-select filters from the URL, e.g. courses.html?topic=money or ?q=photo
    params.forEach((value, key) => {
      if (key === 'q') { F.q.value = value; return; }
      const input = filters.querySelector('input[name="' + key + '"][value="' + CSS.escape(value) + '"]');
      if (input) input.checked = true;
    });
    const priceOk = (p, band) => band === 'any' || (band === 'free' && p === 0) || (band === 'under100' && p > 0 && p < 100) ||
      (band === '100to199' && p >= 100 && p < 200) || (band === '200plus' && p >= 200);
    const picked = name => $$('input[name="' + name + '"]:checked', filters).map(i => i.value);
    const sorters = { recommended: c => +c.dataset.order, 'price-asc': c => +c.dataset.price, 'price-desc': c => -c.dataset.price, shortest: c => +c.dataset.minutes };
    function apply() {
      const q = F.q.value.trim().toLowerCase(), topics = picked('topic'), levels = picked('level'), formats = picked('format'), band = F.price.value || 'any';
      let shown = 0;
      cards.forEach(card => {
        const d = card.dataset;
        const match = (!q || (card.textContent + ' ' + (d.keywords || '')).toLowerCase().includes(q)) &&
          (!topics.length || topics.includes(d.topic)) && (!levels.length || levels.includes(d.level)) &&
          (!formats.length || formats.includes(d.format)) && priceOk(Number(d.price), band);
        card.hidden = !match;
        if (match) shown++;
      });
      const key = sorters[F.sort.value] || sorters.recommended;
      cards.slice().sort((a, b) => key(a) - key(b)).forEach(c => grid.appendChild(c));
      count.innerHTML = 'Showing <b>' + shown + '</b> of ' + cards.length + ' courses';
      empty.hidden = shown > 0;
      const active = topics.length + levels.length + formats.length + (band !== 'any') + (q ? 1 : 0);
      if (toggle) $('span', toggle).textContent = active ? 'Filters (' + active + ' on)' : 'Filters';
    }
    filters.addEventListener('input', apply);
    F.sort.addEventListener('input', apply); // the sort select sits outside the form element
    filters.addEventListener('submit', e => e.preventDefault());
    filters.addEventListener('reset', () => setTimeout(apply));
    $$('[data-clear-filters]').forEach(b => b.addEventListener('click', () => { filters.reset(); F.q.focus(); }));
    if (toggle) {
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        filters.classList.toggle('is-open', open);
      });
    }
    apply();
  }

  /* ---------- Course detail page ----------
     course.html?course=<slug> renders that course from the JSON block in
     course.html. With no slug (or an unknown one) the default course shows. */
  const hm = n => (n >= 60 ? Math.floor(n / 60) + ' h' + (n % 60 ? ' ' : '') : '') + (n % 60 ? (n % 60) + ' min' : '');
  const cardHTML = c => {
    const n = c.modules.reduce((s, m) => s + m.l.length, 0), mins = c.modules.reduce((s, m) => s + m.l.reduce((a, l) => a + l[1], 0), 0);
    return '<article class="course-card"><div class="course-cover cover-' + c.color + '"><img src="cover-' + c.topic + '.svg" alt="" width="500" height="300"><span class="cover-format">' +
      esc(c.format) + '</span></div><div class="course-body"><p class="course-topic">' + esc(c.topicLabel) + '</p><h3><a href="course.html?course=' + c.slug + '">' +
      esc(c.title) + '</a></h3><p class="course-summary">' + esc(c.summary) + '</p><ul class="course-meta" aria-label="Course details"><li>' + esc(c.level) + '</li><li>' + n +
      ' lessons</li><li>' + hm(mins) + '</li></ul><p class="course-price">' + money(c.price) + '<span>' + esc(c.member) + '</span></p></div></article>';
  };
  const dataEl = $('#course-data');
  if (dataEl) {
    let data = null;
    try { data = JSON.parse(dataEl.textContent); } catch (e) { /* keep the static default content */ }
    if (data) {
      const slug = params.get('course');
      let course = data.courses.find(c => c.slug === slug);
      if (slug && !course) $('#course-notice').hidden = false;
      renderCourse(course || data.courses.find(c => c.slug === data.defaultCourse), data);
    }
  }
  function renderCourse(c, data) {
    const t = data.teachers[c.teacher];
    const mins = m => m.l.reduce((s, l) => s + l[1], 0);
    const total = c.modules.reduce((s, m) => s + mins(m), 0);
    const lessons = c.modules.reduce((s, m) => s + m.l.length, 0);
    const fields = Object.assign({}, c, {
      price: money(c.price), duration: hm(total), lessonCount: lessons + ' lessons', moduleCount: c.modules.length + ' modules',
      teacherName: t.name, teacherRole: t.role, teacherBio: t.bio, initials: t.name.split(' ').map(w => w[0]).join(''),
      currSummary: c.modules.length + ' modules, ' + lessons + ' lessons, ' + hm(total) + ' of video'
    });
    $$('[data-field]').forEach(el => { if (fields[el.dataset.field] != null) el.textContent = fields[el.dataset.field]; });
    const list = items => items.map(i => '<li>' + esc(i) + '</li>').join('');
    $('#learn-list').innerHTML = list(c.learn);
    $('#for-list').innerHTML = list(c.forYou);
    $('#not-for-list').innerHTML = list(c.notFor);
    $('#curriculum').innerHTML = c.modules.map((m, i) => '<details class="module"' + (i === 0 ? ' open' : '') + '><summary><span class="module-num">' +
      String(i + 1).padStart(2, '0') + '</span><span class="module-title">' + esc(m.t) + '</span><span class="module-meta">' + m.l.length + ' lessons</span></summary><ol class="lesson-list">' +
      m.l.map(l => '<li><span>' + esc(l[0]) + '</span><span class="lesson-time">' + l[1] + ' min</span></li>').join('') + '</ol></details>').join('');
    const cover = $('#course-cover');
    cover.className = 'course-hero-cover cover-' + c.color;
    $('img', cover).src = 'cover-' + c.topic + '.svg';
    $('#topic-crumb').href = 'courses.html?topic=' + c.topic;
    $$('[data-checkout]').forEach(b => { b.dataset.item = c.title; b.dataset.price = money(c.price); b.dataset.note = c.access; });
    document.title = c.title + ' | Fernhill Studio School';
    $('meta[name="description"]').setAttribute('content', c.tagline);
    // Related courses: same topic first, then the rest in catalogue order
    const related = data.courses.filter(x => x.slug !== c.slug).sort((a, b) => (b.topic === c.topic) - (a.topic === c.topic)).slice(0, 3);
    $('#related-grid').innerHTML = related.map(cardHTML).join('');
  }
  const expandAll = $('#expand-all');
  if (expandAll) {
    expandAll.addEventListener('click', () => {
      const mods = $$('#curriculum details'), open = mods.some(d => !d.open);
      mods.forEach(d => { d.open = open; });
      expandAll.textContent = open ? 'Collapse all modules' : 'Expand all modules';
      expandAll.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---------- Membership: monthly / yearly billing toggle ---------- */
  const billingBtns = $$('[data-billing]');
  function setBilling(mode) {
    billingBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.billing === mode)));
    $$('.plan').forEach(plan => {
      const amount = $('.amount', plan), m = +amount.dataset.monthly, y = +amount.dataset.yearly;
      amount.textContent = money(mode === 'yearly' ? Math.round(y / 12 * 100) / 100 : m);
      $('.plan-billing', plan).textContent = mode === 'yearly' ? 'Billed ' + money(y) + ' once a year, so two months are free.' : 'Billed monthly. Cancel any time.';
      const btn = $('[data-checkout]', plan);
      btn.dataset.price = mode === 'yearly' ? money(y) + ' a year' : money(m) + ' a month';
      btn.dataset.note = mode === 'yearly' ? 'Yearly billing' : 'Monthly billing';
    });
  }
  if (billingBtns.length) {
    billingBtns.forEach(b => b.addEventListener('click', () => setBilling(b.dataset.billing)));
    setBilling('monthly');
  }

  /* ---------- Coaching booking: service, date, time, details, then a demo confirmation ---------- */
  const booking = $('#booking');
  if (booking) {
    const B = booking.elements, dateBox = $('#date-options'), slotBox = $('#slot-options'), hint = $('#slot-hint');
    const side = $('#booking-summary'), done = $('#booking-done');
    const SLOTS = ['9:00 am', '10:30 am', '12:00 pm', '1:30 pm', '3:00 pm', '4:30 pm'];
    const fmt = (d, o) => d.toLocaleDateString('en-US', o);
    // The next 12 bookable days. Coaching runs Monday to Thursday.
    const days = [];
    for (const d = new Date(); days.length < 12;) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() >= 1 && d.getDay() <= 4) days.push(new Date(d));
    }
    dateBox.innerHTML = days.map((d, i) => '<label class="pick"><input type="radio" name="date" value="' + i + '" required data-error="Pick a date for your session." aria-label="' +
      fmt(d, { weekday: 'long', month: 'long', day: 'numeric' }) + '"><span><small>' + fmt(d, { weekday: 'short' }) + '</small><b>' + d.getDate() + '</b><small>' +
      fmt(d, { month: 'short' }) + '</small></span></label>').join('');
    function renderSlots() {
      const i = B.date.value;
      hint.hidden = i !== '';
      if (i === '') { slotBox.innerHTML = ''; return; }
      const day = days[+i].getDate();
      // A deterministic pattern of "already booked" slots so the demo feels real
      slotBox.innerHTML = SLOTS.map((t, n) => {
        const taken = (day + n * 3) % 4 === 0;
        return '<label class="pick"><input type="radio" name="slot" value="' + t + '" required data-error="Pick a time for your session."' + (taken ? ' disabled' : '') +
          '><span>' + t + (taken ? '<small>Booked</small>' : '') + '</span></label>';
      }).join('');
    }
    function summary() {
      const s = $('input[name="service"]:checked', booking), d = B.date.value, t = $('input[name="slot"]:checked', booking);
      $('#sum-service').textContent = s ? s.dataset.name : 'Not chosen yet';
      $('#sum-length').textContent = s ? s.dataset.length + ' minutes, video call' : 'Not chosen yet';
      $('#sum-date').textContent = d !== '' ? fmt(days[+d], { weekday: 'long', month: 'long', day: 'numeric' }) : 'Not chosen yet';
      $('#sum-time').textContent = t ? t.value + ' Pacific' : 'Not chosen yet';
      $('#sum-price').textContent = s ? money(+s.dataset.price) : 'Not chosen yet';
    }
    const pre = params.get('service');
    const preInput = pre && booking.querySelector('input[name="service"][value="' + CSS.escape(pre) + '"]');
    if (preInput) preInput.checked = true;
    booking.addEventListener('change', e => { if (e.target.name === 'date') renderSlots(); summary(); });
    booking.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate(booking)) return;
      summary();
      $('#done-details').textContent = $('#sum-service').textContent + ' on ' + $('#sum-date').textContent + ' at ' + $('#sum-time').textContent + ' (' + $('#sum-price').textContent + ').';
      $('#done-name').textContent = B['bk-name'].value.trim().split(/\s+/)[0];
      booking.hidden = true;
      side.hidden = true;
      done.hidden = false;
      done.focus();
    });
    $('#book-again').addEventListener('click', () => {
      resetForm(booking);
      renderSlots();
      summary();
      done.hidden = true;
      booking.hidden = false;
      side.hidden = false;
      $('input', booking).focus();
    });
    summary();
  }

  /* ---------- Member area demo: fake sign-in, lesson progress saved in localStorage ---------- */
  const login = $('#login-form');
  if (login) {
    const panel = $('#login-panel'), dash = $('#dashboard'), L = login.elements;
    const DEMO = { email: 'member@fernhill.example', password: 'demo1234' };
    const KEY = 'fernhill-demo-progress', SESSION = 'fernhill-demo-signed-in';
    const boxes = $$('input[data-lesson]', dash);
    const saved = store.get(KEY, null);
    if (saved) boxes.forEach(cb => { cb.checked = !!saved[cb.dataset.lesson]; }); // otherwise keep the sample progress from the HTML
    if (!store.ok) $('#storage-note').hidden = false;
    const show = signedIn => { panel.hidden = signedIn; dash.hidden = !signedIn; };
    const save = () => store.set(KEY, Object.fromEntries(boxes.map(cb => [cb.dataset.lesson, cb.checked])));
    function update() {
      let all = 0, ticked = 0;
      $$('.enrolled', dash).forEach(card => {
        const list = $$('input[data-lesson]', card), done = list.filter(b => b.checked).length, pct = Math.round(done / list.length * 100);
        all += list.length;
        ticked += done;
        $('.bar span', card).style.width = pct + '%';
        $('.bar', card).setAttribute('aria-valuenow', pct);
        $('[data-count]', card).textContent = done + ' of ' + list.length + ' lessons';
        $('[data-pct]', card).textContent = pct + '%';
        const next = list.find(b => !b.checked);
        $('[data-next]', card).textContent = next ? 'Next up: ' + next.nextElementSibling.textContent : 'Course complete. Lovely work.';
      });
      const pct = all ? Math.round(ticked / all * 100) : 0;
      $('#overall-pct').textContent = pct + '% of lessons done';
      $('#overall-bar span').style.width = pct + '%';
      $('#overall-bar').setAttribute('aria-valuenow', pct);
    }
    $('#fill-demo').addEventListener('click', () => {
      L.email.value = DEMO.email;
      L.password.value = DEMO.password;
      $$('.error-msg', login).forEach(m => { m.textContent = ''; });
      $$('[aria-invalid]', login).forEach(el => el.removeAttribute('aria-invalid'));
      $('button[type="submit"]', login).focus();
    });
    login.addEventListener('submit', e => {
      e.preventDefault();
      $('#login-error').textContent = '';
      if (!validate(login)) return;
      if (L.email.value.trim().toLowerCase() !== DEMO.email || L.password.value !== DEMO.password) {
        $('#login-error').textContent = 'Those details do not match the demo account. Use member@fernhill.example and demo1234.';
        L.password.focus();
        return;
      }
      store.set(SESSION, true);
      show(true);
      update();
      $('#dash-title').focus();
    });
    $('#sign-out').addEventListener('click', () => {
      store.remove(SESSION);
      resetForm(login);
      show(false);
      L.email.focus();
    });
    $('#reset-progress').addEventListener('click', () => {
      boxes.forEach(cb => { cb.checked = false; });
      save();
      update();
      toast('Progress cleared. This only changes the copy saved in this browser.');
    });
    dash.addEventListener('change', e => { if (e.target.matches('input[data-lesson]')) { save(); update(); } });
    show(!!store.get(SESSION, false));
    update();
  }
})();

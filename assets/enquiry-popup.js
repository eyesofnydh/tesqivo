(() => {
  const dialog = document.getElementById('enquiryPopup');
  const form = document.getElementById('batchInquiryForm');
  if (!dialog || !form || typeof dialog.showModal !== 'function') return;

  const root = document.documentElement;
  const sessionKey = 'tesqivo-enquiry-popup-seen';
  const scrollThreshold = 0.12;
  let seen = false;
  let placeholder;
  let previousFocus;
  try { seen = sessionStorage.getItem(sessionKey) === '1'; } catch { /* Storage may be disabled. */ }

  function markSeen() {
    seen = true;
    window.removeEventListener('scroll', onScroll);
    try { sessionStorage.setItem(sessionKey, '1'); } catch { /* Keep the in-memory fallback. */ }
  }

  function onScroll() {
    if (seen || root.classList.contains('page-loading')) return;
    if (document.getElementById('bookingCalendarPanel')?.open) return;
    const distance = root.scrollHeight - root.clientHeight;
    if (distance <= 0 || window.scrollY / distance < scrollThreshold) return;
    // Do not interrupt someone who has already reached the full enquiry form.
    const bounds = form.getBoundingClientRect();
    if (bounds.top < window.innerHeight && bounds.bottom > 0) {
      markSeen();
      return;
    }
    previousFocus = document.activeElement;
    placeholder = document.createElement('div');
    placeholder.style.height = `${form.getBoundingClientRect().height}px`;
    placeholder.setAttribute('aria-hidden', 'true');
    form.replaceWith(placeholder);
    document.getElementById('enquiryPopupForm').append(form);
    dialog.showModal();
    root.classList.add('enquiry-popup-open');
    markSeen();
  }

  dialog.querySelectorAll('[data-close-enquiry]').forEach(button => {
    button.addEventListener('click', () => dialog.close());
  });
  // Native dialog provides Escape dismissal, focus containment, and an inert background.
  dialog.addEventListener('close', () => {
    placeholder?.replaceWith(form);
    root.classList.remove('enquiry-popup-open');
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  });
  form.addEventListener('inquiry:submitted', () => {
    markSeen();
    // Keep the confirmation visible until the visitor closes the popup.
  });
  // A deliberate jump to the enquiry section should go straight to that form.
  document.querySelectorAll('a[href="#enrollSection"]').forEach(link => {
    link.addEventListener('click', markSeen);
  });
  document.addEventListener('enquiry:direct-navigation', markSeen);
  if (window.location.hash === '#enrollSection') markSeen();
  if (!seen) window.addEventListener('scroll', onScroll, { passive: true });
})();

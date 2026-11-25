(() => {
  const trigger = document.getElementById('bookingCalendarToggle');
  const panel = document.getElementById('bookingCalendarPanel');
  const days = document.getElementById('bookingDays');
  const monthLabel = document.getElementById('bookingMonth');
  const status = document.getElementById('bookingDateStatus');
  const fullSummary = document.getElementById('fullyBookedSummary');
  const partialSummary = document.getElementById('partiallyBookedSummary');
  const unmarkedSummary = document.getElementById('unmarkedBookingSummary');
  function currentDate() {
    const parts = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: 'numeric', day: 'numeric'
    }).formatToParts(new Date());
    const value = type => Number(parts.find(part => part.type === type).value);
    return new Date(value('year'), value('month') - 1, value('day'));
  }
  let today = currentDate();
  let month = new Date(today.getFullYear(), today.getMonth(), 1);
  const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const range = dates => dates.length === 1 ? String(dates[0]) : `${dates[0]}–${dates.at(-1)}`;
  function positionPanel() {
    if (!panel.open) return;
    const card = document.getElementById('bookingCalendar').getBoundingClientRect();
    const popup = panel.getBoundingClientRect();
    const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom || 0;
    if (card.bottom <= headerBottom || card.top >= window.innerHeight) { setOpen(false); return; }
    const top = Math.max(headerBottom + 8, Math.min(card.bottom + 10, window.innerHeight - popup.height - 12));
    const left = Math.max(12, Math.min(card.right - popup.width, window.innerWidth - popup.width - 12));
    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
  }
  function setOpen(open) {
    if (open && !panel.open) {
      refreshDate();
      panel.show();
      positionPanel();
    } else if (!open && panel.open) {
      panel.close();
    }
    trigger.setAttribute('aria-expanded', String(panel.open));
  }
  function renderMonth() {
    const longMonth = month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const shortMonth = month.toLocaleDateString('en-IN', { month: 'short' });
    monthLabel.textContent = longMonth;
    days.replaceChildren();
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const startYear = today.getFullYear() - (today.getMonth() < 10 ? 1 : 0);
    const bookingStart = dateKey(new Date(startYear, 10, 14));
    const partialThrough = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);
    const todayKey = dateKey(today);
    const partialEndKey = dateKey(partialThrough);
    const fullDates = [];
    const partialDates = [];
    for (let i = 0; i < month.getDay(); i++) {
      const blank = document.createElement('span');
      blank.setAttribute('aria-hidden', 'true');
      days.append(blank);
    }
    for (let day = 1; day <= count; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const key = dateKey(date);
      const fullyBooked = key >= bookingStart && key <= todayKey;
      const partiallyBooked = key > todayKey && key <= partialEndKey;
      if (fullyBooked) fullDates.push(day);
      if (partiallyBooked) partialDates.push(day);
      const label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      const message = `${label}: ${fullyBooked ? 'fully booked.' : partiallyBooked ? 'partially booked. Select to enquire.' : key > todayKey ? 'availability to be confirmed. Select to enquire.' : 'past date.'}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = day;
      button.className = `booking-day${fullyBooked ? ' is-booked' : partiallyBooked ? ' is-partial' : ''}`;
      button.setAttribute('aria-label', message);
      if (key === todayKey) button.setAttribute('aria-current', 'date');
      button.addEventListener('click', () => {
        if (key > todayKey) {
          setOpen(false);
          document.dispatchEvent(new Event('enquiry:direct-navigation'));
          window.location.hash = '#enrollSection';
          document.getElementById('enrollSection')?.scrollIntoView({ block: 'start' });
          window.requestAnimationFrame(() => document.getElementById('studentName')?.focus({ preventScroll: true }));
        } else {
          status.textContent = message;
        }
      });
      days.append(button);
    }
    fullSummary.hidden = fullDates.length === 0;
    partialSummary.hidden = partialDates.length === 0;
    unmarkedSummary.hidden = fullDates.length > 0 || partialDates.length > 0;
    if (fullDates.length) document.getElementById('fullyBookedRange').textContent = `${range(fullDates)} ${shortMonth}`;
    if (partialDates.length) document.getElementById('partiallyBookedRange').textContent = `${range(partialDates)} ${shortMonth}`;
    const bookedText = fullDates.length ? `${range(fullDates)} ${longMonth}: fully booked.` : '';
    const partialText = partialDates.length ? `${range(partialDates)} ${longMonth}: partially booked.` : '';
    status.textContent = [bookedText, partialText].filter(Boolean).join(' ') || `No dates are marked booked in ${longMonth} yet. Select a future date to enquire.`;
    if (panel.open) positionPanel();
  }
  function refreshDate() {
    const nextToday = currentDate();
    if (dateKey(nextToday) === dateKey(today)) return;
    const followingCurrentMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
    today = nextToday;
    if (followingCurrentMonth) month = new Date(today.getFullYear(), today.getMonth(), 1);
    renderMonth();
  }
  // Refresh across midnight/month boundaries, including a tab returning from sleep.
  window.setInterval(refreshDate, 60000);
  window.addEventListener('focus', refreshDate);
  window.addEventListener('resize', positionPanel);
  window.addEventListener('scroll', positionPanel, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDate(); });
  trigger.addEventListener('click', () => setOpen(!panel.open));
  document.getElementById('bookingCalendarClose').addEventListener('click', () => { setOpen(false); trigger.focus(); });
  panel.addEventListener('close', () => trigger.setAttribute('aria-expanded', 'false'));
  document.addEventListener('pointerdown', event => {
    if (panel.open && !panel.contains(event.target) && !trigger.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && panel.open) { event.preventDefault(); setOpen(false); trigger.focus(); }
  });
  document.getElementById('bookingPreviousMonth').addEventListener('click', () => {
    month = new Date(month.getFullYear(), month.getMonth() - 1, 1); renderMonth();
  });
  document.getElementById('bookingNextMonth').addEventListener('click', () => {
    month = new Date(month.getFullYear(), month.getMonth() + 1, 1); renderMonth();
  });
  renderMonth();
})();

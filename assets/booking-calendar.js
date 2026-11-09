(() => {
  const calendar = document.getElementById('bookingCalendar');
  const trigger = document.getElementById('bookingCalendarToggle');
  const panel = document.getElementById('bookingCalendarPanel');
  const days = document.getElementById('bookingDays');
  const monthLabel = document.getElementById('bookingMonth');
  const status = document.getElementById('bookingDateStatus');
  // Confirmed display period: 15 dates, inclusive. Do not roll bookings forward.
  const bookedStart = '2026-11-09';
  const fullyBookedEnd = '2026-11-13';
  const bookedEnd = '2026-11-23';
  const today = new Date();
  let month = new Date(today.getFullYear(), today.getMonth(), 1);
  let pinned = false;
  const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  function setOpen(open) {
    panel.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
  }
  function renderMonth() {
    monthLabel.textContent = month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    days.replaceChildren();
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (let i = 0; i < month.getDay(); i++) {
      const blank = document.createElement('span');
      blank.setAttribute('aria-hidden', 'true');
      days.append(blank);
    }
    for (let day = 1; day <= count; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const key = dateKey(date);
      const booked = key >= bookedStart && key <= bookedEnd;
      const fullyBooked = booked && key <= fullyBookedEnd;
      const partiallyBooked = booked && !fullyBooked;
      const label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      const message = `${label}: ${fullyBooked ? 'fully booked. All student slots are full.' : partiallyBooked ? 'partially booked. Some student slots are still available.' : 'ask a mentor for availability.'}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = day;
      button.className = `booking-day${fullyBooked ? ' is-booked' : partiallyBooked ? ' is-partial' : ''}`;
      button.setAttribute('aria-label', message);
      button.title = message;
      if (key === dateKey(today)) button.setAttribute('aria-current', 'date');
      const showStatus = () => { status.textContent = message; };
      button.addEventListener('pointerenter', showStatus);
      button.addEventListener('focus', showStatus);
      button.addEventListener('click', showStatus);
      days.append(button);
    }
    status.textContent = month.getFullYear() === 2026 && month.getMonth() === 10
      ? '9–13 November: fully booked. 14–23 November: partially booked.'
      : 'Ask a mentor about student slots for this month.';
  }
  trigger.addEventListener('click', () => { pinned = !pinned; setOpen(pinned); });
  calendar.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') setOpen(true);
  });
  calendar.addEventListener('pointerleave', () => {
    if (!pinned && !calendar.contains(document.activeElement)) setOpen(false);
  });
  calendar.addEventListener('focusout', (event) => {
    if (!calendar.contains(event.relatedTarget) && !pinned) setOpen(false);
  });
  function close() { pinned = false; setOpen(false); }
  document.getElementById('bookingCalendarClose').addEventListener('click', () => { trigger.focus(); close(); });
  document.addEventListener('pointerdown', (event) => { if (!calendar.contains(event.target)) close(); });
  calendar.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); trigger.focus(); close(); }
  });
  document.getElementById('bookingPreviousMonth').addEventListener('click', () => {
    month = new Date(month.getFullYear(), month.getMonth() - 1, 1); renderMonth();
  });
  document.getElementById('bookingNextMonth').addEventListener('click', () => {
    month = new Date(month.getFullYear(), month.getMonth() + 1, 1); renderMonth();
  });
  renderMonth();
})();

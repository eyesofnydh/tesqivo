(() => {
  const calendar = document.getElementById('bookingCalendar');
  const trigger = document.getElementById('bookingCalendarToggle');
  const panel = document.getElementById('bookingCalendarPanel');
  const days = document.getElementById('bookingDays');
  const monthLabel = document.getElementById('bookingMonth');
  const status = document.getElementById('bookingDateStatus');
  // Owner-defined monthly schedule, not a live booking inventory.
  const schedule = { fullStart: 14, fullEnd: 23, partialStart: 24, partialEnd: 30 };
  function currentDate() {
    const parts = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: 'numeric', day: 'numeric'
    }).formatToParts(new Date());
    const value = type => Number(parts.find(part => part.type === type).value);
    return new Date(value('year'), value('month') - 1, value('day'));
  }
  let today = currentDate();
  let month = new Date(today.getFullYear(), today.getMonth(), 1);
  let pinned = false;
  const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  function setOpen(open) {
    if (open) refreshDate();
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
      const fullyBooked = day >= schedule.fullStart && day <= schedule.fullEnd;
      const partiallyBooked = day >= schedule.partialStart && day <= schedule.partialEnd;
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
    const shortMonth = month.toLocaleDateString('en-IN', { month: 'short' });
    const longMonth = month.toLocaleDateString('en-IN', { month: 'long' });
    const partialEnd = Math.min(schedule.partialEnd, count);
    document.getElementById('fullyBookedRange').textContent = `${schedule.fullStart}–${schedule.fullEnd} ${shortMonth}`;
    document.getElementById('partiallyBookedRange').textContent = `${schedule.partialStart}–${partialEnd} ${shortMonth}`;
    status.textContent = `${schedule.fullStart}–${schedule.fullEnd} ${longMonth}: fully booked. ${schedule.partialStart}–${partialEnd} ${longMonth}: partially booked.`;
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
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDate(); });
  trigger.addEventListener('click', () => { pinned = !pinned; setOpen(pinned); });
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

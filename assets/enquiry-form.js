(() => {
  const form = document.getElementById('batchInquiryForm');
  const status = document.getElementById('enquiryStatus');
  const button = form.querySelector('[type="submit"]');
  const name = document.getElementById('studentName');
  let sending = false;
  name.addEventListener('input', () => name.setCustomValidity(''));
  function showStatus(message, state) {
    status.hidden = false;
    status.dataset.state = state;
    status.textContent = message;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    name.setCustomValidity(name.value.trim() ? '' : 'Please enter your name.');
    if (!form.reportValidity()) return;
    // Netlify removes this attribute when registering the deployed form.
    if (form.hasAttribute('data-netlify')) {
      showStatus('This form is not available yet. Please email learnwithtesqivo@gmail.com for batch details.', 'error');
      return;
    }
    const data = new FormData(form);
    data.set('name', name.value.trim());
    sending = true;
    button.disabled = true;
    button.textContent = 'Submitting…';
    form.setAttribute('aria-busy', 'true');
    showStatus('Sending your enquiry…', 'pending');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Submission rejected');
      form.reset();
      showStatus('Thank you! Your enquiry has been received. Our team will get back to you.', 'success');
      form.dispatchEvent(new Event('inquiry:submitted'));
      status.focus({ preventScroll: true });
      status.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    } catch (error) {
      showStatus(error.name === 'AbortError'
        ? 'We couldn’t confirm delivery. Please email learnwithtesqivo@gmail.com before trying again.'
        : 'Your enquiry could not be confirmed. Your details are still here. Please try again or email learnwithtesqivo@gmail.com.', 'error');
    } finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      button.textContent = 'Submit Enquiry';
      form.removeAttribute('aria-busy');
    }
  });
})();

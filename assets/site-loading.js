(() => {
  if (!document.documentElement.classList.contains('page-loading')) return;
  async function revealPage() {
    const minimum = new Promise(resolve => setTimeout(resolve, 160));
    let timeout;
    const limit = new Promise(resolve => { timeout = setTimeout(resolve, 2200); });
    try {
      const fonts = document.fonts ? Promise.all([
        document.fonts.load('400 16px "Plus Jakarta Sans"'),
        document.fonts.load('800 32px "Plus Jakarta Sans"'),
        document.fonts.load('700 20px "Caveat"')
      ]) : Promise.resolve();
      await Promise.all([minimum, Promise.race([fonts, limit])]);
    } catch {
      // Failed fonts must never leave visitors behind a loading screen.
    } finally {
      clearTimeout(timeout);
      if (window.tesqivoFinishLoading) window.tesqivoFinishLoading();
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealPage, { once: true });
  } else {
    revealPage();
  }
})();

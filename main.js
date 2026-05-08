(() => {
  'use strict';

  const panels = {
    home:    document.getElementById('panel-home'),
    work:    document.getElementById('panel-work'),
    about:   document.getElementById('panel-about'),
    contact: document.getElementById('panel-contact'),
  };

  const navPills = document.querySelectorAll('.nav-pill');
  let current = 'home';
  let isTransitioning = false;
  const DURATION = 920;

  const lightPanels = new Set(['work', 'about']);

  function updateNav(target) {
    navPills.forEach(p => p.classList.toggle('active', p.dataset.target === target));
    document.body.classList.toggle('light-nav', lightPanels.has(target));
  }

  function navigateTo(target) {
    if (target === current || isTransitioning) return;
    isTransitioning = true;

    const prev = current;
    const prevPanel = panels[prev];
    const nextPanel = panels[target];

    updateNav(target);

    // Step 1 — deactivate current panel (it returns to its CSS off-screen position)
    prevPanel.classList.remove('active');

    // Step 2 — on next frame, activate target so browser has a start state to animate from
    requestAnimationFrame(() => {
      nextPanel.classList.add('active');
      nextPanel.removeAttribute('aria-hidden');
    });

    // Step 3 — cleanup after transition completes
    setTimeout(() => {
      prevPanel.setAttribute('aria-hidden', 'true');
      current = target;
      isTransitioning = false;

      // Reset scroll position on scrollable panels after they leave view
      if (lightPanels.has(prev)) {
        const scroller = prevPanel.querySelector('.panel-scroll');
        if (scroller) scroller.scrollTop = 0;
      }
    }, DURATION);
  }

  // Nav clicks
  navPills.forEach(pill => {
    pill.addEventListener('click', () => navigateTo(pill.dataset.target));
  });

  // Keyboard shortcuts
  const keyMap = {
    ArrowDown:  () => current === 'home'    && navigateTo('work'),
    ArrowUp:    () => current === 'work'    && navigateTo('home'),
    ArrowRight: () => current === 'home'    && navigateTo('about'),
    ArrowLeft:  () => current === 'home'    && navigateTo('contact'),
    Escape:     () => current !== 'home'    && navigateTo('home'),
  };

  document.addEventListener('keydown', e => {
    const fn = keyMap[e.key];
    if (fn) { e.preventDefault(); fn(); }
  });

  // Touch / swipe
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const T  = 55;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -T && current === 'home') navigateTo('about');
      if (dx >  T && current === 'home') navigateTo('contact');
      if (Math.abs(dx) > T && current !== 'home') navigateTo('home');
    } else {
      if (dy < -T && current === 'home') navigateTo('work');
      if (dy >  T && current === 'work')  navigateTo('home');
    }
  }, { passive: true });

  // Video: hide element if no src so the CSS ::before fallback (microscopy image) shows
  const video = document.getElementById('hero-video');
  const src = video?.querySelector('source')?.getAttribute('src') ?? '';
  if (!src) video.style.display = 'none';

  // Initial setup
  updateNav('home');
})();

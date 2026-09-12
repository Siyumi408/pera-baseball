(() => {
  'use strict';

  // Add the team's real sponsorship email here when it is ready.
  const TEAM_EMAIL = '';
  const emailLink = document.querySelector('.email-link');
  const emailNote = document.querySelector('#email-note');
  if (TEAM_EMAIL && emailLink) {
    emailLink.href = `mailto:${TEAM_EMAIL}?subject=Peradeniya%20Baseball%20Sponsorship`;
    if (emailNote) emailNote.textContent = TEAM_EMAIL;
  }

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cover = document.querySelector('.cover');
  const photoFrame = document.querySelector('.cover-viewport');
  let observer;
  let frame = 0;
  const animations = new Set();

  function updateCover() {
    frame = 0;
    if (preference.matches || !cover || !photoFrame) return;
    const rect = cover.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
    // A restrained parallax: enough movement to feel alive, without displacing the cover.
    cover.style.setProperty('--photo-shift', `${progress * Math.min(photoFrame.clientWidth * 0.02, 34)}px`);
    cover.style.setProperty('--photo-scale', String(1.025 + progress * 0.045));
    cover.style.setProperty('--title-shift', `${progress * 54}px`);
  }

  function queueCoverUpdate() {
    if (!frame && !preference.matches) frame = requestAnimationFrame(updateCover);
  }

  function configureMotion() {
    if (observer) observer.disconnect();
    animations.forEach(animation => animation.cancel());
    animations.clear();
    cancelAnimationFrame(frame);
    frame = 0;
    if (cover) {
      ['--photo-shift', '--photo-scale', '--title-shift'].forEach(name => cover.style.removeProperty(name));
    }
    if (preference.matches) return;

    if ('IntersectionObserver' in window && 'animate' in Element.prototype) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const siblings = Array.from(entry.target.parentElement.children);
          const isCard = entry.target.matches('.result, .package');
          const delay = isCard ? Math.min(siblings.indexOf(entry.target), 3) * 65 : 0;
          const animation = entry.target.animate([
            { opacity: 0, transform: 'translateY(24px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], { duration: 620, delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
          animations.add(animation);
          animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
        });
      }, { threshold: 0.08 });
      document.querySelectorAll('.intro-heading, .intro-copy, .section-heading, .result, .package, .activity-intro, .activity-list article, .record-table-wrap, .team-photo, .closing .section-wrap, footer').forEach(element => observer.observe(element));
    }
    queueCoverUpdate();
  }

  window.addEventListener('scroll', queueCoverUpdate, { passive: true });
  window.addEventListener('resize', queueCoverUpdate, { passive: true });
  preference.addEventListener('change', configureMotion);
  configureMotion();
})();

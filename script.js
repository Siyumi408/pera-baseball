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
  const coverPhotos = Array.from(document.querySelectorAll('.cover-photo'));
  const heroMain = document.querySelector('.hero-main');
  let coverStartY = 0;
  let activePhotoIndex = Math.max(0, coverPhotos.findIndex(photo => photo.classList.contains('is-active')));
  let carouselTimer = 0;
  let observer;
  let frame = 0;
  const animations = new Set();

  function updateCover() {
    frame = 0;
    if (preference.matches || !cover || !photoFrame) return;
    const rect = cover.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    // Measure from the cover's actual document position so movement begins as
    // soon as the cover enters the scroll, not only after it leaves the viewport.
    const travel = Math.max(1, rect.height * 1.05);
    const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const progress = Math.max(0, Math.min(1, (scrollTop - coverStartY) / travel));
    const photoShift = progress * Math.min(photoFrame.clientWidth * 0.09, 140);
    const photoScale = 1.035 + progress * 0.12;
    const photoRotate = progress * -1.1;
    const titleShift = progress * -86;
    // Set the transform directly as well as through variables. This keeps the
    // motion reliable in browsers that handle custom-property transforms poorly.
    coverPhotos.forEach((photo, index) => {
      if (index === activePhotoIndex) {
        photo.style.transform = `translate3d(0, ${photoShift}px, 0) scale(${photoScale}) rotate(${photoRotate}deg)`;
      } else {
        photo.style.removeProperty('transform');
      }
    });
    if (heroMain) heroMain.style.transform = `translate3d(0, ${titleShift}px, 0)`;
    cover.style.setProperty('--scroll-progress', String(progress));
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
      ['--photo-shift', '--photo-scale', '--photo-rotate', '--title-shift'].forEach(name => cover.style.removeProperty(name));
    }
    coverPhotos.forEach(photo => photo.style.removeProperty('transform'));
    if (heroMain) heroMain.style.removeProperty('transform');
    if (preference.matches) return;

    if (cover) coverStartY = window.scrollY + cover.getBoundingClientRect().top;

    if (carouselTimer) window.clearInterval(carouselTimer);
    carouselTimer = 0;
    if (coverPhotos.length > 1) {
      carouselTimer = window.setInterval(() => {
        activePhotoIndex = (activePhotoIndex + 1) % coverPhotos.length;
        coverPhotos.forEach((photo, index) => {
          const active = index === activePhotoIndex;
          photo.classList.toggle('is-active', active);
          photo.setAttribute('aria-hidden', active ? 'false' : 'true');
        });
        queueCoverUpdate();
      }, 5200);
    }

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
  window.addEventListener('resize', () => {
    if (cover) coverStartY = window.scrollY + cover.getBoundingClientRect().top;
    queueCoverUpdate();
  }, { passive: true });
  preference.addEventListener('change', configureMotion);
  configureMotion();
})();

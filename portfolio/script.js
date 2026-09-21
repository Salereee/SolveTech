document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- Scroll-triggered reveal ---------- */

const revealEls = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
  revealEls.forEach((el) => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/* ---------- Scroll progress bar ---------- */

const progressEl = document.getElementById('scrollProgress');

function updateProgress() {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - doc.clientHeight;
  const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
  progressEl.style.width = pct + '%';
}

window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

/* ---------- Fine-pointer interactivity: cursor, magnetism, preview ---------- */

if (supportsFinePointer && !prefersReducedMotion) {
  document.body.classList.add('has-fine-pointer');

  const cursorDot = document.getElementById('cursorDot');
  const workPreview = document.getElementById('workPreview');
  const workPreviewImg = document.getElementById('workPreviewImg');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX;
  let dotY = mouseY;
  let dotScale = 1;
  let dotScaleTarget = 1;

  let previewX = mouseX;
  let previewY = mouseY;
  let previewOpacity = 0;
  let previewTargetOpacity = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.querySelectorAll('a, button, .stack-list span').forEach((el) => {
    el.addEventListener('mouseenter', () => { dotScaleTarget = 2.2; });
    el.addEventListener('mouseleave', () => { dotScaleTarget = 1; });
  });

  document.querySelectorAll('[data-magnetic-row]').forEach((row) => {
    const img = row.querySelector('.work-thumb img');
    row.addEventListener('mouseenter', () => {
      dotScaleTarget = 0;
      previewTargetOpacity = 1;
      if (img) workPreviewImg.src = img.src;
    });
    row.addEventListener('mouseleave', () => {
      dotScaleTarget = 1;
      previewTargetOpacity = 0;
    });
  });

  const heroGrid = document.getElementById('heroGrid');

  function frame() {
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;
    dotScale += (dotScaleTarget - dotScale) * 0.25;
    cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) scale(${dotScale})`;

    previewX += (mouseX - previewX) * 0.14;
    previewY += (mouseY - previewY) * 0.14;
    previewOpacity += (previewTargetOpacity - previewOpacity) * 0.18;
    workPreview.style.opacity = previewOpacity.toFixed(2);
    workPreview.style.transform = `translate(${previewX + 48}px, ${previewY - 190}px)`;

    if (heroGrid) {
      const relX = (mouseX / window.innerWidth - 0.5) * -16;
      const relY = (mouseY / window.innerHeight - 0.5) * -16;
      heroGrid.style.transform = `translate(${relX}px, ${relY}px)`;
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  /* Magnetic buttons */
  document.querySelectorAll('[data-magnetic]').forEach((btn) => {
    let bx = 0;
    let by = 0;
    let tx = 0;
    let ty = 0;

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      tx = (e.clientX - rect.left - rect.width / 2) * 0.3;
      ty = (e.clientY - rect.top - rect.height / 2) * 0.3;
    });

    btn.addEventListener('mouseleave', () => {
      tx = 0;
      ty = 0;
    });

    function magFrame() {
      bx += (tx - bx) * 0.2;
      by += (ty - by) * 0.2;
      btn.style.transform = `translate(${bx.toFixed(2)}px, ${by.toFixed(2)}px)`;
      requestAnimationFrame(magFrame);
    }

    magFrame();
  });
}

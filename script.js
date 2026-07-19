/* ==========================================================================
   SURAT SIDANG — main script
   Vanilla JS + GSAP + AOS. Organized by feature so each part is easy to edit.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initCursorGlow();
  initSakura();
  initScrollIndicator();
  initEnvelope();
  initGallery();
  initMusic();
  initClosing();

  if (window.AOS) {
    AOS.init({ duration: 800, once: true, offset: 60, easing: 'ease-out-cubic' });
  }
});

/* ----------------------------------------------------------------------
   1. LOADING SCREEN
   Simulates a short "preparing letter" progress bar, then reveals the page.
---------------------------------------------------------------------- */
function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  const bar = document.getElementById('loading-progress');
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 18 + 6;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        screen.classList.add('hide');
        document.body.style.overflow = '';
        if (window.gsap) {
          gsap.from('#envelope-stage', { opacity: 0, y: 20, duration: 1, ease: 'power2.out' });
        }
      }, 350);
    }
    bar.style.width = progress + '%';
  }, 220);

  document.body.style.overflow = 'hidden';
}

/* ----------------------------------------------------------------------
   2. CURSOR GLOW (desktop only)
---------------------------------------------------------------------- */
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  window.addEventListener('mousemove', (e) => {
    glow.classList.add('active');
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }, { passive: true });

  window.addEventListener('mouseleave', () => glow.classList.remove('active'));
}

/* ----------------------------------------------------------------------
   3. FLOATING SAKURA PETALS (canvas)
   Lightweight particle system — petals drift and rotate down the screen.
---------------------------------------------------------------------- */
function initSakura() {
  const canvas = document.getElementById('sakura-canvas');
  const ctx = canvas.getContext('2d');
  let petals = [];
  let width, height;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = window.innerWidth < 640 ? 12 : 22;

  function makePetal() {
    return {
      x: Math.random() * width,
      y: Math.random() * -height,
      size: 8 + Math.random() * 10,
      speedY: 0.4 + Math.random() * 0.8,
      speedX: Math.random() * 0.6 - 0.3,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 1 - 0.5,
      sway: Math.random() * Math.PI * 2,
      opacity: 0.5 + Math.random() * 0.4
    };
  }

  for (let i = 0; i < COUNT; i++) petals.push(makePetal());

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = '#EFC3CB';
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size / 2, p.size / 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    petals.forEach((p) => {
      p.y += p.speedY;
      p.sway += 0.01;
      p.x += p.speedX + Math.sin(p.sway) * 0.4;
      p.rotation += p.rotSpeed;
      if (p.y > height + 20) {
        Object.assign(p, makePetal(), { y: -20 });
      }
      drawPetal(p);
    });
    requestAnimationFrame(animate);
  }

  if (!reduceMotion) animate();
}

/* ----------------------------------------------------------------------
   4. SCROLL PROGRESS INDICATOR
---------------------------------------------------------------------- */
function initScrollIndicator() {
  const bar = document.querySelector('#scroll-indicator span');
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = scrolled + '%';
  }, { passive: true });
}

/* ----------------------------------------------------------------------
   5. ENVELOPE -> LETTER SEQUENCE
   Click "Buka Surat": blur bg, zoom camera, open envelope flap, seal breaks,
   paper slides out and grows into the full letter, background brightens.
---------------------------------------------------------------------- */
function initEnvelope() {
  const openBtn = document.getElementById('open-letter-btn');
  const envelopeStage = document.getElementById('envelope-stage');
  const letterStage = document.getElementById('letter-stage');
  const envelope = document.getElementById('envelope');
  const letterPaper = document.querySelector('.letter-paper');
  const scrollHint = document.getElementById('continue-btn');
  const heroBg = document.querySelector('.sky-gradient');

  openBtn.addEventListener('click', () => {
    openBtn.disabled = true;
    playSequence();
  });

  function playSequence() {
    const tl = window.gsap ? gsap.timeline() : null;

    if (!tl) {
      // Fallback without GSAP
      envelope.classList.add('is-open');
      envelopeStage.style.display = 'none';
      letterStage.classList.remove('stage--hidden');
      revealLetterParagraphs();
      return;
    }

    tl.to(envelopeStage, { filter: 'blur(6px)', duration: 0.6, ease: 'power2.out' })
      .to(envelope, { scale: 1.08, duration: 0.5, ease: 'power2.inOut' }, '<')
      .add(() => envelope.classList.add('is-open'))
      .to({}, { duration: 1.1 }) // let the CSS flap-open transition play
      .to(envelopeStage, { opacity: 0, scale: 0.9, duration: 0.6, ease: 'power2.in' })
      .add(() => {
        envelopeStage.style.display = 'none';
        letterStage.classList.remove('stage--hidden');
      })
      .fromTo(letterPaper,
        { opacity: 0, y: 40, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' }
      )
      .to(heroBg, { filter: 'brightness(1.08)', duration: 1 }, '<')
      .add(() => {
        revealLetterParagraphs();
        playBackgroundMusicIfEnabled();
      }, '-=0.3');
  }

  function revealLetterParagraphs() {
    const body = document.getElementById('letter-body');
    const raw = body.textContent.trim();
    const paragraphs = raw.split(/\n\s*\n/).filter(Boolean);
    body.innerHTML = paragraphs.map((p) => `<p class="para">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');

    const paraEls = body.querySelectorAll('.para');
    if (window.gsap) {
      gsap.to(paraEls, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
        stagger: 0.5,
        onComplete: () => {
          scrollHint.classList.add('show');
        }
      });
    } else {
      paraEls.forEach((el) => (el.style.opacity = 1));
      scrollHint.classList.add('show');
    }
  }

  scrollHint.addEventListener('click', () => {
    document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ----------------------------------------------------------------------
   6. GALLERY + LIGHTBOX
---------------------------------------------------------------------- */
function initGallery() {
  const items = document.querySelectorAll('.gallery-item img');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');

  items.forEach((img) => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function close() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

/* ----------------------------------------------------------------------
   7. MUSIC CONTROL
   Music never autoplays. User opts in via the floating button, or it
   begins automatically the moment they open the letter (still user-triggered
   by the "Buka Surat" click, so this respects browser autoplay policies).
---------------------------------------------------------------------- */
let musicEnabledByUser = false;

function initMusic() {
  const btn = document.getElementById('music-toggle');
  const audio = document.getElementById('bg-music');
  audio.volume = 0.45;

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {});
      btn.setAttribute('aria-pressed', 'true');
      musicEnabledByUser = true;
    } else {
      audio.pause();
      btn.setAttribute('aria-pressed', 'false');
    }
  });
}

function playBackgroundMusicIfEnabled() {
  // Attempt a gentle autoplay right as the letter appears, since this is
  // triggered by the user's own click on "Buka Surat" (a user gesture).
  const audio = document.getElementById('bg-music');
  const btn = document.getElementById('music-toggle');
  audio.play().then(() => {
    btn.setAttribute('aria-pressed', 'true');
  }).catch(() => {
    // Autoplay blocked — user can still press the music button manually.
  });
}

/* ----------------------------------------------------------------------
   8. CLOSING SECTION — confetti + sakura burst + music fade out
---------------------------------------------------------------------- */
function initClosing() {
  const btn = document.getElementById('thanks-btn');
  btn.addEventListener('click', () => {
    fireConfetti();
    fadeOutMusic();
    btn.disabled = true;
    btn.style.opacity = '0.6';
  });
}

function fireConfetti() {
  if (!window.confetti) return;
  const canvas = document.getElementById('confetti-canvas');
  const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });
  const colors = ['#C7A369', '#C68B85', '#F3D6DA', '#FBF6EC'];

  myConfetti({ particleCount: 90, spread: 100, startVelocity: 42, origin: { y: 0.6 }, colors });
  setTimeout(() => {
    myConfetti({ particleCount: 60, angle: 60, spread: 70, origin: { x: 0 }, colors });
    myConfetti({ particleCount: 60, angle: 120, spread: 70, origin: { x: 1 }, colors });
  }, 250);
}

function fadeOutMusic() {
  const audio = document.getElementById('bg-music');
  if (audio.paused) return;
  const btn = document.getElementById('music-toggle');
  const fade = setInterval(() => {
    if (audio.volume > 0.03) {
      audio.volume -= 0.03;
    } else {
      audio.pause();
      audio.volume = 0.45;
      btn.setAttribute('aria-pressed', 'false');
      clearInterval(fade);
    }
  }, 120);
}

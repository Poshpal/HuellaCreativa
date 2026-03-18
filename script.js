/* =============================================
   HUELLA CREATIVA – PetPop
   script.js (Versión optimizada para Producción/GitHub Pages)
   ============================================= */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* =============================================
     1. NAVBAR: scroll hide/show + transparent
  ============================================= */
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll && currentScroll > 120) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  /* =============================================
     2. HAMBURGER MENU
  ============================================= */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  /* =============================================
     3. SMOOTH SCROLL for anchor links
  ============================================= */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navH = navbar.offsetHeight;
      const top  = target.getBoundingClientRect().top + window.pageYOffset - navH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* =============================================
     4. SCROLL REVEAL (IntersectionObserver)
  ============================================= */
  const revealEls = document.querySelectorAll('.card-reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach(el => revealObserver.observe(el));

  /* =============================================
     5. FAQ ACCORDION
  ============================================= */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      // Close all
      faqItems.forEach(i => i.classList.remove('active'));
      // Toggle current
      if (!isOpen) item.classList.add('active');
    });
  });

  /* =============================================
     6. TESTIMONIALS SLIDER
  ============================================= */
  const track  = document.getElementById('testimonialsTrack');
  const dots   = document.querySelectorAll('.testimonials-dots .dot');
  const cards  = document.querySelectorAll('.testimonial-card');
  let current  = 0;
  let autoPlay;

  function goTo(index) {
    if (!track || !cards || cards.length === 0) return;
    current = index;
    const firstCard = cards[0];
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth + 24; // gap = 24px
    track.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    clearInterval(autoPlay);
    goTo(i);
    startAutoPlay();
  }));

  function startAutoPlay() {
    if (!track || !cards || cards.length === 0) return;
    autoPlay = setInterval(() => {
      goTo((current + 1) % cards.length);
    }, 4500);
  }
  startAutoPlay();

  // Sync dots on manual scroll
  if (track && cards && cards.length > 0) {
    track.addEventListener('scroll', () => {
      const firstCard = cards[0];
      if (!firstCard) return;
      const cardWidth = firstCard.offsetWidth + 24;
      const idx = Math.round(track.scrollLeft / cardWidth);
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      current = idx;
    }, { passive: true });
  }

  /* =============================================
     7. FORM VALIDATION & SUBMIT (FIXED FOR GITHUB)
  ============================================= */
  const form       = document.getElementById('orderForm');
  const submitBtn  = document.getElementById('submitBtn');
  const formSucc   = document.getElementById('formSuccess');

  if (form) {
    // Real-time clear errors on input
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('input', () => clearError(field));
      field.addEventListener('change', () => clearError(field));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!validateForm()) {
        // Shake animation on invalid
        form.style.animation = 'none';
        void form.offsetWidth;
        form.style.animation = 'shake .4s ease';
        return;
      }

      // 1. Mostrar estado de carga
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      // 2. Preparar mensaje de WhatsApp
      const ownerName = document.getElementById('ownerName').value.trim();
      const phone     = document.getElementById('phone').value.trim();
      const petName   = document.getElementById('petName').value.trim();
      const petType   = document.getElementById('petType').value;
      const petBreed  = document.getElementById('petBreed').value.trim();
      const petAge    = document.getElementById('petAge').value.trim();
      const message   = document.getElementById('message').value.trim();

      const petTypeLabels = { gato: '🐱 Gato', perro: '🐕 Perro', otro: '🐾 Otro' };

      const waMsg = encodeURIComponent(
        `¡Hola Huella Creativa! 🐾 Quiero pedir un PetPop personalizado:\n\n` +
        `👤 Nombre: ${ownerName}\n` +
        `📱 Teléfono: ${phone}\n` +
        `🐾 Mascota: ${petName}\n` +
        `🐾 Tipo: ${petTypeLabels[petType] || petType}\n` +
        (petBreed ? `🔖 Raza: ${petBreed}\n` : '') +
        (petAge   ? `📅 Edad: ${petAge}\n` : '') +
        (message  ? `\n💬 Mensaje:\n${message}` : '')
      );

      // Simular un pequeño retraso visual (opcional)
      await new Promise(resolve => setTimeout(resolve, 1200));

      // 3. CAMBIO CLAVE PARA GITHUB PAGES / PRODUCCIÓN:
      // Usamos window.location.assign en lugar de window.open para evitar bloqueadores de popups
      // Reemplaza "5491100000000" con tu número real
      const whatsappUrl = `https://wa.me/5219811683822?text=${waMsg}`;

      // 4. Mostrar mensaje de éxito en la web
      submitBtn.classList.remove('loading');
      form.style.display = 'none';
      formSucc.classList.add('visible');

      // 5. Redirigir a WhatsApp
      // Nota: assign() es más seguro contra bloqueadores que open() tras un proceso async
      window.location.assign(whatsappUrl);
    });
  }

  function clearError(field) {
    field.classList.remove('error');
    const errEl = document.getElementById(`err-${field.name}`);
    if (errEl) errEl.textContent = '';
  }

  function showError(field, msg) {
    field.classList.add('error');
    const errEl = document.getElementById(`err-${field.name}`);
    if (errEl) errEl.textContent = msg;
  }

  function validateForm() {
    let valid = true;
    const ownerName = document.getElementById('ownerName');
    const phone     = document.getElementById('phone');
    const petName   = document.getElementById('petName');
    const petType   = document.getElementById('petType');
    const accept    = document.getElementById('accept');

    if (!ownerName.value.trim()) {
      showError(ownerName, 'Por favor ingresá tu nombre.');
      valid = false;
    }
    if (!phone.value.trim()) {
      showError(phone, 'Ingresá un número de contacto.');
      valid = false;
    }
    if (!petName.value.trim()) {
      showError(petName, 'El nombre de tu mascota es requerido.');
      valid = false;
    }
    if (!petType.value) {
      showError(petType, 'Seleccioná el tipo de mascota.');
      valid = false;
    }
    if (!accept.checked) {
      accept.style.outline = '2px solid #e74c3c';
      valid = false;
    } else {
      accept.style.outline = '';
    }
    return valid;
  }

  /* =============================================
     8. GALLERY CARD 3D TILT
  ============================================= */
  document.querySelectorAll('.gallery-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const rotX   = ((y - cy) / cy) * -8;
      const rotY   = ((x - cx) / cx) * 8;
      card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-10px) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* =============================================
     8.5. MODAL VIDEO GALERÍA
  ============================================= */
  const galleryVideoModal = document.getElementById('galleryVideoModal');
  const galleryVideoEl    = document.getElementById('galleryVideoModalVideo');
  const galleryModalClose = document.querySelector('.gallery-video-modal-close');
  const galleryModalBack  = document.querySelector('.gallery-video-modal-backdrop');

  function closeGalleryVideo() {
    if (!galleryVideoModal || !galleryVideoEl) return;
    galleryVideoEl.pause();
    galleryVideoEl.removeAttribute('src');
    galleryVideoEl.load();
    galleryVideoModal.classList.remove('open');
    galleryVideoModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openGalleryVideo(src) {
    const url = (src && typeof src === 'string') ? src.trim() : '';
    if (!url || !galleryVideoModal || !galleryVideoEl) return;

    // Si el archivo no se puede cargar (404 / ruta incorrecta), cerramos el modal.
    const onError = () => {
      galleryVideoEl.removeEventListener('error', onError);
      closeGalleryVideo();
    };
    galleryVideoEl.addEventListener('error', onError);

    galleryVideoEl.src = url;
    galleryVideoModal.classList.add('open');
    galleryVideoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    galleryVideoEl.play().catch(() => {});
  }

  // Click en cada tarjeta: abrir modal solo si hay data-video
  document.querySelectorAll('.gallery-card').forEach(card => {
    card.addEventListener('click', () => {
      const videoSrc = card.getAttribute('data-video');
      if (!videoSrc || !String(videoSrc).trim()) return;
      openGalleryVideo(videoSrc);
    });
  });

  if (galleryModalClose) galleryModalClose.addEventListener('click', closeGalleryVideo);
  if (galleryModalBack) galleryModalBack.addEventListener('click', closeGalleryVideo);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && galleryVideoModal && galleryVideoModal.classList.contains('open')) {
      closeGalleryVideo();
    }
  });

  /* =============================================
     9. PRODUCT CARD HOVER SPARKLE
  ============================================= */
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      spawnSparkle(card);
    });
  });

  function spawnSparkle(parent) {
    const emojis = ['✨', '🐾', '⭐', '💛'];
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      span.className = 'sparkle-particle';
      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      span.style.cssText = `
        position: absolute;
        left: ${Math.random() * 80 + 10}%;
        top:  ${Math.random() * 60 + 10}%;
        font-size: ${Math.random() * .6 + .7}rem;
        pointer-events: none;
        z-index: 20;
        animation: particleFly .8s ease forwards;
        animation-delay: ${i * 0.1}s;
      `;
      parent.style.position = 'relative';
      parent.style.overflow = 'hidden';
      parent.appendChild(span);
      setTimeout(() => span.remove(), 1000);
    }
  }

  /* =============================================
     10. CURSOR PAW TRAIL (Desktop only)
  ============================================= */
  if (window.matchMedia('(hover: hover)').matches) {
    let lastPaw = 0;
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastPaw < 350) return;
      lastPaw = now;

      const paw = document.createElement('span');
      paw.textContent = '🐾';
      paw.style.cssText = `
        position: fixed;
        left: ${e.clientX - 10}px;
        top:  ${e.clientY - 10}px;
        font-size: 1rem;
        pointer-events: none;
        z-index: 9999;
        opacity: 1;
        transition: opacity .9s ease, transform .9s ease;
        user-select: none;
      `;
      document.body.appendChild(paw);
      requestAnimationFrame(() => {
        paw.style.opacity  = '0';
        paw.style.transform = 'translateY(-20px) scale(.5)';
      });
      setTimeout(() => paw.remove(), 1000);
    });
  }

  /* =============================================
     11. HERO CTA pulse on load
  ============================================= */
  const heroCta = document.querySelector('.hero-ctas .btn-primary');
  if (heroCta) {
    setTimeout(() => {
      heroCta.style.animation = 'pulse-btn .6s ease 3';
    }, 2500);
  }

  /* =============================================
     12. BOX MOCKUP interactive rotation
  ============================================= */
  const heroVisual = document.querySelector('.hero-visual');
  const boxMockup  = document.querySelector('.hero-product-image');

  if (heroVisual && boxMockup) {
    heroVisual.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const y = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      boxMockup.style.transform = `
        perspective(600px)
        rotateY(${x * 15}deg)
        rotateX(${-y * 10}deg)
        translateY(-18px)
      `;
    });
    heroVisual.addEventListener('mouseleave', () => {
      boxMockup.style.transform = '';
      boxMockup.style.animation = 'float 3.5s ease-in-out infinite';
    });
    heroVisual.addEventListener('mouseenter', () => {
      boxMockup.style.animation = 'none';
    });
  }

  /* =============================================
     13. ACTIVE NAV LINK on scroll
  ============================================= */
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link:not(.btn-nav)');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(a => {
            a.classList.toggle('active-link', a.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.4, rootMargin: '-68px 0px 0px 0px' }
  );

  sections.forEach(s => sectionObserver.observe(s));

  // Add active-link style
  const activeLinkStyle = document.createElement('style');
  activeLinkStyle.textContent = `
    .nav-link.active-link { color: var(--primary) !important; }
    .nav-link.active-link::after { width: 100% !important; }
    @keyframes particleFly {
      0%   { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-40px) scale(.3) rotate(${Math.random() * 60 - 30}deg); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-8px); }
      40%       { transform: translateX(8px); }
      60%       { transform: translateX(-6px); }
      80%       { transform: translateX(6px); }
    }
    @keyframes pulse-btn {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.05); }
    }
  `;
  document.head.appendChild(activeLinkStyle);

  console.log('%c🐾 Huella Creativa – PetPop Online', 'color:#FF6B35;font-size:1.2rem;font-weight:bold;');

});
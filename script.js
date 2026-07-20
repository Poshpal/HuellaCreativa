/* =============================================
   HUELLA CREATIVA – PetPop
   script.js (Versión optimizada para Producción/GitHub Pages)
   ============================================= */

'use strict';

const SUPABASE_URL = 'https://walpqiwxbawdhllizxtw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Z6dG8LOXQZMxjgydCxOgxg_AEbMmXqE';
const CLOUDINARY_IMAGE_BASE = 'https://res.cloudinary.com/xyzma0pz/image/upload/';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/** Une el public_id de Cloudinary (sin extensión) con la URL base. */
function getCloudinaryImageUrl(image) {
  if (!image) return '';
  const value = String(image).trim();
  if (/^https?:\/\//i.test(value)) return value;

  // De "images/perrito4.png" → "perrito4"
  const fileName = value.split('/').pop();
  const publicId = fileName.replace(/\.(png|jpe?g|webp|gif)$/i, '');
  console.log(`${CLOUDINARY_IMAGE_BASE}${publicId}`);
  return `${CLOUDINARY_IMAGE_BASE}${publicId}`;
}

document.addEventListener('DOMContentLoaded', () => {

  /* =============================================
     INTRO VIDEO: loop silenciado + desvanecer al scroll
  ============================================= */
  const introVideoSection = document.getElementById('introVideoSection');
  const introVideo = document.getElementById('introVideo');
  if (introVideoSection && introVideo) {
    introVideo.defaultMuted = true;
    introVideo.muted = true;
    const fadeDistance = 420;
    let introFadeTicking = false;
    const getScrollTop = () => (
      window.scrollY
      || window.pageYOffset
      || document.documentElement.scrollTop
      || document.body.scrollTop
      || 0
    );
    const updateIntroVideoFade = () => {
      introFadeTicking = false;
      const y = getScrollTop();
      const opacity = Math.max(0, Math.min(1, 1 - y / fadeDistance));
      introVideoSection.style.opacity = String(opacity);
      if (opacity < 0.04) {
        introVideoSection.style.pointerEvents = 'none';
        if (!introVideo.paused) introVideo.pause();
      } else {
        introVideoSection.style.pointerEvents = '';
        introVideo.play().catch(() => {});
      }
    };
    const onIntroScroll = () => {
      if (!introFadeTicking) {
        introFadeTicking = true;
        requestAnimationFrame(updateIntroVideoFade);
      }
    };
    window.addEventListener('scroll', onIntroScroll, { passive: true });
    window.addEventListener('touchmove', onIntroScroll, { passive: true });
    window.addEventListener('resize', onIntroScroll, { passive: true });
    window.addEventListener('orientationchange', onIntroScroll, { passive: true });
    updateIntroVideoFade();
  }

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
     4.5. PRICES CALCULATOR
  ============================================= */
  const PRICE_UNIT = 400;
  const DISCOUNT_2 = 0.10;

  const qtyBtns = document.querySelectorAll('.calc-qty-btn');
  const subtotalEl = document.getElementById('priceSubtotal');
  const discountEl = document.getElementById('priceDiscount');
  const totalEl = document.getElementById('priceTotal');

  function formatMXN(value) {
    const n = Math.round(value);
    return `$${n.toLocaleString('es-MX')} MXN`;
  }

  function setQty(qty) {
    const q = qty === 2 ? 2 : 1;
    const subtotal = PRICE_UNIT * q;
    const discount = q === 2 ? subtotal * DISCOUNT_2 : 0;
    const total = subtotal - discount;

    qtyBtns.forEach(btn => btn.classList.toggle('is-active', Number(btn.dataset.qty) === q));
    if (subtotalEl) subtotalEl.textContent = formatMXN(subtotal);
    if (discountEl) discountEl.textContent = formatMXN(discount);
    if (totalEl) totalEl.textContent = formatMXN(total);
  }

  if (qtyBtns.length) {
    qtyBtns.forEach(btn => {
      btn.addEventListener('click', () => setQty(Number(btn.dataset.qty)));
    });
    setQty(1);
  }

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
  const dotsWrap = document.getElementById('testimonialsDots');
  let dots   = [];
  let cards  = [];
  let current  = 0;
  let autoPlay;

  function getTestimonialEmoji(pet) {
    const value = String(pet || '');
    if (value.includes('🐈') || value.toLowerCase().includes('gato')) return '🐈';
    if (value.includes('🐕') || value.toLowerCase().includes('perro')) return '🐕';
    return '🐾';
  }

  function createTestimonialCard(testimonial) {
    const card = document.createElement('div');
    card.className = 'testimonial-card';

    if (testimonial.image) {
      const imageWrap = document.createElement('div');
      imageWrap.className = 'test-image-wrap';

      const image = document.createElement('img');
      image.className = 'test-image';
      image.src = testimonial.image;
      image.alt = testimonial.alt || `Imagen del testimonio de ${testimonial.pet || 'cliente'}`;
      image.loading = 'lazy';
      image.decoding = 'async';

      imageWrap.appendChild(image);
      card.appendChild(imageWrap);
    }

    const rating = Math.max(1, Math.min(5, Number(testimonial.rating) || 5));
    const body = document.createElement('div');
    body.className = 'test-card-body';

    const top = document.createElement('div');
    top.className = 'test-card-top';

    const stars = document.createElement('div');
    stars.className = 'test-stars';
    stars.textContent = '⭐'.repeat(rating);
    stars.setAttribute('aria-label', `${rating} de 5 estrellas`);

    const ratingPill = document.createElement('span');
    ratingPill.className = 'test-rating-pill';
    ratingPill.textContent = `${rating}/5`;

    top.append(stars, ratingPill);

    const quote = document.createElement('span');
    quote.className = 'test-quote';
    quote.setAttribute('aria-hidden', 'true');
    quote.textContent = '“';

    const message = document.createElement('p');
    message.className = 'test-message';
    message.textContent = testimonial.message || '';

    const pet = document.createElement('div');
    pet.className = 'test-author';
    const avatar = document.createElement('div');
    avatar.className = 'test-avatar';
    avatar.textContent = getTestimonialEmoji(testimonial.pet);

    const authorCopy = document.createElement('div');
    authorCopy.className = 'test-author-copy';
    const petName = document.createElement('strong');
    petName.textContent = testimonial.pet || '';
    const place = document.createElement('span');
    place.className = 'test-place';
    place.textContent = testimonial.place || '';
    authorCopy.append(petName, place);
    pet.append(avatar, authorCopy);

    body.append(top, quote, message, pet);
    card.appendChild(body);

    return card;
  }

  function createTestimonialDot(index) {
    const dot = document.createElement('button');
    dot.className = `dot${index === 0 ? ' active' : ''}`;
    dot.type = 'button';
    dot.dataset.index = String(index);
    dot.setAttribute('aria-label', `Ver testimonio ${index + 1}`);
    return dot;
  }

  function renderTestimonials(testimonials) {
    if (!track || !dotsWrap) return;

    track.innerHTML = '';
    dotsWrap.innerHTML = '';

    testimonials.forEach((testimonial, index) => {
      track.appendChild(createTestimonialCard(testimonial));
      dotsWrap.appendChild(createTestimonialDot(index));
    });

    cards = Array.from(track.querySelectorAll('.testimonial-card'));
    dots = Array.from(dotsWrap.querySelectorAll('.dot'));
  }

  function goTo(index) {
    if (!track || !cards || cards.length === 0) return;
    current = index;
    const firstCard = cards[0];
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth + 24; // gap = 24px
    track.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  function bindTestimonialDots() {
    dots.forEach((dot, i) => dot.addEventListener('click', () => {
      clearInterval(autoPlay);
      goTo(i);
      startAutoPlay();
    }));
  }

  function startAutoPlay() {
    if (!track || !cards || cards.length === 0) return;
    clearInterval(autoPlay);
    autoPlay = setInterval(() => {
      goTo((current + 1) % cards.length);
    }, 4500);
  }

  // Sync dots on manual scroll
  if (track) {
    track.addEventListener('scroll', () => {
      if (!cards || cards.length === 0) return;
      const firstCard = cards[0];
      if (!firstCard) return;
      const cardWidth = firstCard.offsetWidth + 24;
      const idx = Math.max(0, Math.min(cards.length - 1, Math.round(track.scrollLeft / cardWidth)));
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      current = idx;
    }, { passive: true });
  }

  async function loadTestimonialsFromJson() {
    const response = await fetch('testimonials.json');
    if (!response.ok) throw new Error('No se pudo cargar testimonials.json');
    return response.json();
  }

  async function loadTestimonialsFromSupabase() {
    if (!supabaseClient) {
      throw new Error('Cliente de Supabase no disponible');
    }

    const { data, error } = await supabaseClient
      .from('testimonials')
      .select('rating,message,pet,image,alt,place')
      .order('id', { ascending: false });

    if (error) throw error;
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('La tabla testimonials está vacía o RLS bloquea la lectura');
    }
    return data;
  }

  async function loadTestimonials() {
    if (!track || !dotsWrap) return;

    try {
      let testimonials;

      try {
        testimonials = await loadTestimonialsFromSupabase();
      } catch (supabaseError) {
        console.warn('No se pudieron cargar testimonios desde Supabase. Usando testimonials.json:', supabaseError);
        testimonials = await loadTestimonialsFromJson();
        testimonials = [...testimonials].reverse();
      }

      if (!Array.isArray(testimonials) || testimonials.length === 0) return;

      const normalized = testimonials.map((item) => ({
        ...item,
        image: getCloudinaryImageUrl(item.image),
      }));

      const heroImage = document.getElementById('heroProductImage');
      const first = normalized[0];
      if (heroImage && first?.image) {
        heroImage.src = first.image;
        heroImage.alt = first.alt || `PetPop de ${first.pet || 'mascota'}`;
      }

      renderTestimonials(normalized);
      bindTestimonialDots();
      goTo(0);
      startAutoPlay();
    } catch (error) {
      console.error('Error cargando testimonios:', error);
      track.innerHTML = '<p class="section-subtitle light">No se pudieron cargar los testimonios por el momento.</p>';
    }
  }

  loadTestimonials();

  /* =============================================
     7. FORM VALIDATION & SUBMIT (FIXED FOR GITHUB)
  ============================================= */
  const form       = document.getElementById('orderForm');
  const submitBtn  = document.getElementById('submitBtn');
  const formSucc   = document.getElementById('formSuccess');
  const resetFormBtn = document.getElementById('resetFormBtn');

  function resetOrderForm() {
    if (!form) return;

    form.reset();
    form.querySelectorAll('input, select, textarea').forEach((field) => clearError(field));

    const accept = document.getElementById('accept');
    if (accept) accept.style.outline = '';

    form.style.display = '';
    if (formSucc) formSucc.classList.remove('visible');
    if (submitBtn) {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', resetOrderForm);
  }

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
      const petNicknames = document.getElementById('petNicknames').value.trim();
      const petActivity = document.getElementById('petActivity').value.trim();
      const message   = document.getElementById('message').value.trim();
      const accept    = document.getElementById('accept').value.trim();
      const colorBox  = document.getElementById('colorBox').value;

      const petTypeLabels = { gato: '🐱 Gato', perro: '🐕 Perro', otro: '🐾 Otro' };

      const waMsg = encodeURIComponent(
        `¡Hola Huella Creativa! 🐾 Quiero pedir un PetPop personalizado:\n\n` +
        `👤 Nombre: ${ownerName}\n` +
        `📱 Teléfono: ${phone}\n` +
        `--------------------------------\n` +
        `🐾 Mascota: ${petName}\n` +
        `🐾 Tipo: ${petTypeLabels[petType] || petType}\n` +
        (petBreed ? `🔖 Raza: ${petBreed}\n` : '') +
        (petAge   ? `📅 Edad: ${petAge}\n` : '') +
        (petNicknames ? `📝 Apodos: ${petNicknames}\n` : '') +
        (petActivity ? `🏃 Actividad favorita: ${petActivity}\n` : '') +
        `--------------------------------\n` +
        (colorBox ? `🎨 Color de caja: ${colorBox}\n` : '') +
        (message  ? `💬 Mensaje/Datos extra: ${message}\n` : '') +
        `--------------------------------\n` +
        (accept ? `💰 Acepto dar $100 de anticipo para que agenden mi pedido` : '')
      );

      // Simular un pequeño retraso visual (opcional)
      await new Promise(resolve => setTimeout(resolve, 1200));

      const whatsappUrl = `https://wa.me/5219811683822?text=${waMsg}`;

      // 4. Mostrar mensaje de éxito en la web
      submitBtn.classList.remove('loading');
      form.style.display = 'none';
      formSucc.classList.add('visible');

      // Abrir WhatsApp solo en otra pestaña (sin redirigir la actual)
      window.open(whatsappUrl, '_blank');
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
    const petAge    = document.getElementById('petAge');
    const petNicknames = document.getElementById('petNicknames');
    const petActivity = document.getElementById('petActivity');
    const accept    = document.getElementById('accept');
    const colorBox  = document.getElementById('colorBox');

    if (!ownerName.value.trim()) {
      showError(ownerName, 'Por favor ingresa tu nombre.');
      valid = false;
    }
    if (!phone.value.trim()) {
      showError(phone, 'Ingresa un número de contacto.');
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
    if (!petAge.value.trim()) {
      showError(petAge, 'La edad de tu mascota es requerida.');
      valid = false;
    }
    if (!petNicknames.value.trim()) {
      showError(petNicknames, 'Los apodos de tu mascota son requeridos.');
      valid = false;
    }
    if (!petActivity.value.trim()) {
      showError(petActivity, 'La actividad favorita de tu mascota es requerida.');
      valid = false;
    }
    if (!accept.checked) {
      accept.style.outline = '2px solid #e74c3c';
      showError(accept, 'Acepta el anticipo para agendar el pedido.');
      valid = false;
    } else {
      accept.style.outline = '';
    }

    if (!colorBox.value) {
      showError(colorBox, 'Selecciona el color de la caja.');
      valid = false;
    }
    return valid;
  }

  /* =============================================
     8. MODELOS DISPONIBLES DESDE SUPABASE
  ============================================= */
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryTabsWrap = document.getElementById('galleryTabs');
  const galleryDotsWrap = document.getElementById('galleryDots');
  const galleryVideoModal = document.getElementById('galleryVideoModal');
  const galleryVideoEl    = document.getElementById('galleryVideoModalVideo');
  const galleryModalClose = document.querySelector('.gallery-video-modal-close');
  const galleryModalBack  = document.querySelector('.gallery-video-modal-backdrop');
  let galleryCards = [];
  let galleryDots = [];
  let galleryModels = [];
  let currentGalleryType = 'Todos';
  let currentGallery = 0;
  let galleryAutoPlay;

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

  function bindGalleryCard(card) {
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

    if (!card.dataset.video) return;

    card.addEventListener('click', () => {
      const videoSrc = card.getAttribute('data-video');
      if (!videoSrc || !String(videoSrc).trim()) return;
      openGalleryVideo(videoSrc);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const videoSrc = card.getAttribute('data-video');
      if (!videoSrc || !String(videoSrc).trim()) return;
      openGalleryVideo(videoSrc);
    });
  }

  function createGalleryCard(model, index) {
    const card = document.createElement('div');
    const delayClass = index > 0 && index <= 3 ? ` delay-${index}` : '';
    const video = (model.video && typeof model.video === 'string') ? model.video.trim() : '';
    card.className = `gallery-card card-reveal${video ? ' has-video' : ' no-video'}${delayClass}`;

    if (video) {
      card.tabIndex = 0;
      card.dataset.video = video;
      card.setAttribute('role', 'button');
      card.setAttribute('title', 'Click para ver el video');
      card.setAttribute('aria-label', `Reproducir video de ${model.name || 'modelo'}`);
    }

    const imageWrap = document.createElement('div');
    imageWrap.className = 'gallery-img-wrap';

    const image = document.createElement('img');
    image.className = 'gallery-image';
    image.src = model.image || '';
    image.alt = model.alt || model.name || 'Modelo PetPop';

    const info = document.createElement('div');
    info.className = 'gallery-info';

    const name = document.createElement('span');
    name.className = 'gallery-name';
    name.textContent = model.name || 'Modelo PetPop';

    const description = document.createElement('span');
    description.className = 'gallery-description';
    description.textContent = model.description || '';

    if (video) {
      const hint = document.createElement('span');
      hint.className = 'gallery-video-hint';
      hint.setAttribute('aria-hidden', 'true');
      hint.textContent = 'Click para ver video ▶';
      imageWrap.appendChild(hint);
    }

    imageWrap.appendChild(image);
    info.appendChild(name);
    if (model.description) info.appendChild(description);
    card.append(imageWrap, info);
    bindGalleryCard(card);

    return card;
  }

  function createGalleryDot(index) {
    const dot = document.createElement('button');
    dot.className = `dot${index === 0 ? ' active' : ''}`;
    dot.type = 'button';
    dot.dataset.index = String(index);
    dot.setAttribute('aria-label', `Ver modelo ${index + 1}`);
    return dot;
  }

  function normalizeGalleryType(type) {
    const value = String(type || '').trim();
    return value || 'Otros';
  }

  function getGalleryTypeIcon(type) {
    const value = normalizeGalleryType(type).toLowerCase();
    if (value.includes('perro')) return '🐕';
    if (value.includes('gato')) return '🐱';
    return '🐾';
  }

  function getGalleryTypes(models) {
    return [...new Set(models.map(model => normalizeGalleryType(model.type)))];
  }

  function createGalleryTab(type, isActive) {
    const tab = document.createElement('button');
    tab.className = `gallery-tab${isActive ? ' is-active' : ''}`;
    tab.type = 'button';
    tab.dataset.type = type;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(isActive));
    tab.textContent = type === 'Todos' ? '🐾 Todos' : `${getGalleryTypeIcon(type)} ${type}`;
    return tab;
  }

  function setActiveGalleryTab(type) {
    if (!galleryTabsWrap) return;
    galleryTabsWrap.querySelectorAll('.gallery-tab').forEach(tab => {
      const isActive = tab.dataset.type === type;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });
  }

  function renderGalleryTabs(models) {
    if (!galleryTabsWrap) return;

    const types = ['Todos', ...getGalleryTypes(models)];
    galleryTabsWrap.innerHTML = '';
    types.forEach(type => {
      const tab = createGalleryTab(type, type === currentGalleryType);
      tab.addEventListener('click', () => {
        currentGalleryType = type;
        clearInterval(galleryAutoPlay);
        setActiveGalleryTab(type);
        renderGalleryModels(getFilteredGalleryModels());
        bindGalleryDots();
        goToGalleryModel(0);
        startGalleryAutoPlay();
      });
      galleryTabsWrap.appendChild(tab);
    });
  }

  function getFilteredGalleryModels() {
    if (currentGalleryType === 'Todos') return galleryModels;
    return galleryModels.filter(model => normalizeGalleryType(model.type) === currentGalleryType);
  }

  function goToGalleryModel(index) {
    if (!galleryGrid || !galleryCards || galleryCards.length === 0) return;

    currentGallery = index;
    const firstCard = galleryCards[0];
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth + 24; // gap = 24px
    galleryGrid.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
    galleryDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  function bindGalleryDots() {
    galleryDots.forEach((dot, index) => dot.addEventListener('click', () => {
      clearInterval(galleryAutoPlay);
      goToGalleryModel(index);
      startGalleryAutoPlay();
    }));
  }

  function startGalleryAutoPlay() {
    if (!galleryGrid || !galleryCards || galleryCards.length === 0) return;

    clearInterval(galleryAutoPlay);
    galleryAutoPlay = setInterval(() => {
      goToGalleryModel((currentGallery + 1) % galleryCards.length);
    }, 4500);
  }

  function renderGalleryModels(models) {
    if (!galleryGrid || !galleryDotsWrap) return;

    currentGallery = 0;
    galleryGrid.innerHTML = '';
    galleryDotsWrap.innerHTML = '';
    models.forEach((model, index) => {
      const card = createGalleryCard(model, index);
      galleryGrid.appendChild(card);
      galleryDotsWrap.appendChild(createGalleryDot(index));
      revealObserver.observe(card);
    });

    galleryCards = Array.from(galleryGrid.querySelectorAll('.gallery-card'));
    galleryDots = Array.from(galleryDotsWrap.querySelectorAll('.dot'));
  }

  async function loadGalleryModelsFromJson() {
    const response = await fetch('models.json');
    if (!response.ok) throw new Error('No se pudo cargar models.json');
    return response.json();
  }

  async function loadGalleryModelsFromSupabase() {
    if (!supabaseClient) {
      throw new Error('Cliente de Supabase no disponible');
    }

    const { data, error } = await supabaseClient
      .from('models')
      .select('name,image,alt,description,video,type')
      .order('id', { ascending: true });

    if (error) throw error;
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('La tabla models está vacía o RLS bloquea la lectura');
    }

    return data.map(model => ({
      ...model,
      image: getCloudinaryImageUrl(model.image),
    }));
  }

  async function loadGalleryModels() {
    if (!galleryGrid || !galleryDotsWrap) return;

    try {
      let models;

      try {
        models = await loadGalleryModelsFromSupabase();
      } catch (supabaseError) {
        console.warn('No se pudieron cargar modelos desde Supabase. Usando models.json:', supabaseError);
        models = await loadGalleryModelsFromJson();
      }

      if (!Array.isArray(models) || models.length === 0) return;

      galleryModels = models;
      currentGalleryType = 'Todos';
      renderGalleryTabs(models);
      renderGalleryModels(getFilteredGalleryModels());
      bindGalleryDots();
      goToGalleryModel(0);
      startGalleryAutoPlay();
    } catch (error) {
      console.error('Error cargando modelos:', error);
      galleryGrid.innerHTML = '<p class="section-subtitle">No se pudieron cargar los modelos por el momento.</p>';
    }
  }

  if (galleryGrid) {
    galleryGrid.addEventListener('scroll', () => {
      if (!galleryCards || galleryCards.length === 0) return;

      const firstCard = galleryCards[0];
      if (!firstCard) return;

      const cardWidth = firstCard.offsetWidth + 24;
      const index = Math.max(0, Math.min(galleryCards.length - 1, Math.round(galleryGrid.scrollLeft / cardWidth)));
      galleryDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
      currentGallery = index;
    }, { passive: true });
  }

  if (galleryModalClose) galleryModalClose.addEventListener('click', closeGalleryVideo);
  if (galleryModalBack) galleryModalBack.addEventListener('click', closeGalleryVideo);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && galleryVideoModal && galleryVideoModal.classList.contains('open')) {
      closeGalleryVideo();
    }
  });

  loadGalleryModels();

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

});
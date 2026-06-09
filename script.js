/**
 * PAMPA DOG - script.js
 * Carousel, navegaÃ§Ã£o, scroll reveal e interaÃ§Ãµes
 */

// ============================================================
// HERO CAROUSEL
// ============================================================
function initCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots   = document.querySelectorAll('.carousel-dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(next, 4500);
  }

  // Arrow buttons
  document.getElementById('carousel-prev')?.addEventListener('click', () => { prev(); startAuto(); });
  document.getElementById('carousel-next')?.addEventListener('click', () => { next(); startAuto(); });

  // Dot buttons
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startAuto(); });
  });

  // Touch / swipe support
  let touchStartX = 0;
  const carouselEl = document.querySelector('.carousel');
  if (carouselEl) {
    carouselEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carouselEl.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); startAuto(); }
    }, { passive: true });
  }

  // Pause on hover
  const hero = document.querySelector('.hero');
  hero?.addEventListener('mouseenter', () => clearInterval(timer));
  hero?.addEventListener('mouseleave', startAuto);

  startAuto();
}

// ============================================================
// STICKY HEADER
// ============================================================
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ============================================================
// MOBILE NAV
// ============================================================
function initMobileNav() {
  const btn   = document.querySelector('.hamburger');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = links.classList.toggle('mobile-open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('mobile-open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('mobile-open');
      btn.classList.remove('open');
    }
  });
}

// ============================================================
// ACTIVE NAV LINK
// ============================================================
function initActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// ============================================================
// SCROLL REVEAL
// ============================================================
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach(el => observer.observe(el));
}

// ============================================================
// CARDÃPIO â€“ CATEGORY FILTER
// ============================================================
function initCatFilter() {
  document.querySelector('[data-cat="burgers"]')?.setAttribute('data-cat', 'classicos');
  const oldClassicosBtn = document.getElementById('cat-burgers');
  if (oldClassicosBtn) {
    oldClassicosBtn.id = 'cat-classicos';
    oldClassicosBtn.textContent = 'ðŸŒŸ ClÃ¡ssicos do Rio Grande do Sul';
  }
  document.getElementById('cat-adicionais')?.remove();
  document.querySelector('.menu-section[data-cat="burgers"]')?.setAttribute('data-cat', 'classicos');
  const classicosTitle = document.getElementById('section-burgers');
  if (classicosTitle) {
    classicosTitle.id = 'section-classicos';
    classicosTitle.textContent = 'ðŸŒŸ ClÃ¡ssicos do Rio Grande do Sul';
  }
  const adicionaisSection = document.querySelector('.menu-section[data-cat="adicionais"]');
  if (adicionaisSection) adicionaisSection.style.display = 'none';

  const allowedCats = ['hotdogs', 'classicos', 'combos', 'bebidas'];
  const btns = document.querySelectorAll('.cat-btn');
  const sections = document.querySelectorAll('.menu-section[data-cat]');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.cat;

      sections.forEach(sec => {
        if (allowedCats.indexOf(sec.dataset.cat) === -1) {
          sec.style.display = 'none';
        } else if (cat === 'all' || sec.dataset.cat === cat) {
          sec.style.display = '';
        } else {
          sec.style.display = 'none';
        }
      });

      // Scroll to first visible section
      const first = [...sections].find(s => s.style.display !== 'none');
      if (first && cat !== 'all') {
        setTimeout(() => {
          first.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    });
  });
}

// ============================================================
// PEDIR AGORA BUTTONS â€” analytics-ready click handler
// ============================================================
function initOrderButtons() {
  document.querySelectorAll('[data-action="pedido"]').forEach(btn => {
    btn.addEventListener('click', function () {
      const item = this.dataset.item || 'item';
      console.log(`[Pampa Dog] Pedido iniciado: ${item}`);
      // Aqui vocÃª pode adicionar rastreamento de eventos (Google Analytics, etc.)
    });
  });
}

// ============================================================
// FLOATING WHATSAPP BUTTON
// ============================================================
function addWhatsappFloat() {
  // Only add if doesn't exist
  if (document.getElementById('wpp-float')) return;

  const btn = document.createElement('a');
  btn.id = 'wpp-float';
  btn.href = 'https://wa.me/553899063376';
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.setAttribute('aria-label', 'Falar pelo WhatsApp');
  btn.title = 'Falar pelo WhatsApp';
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="white" width="28" height="28">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.47 2.025 7.773L0 32l8.469-2.221A15.94 15.94 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.093 22.52c-.337.949-1.956 1.813-2.703 1.927-.685.104-1.55.148-2.501-.156-.576-.184-1.316-.429-2.26-.84-3.978-1.72-6.58-5.727-6.779-5.991-.199-.264-1.622-2.155-1.622-4.112s1.028-2.918 1.393-3.314c.364-.395.795-.495 1.06-.495.265 0 .53.003.762.013.244.012.573-.092.897.685.337.8 1.146 2.757 1.247 2.956.101.199.168.43.033.694-.134.265-.201.43-.398.662-.198.233-.417.52-.595.697-.198.198-.404.413-.174.81.23.397 1.022 1.685 2.195 2.728 1.508 1.344 2.78 1.76 3.177 1.958.397.199.629.166.861-.1.233-.265.993-1.16 1.259-1.557.265-.397.53-.331.896-.199.364.133 2.316 1.093 2.713 1.292.397.199.662.298.762.463.099.166.099.96-.238 1.91z"/>
    </svg>
  `;
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '28px',
    right: '28px',
    width: '58px',
    height: '58px',
    background: '#25D366',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(37,211,102,0.5)',
    zIndex: '9999',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    textDecoration: 'none',
  });

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.12)';
    btn.style.boxShadow = '0 6px 28px rgba(37,211,102,0.65)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 4px 20px rgba(37,211,102,0.5)';
  });

  document.body.appendChild(btn);
}

// ============================================================
// HOME FILTERS
// ============================================================
function initHomeFilters() {
  const chips = document.querySelectorAll('.home-filters .btn-chip');
  if (!chips.length) return;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      
      const filter = chip.getAttribute('data-filter');
      if (typeof PD !== 'undefined' && PD.applyHomeFilter) {
        PD.applyHomeFilter(filter);
      }
    });
  });
}

// ============================================================
// SOBRE PAGE MOBILE MODALS
// ============================================================
function initSobreMobileModals() {
  const modal = document.getElementById('sobre-modal');
  if (!modal) return;

  const titleEl = modal.querySelector('#sobre-modal-title');
  const bodyEl = modal.querySelector('.sobre-modal-body');
  const mobileOnly = window.matchMedia('(max-width: 768px)');

  function openModal(title, html) {
    titleEl.textContent = title || '';
    bodyEl.innerHTML = html || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-modal-close]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  document.querySelectorAll('[data-modal-source]').forEach(btn => {
    btn.addEventListener('click', () => {
      const source = document.querySelector(btn.dataset.modalSource);
      if (!source) return;
      openModal(btn.dataset.modalTitle || 'Detalhes', source.innerHTML);
    });
  });

  document.querySelectorAll('.dif-card, .value-item').forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const openCardModal = () => {
      if (!mobileOnly.matches) return;

      const title = card.querySelector('.dif-title, .value-title')?.textContent.trim();
      const desc = card.querySelector('.dif-desc, .value-desc')?.textContent.trim();
      if (!title || !desc) return;

      openModal(title, `<p>${desc}</p>`);
    };

    card.addEventListener('click', openCardModal);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCardModal();
      }
    });
  });
}

function initCardapioMobileEnhancements() {
  const isCardapio = document.body && document.querySelector('.cat-filter') && document.querySelector('.menu-section[data-cat]');
  if (!isCardapio) return;

  const mobileOnly = window.matchMedia('(max-width: 768px)');
  const modal = document.getElementById('cardapio-product-modal');
  const closeBtn = document.getElementById('cardapio-modal-close');
  const imgEl = document.getElementById('cardapio-modal-img');
  const titleEl = document.getElementById('cardapio-modal-title');
  const descEl = document.getElementById('cardapio-modal-desc');
  const priceEl = document.getElementById('cardapio-modal-price');
  const orderEl = document.getElementById('cardapio-modal-order');
  const scrollCue = document.querySelector('.cardapio-scroll-cue');

  function closeProductModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openProductModal(card) {
    if (!mobileOnly.matches || !modal) return;
    const imgWrap = card.querySelector('.menu-card-img');
    const title = card.querySelector('.menu-card-name')?.textContent.trim() || '';
    const desc = card.querySelector('.menu-card-desc')?.textContent.trim() || '';
    const price = card.querySelector('.menu-price')?.textContent.trim() || '';
    const order = card.querySelector('[data-action="pedido"]');

    imgEl.innerHTML = imgWrap ? imgWrap.innerHTML : '';
    titleEl.textContent = title;
    descEl.textContent = desc;
    priceEl.textContent = price;
    orderEl.href = order?.getAttribute('href') || '#';
    orderEl.setAttribute('data-item', order?.getAttribute('data-item') || title);

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  document.addEventListener('click', (event) => {
    const card = event.target.closest('.menu-card');
    if (!card || !mobileOnly.matches) return;
    if (event.target.closest('a, button')) return;
    openProductModal(card);
  });

  closeBtn?.addEventListener('click', closeProductModal);
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeProductModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal?.classList.contains('open')) closeProductModal();
  });

  function syncScrollCue() {
    if (!scrollCue) return;
    scrollCue.classList.toggle('is-hidden', !mobileOnly.matches || window.scrollY > 80);
  }

  window.addEventListener('scroll', syncScrollCue, { passive: true });
  mobileOnly.addEventListener?.('change', syncScrollCue);
  syncScrollCue();

  const scroller = document.querySelector('.cat-filter-inner');
  if (!scroller) return;

  let direction = 1;
  let pausedUntil = 0;
  const pause = () => { pausedUntil = Date.now() + 2500; };

  scroller.addEventListener('pointerdown', pause, { passive: true });
  scroller.addEventListener('touchstart', pause, { passive: true });
  scroller.addEventListener('wheel', pause, { passive: true });
  scroller.addEventListener('click', pause, { passive: true });

  function autoScrollCategories() {
    if (!mobileOnly.matches) return;
    if (Date.now() < pausedUntil) return;

    const max = scroller.scrollWidth - scroller.clientWidth;
    if (max <= 0) return;
    if (scroller.scrollLeft >= max - 1) direction = -1;
    if (scroller.scrollLeft <= 1) direction = 1;
    scroller.scrollLeft += direction;
  }

  setInterval(autoScrollCategories, 70);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initActiveNav();
  initScrollReveal();
  initCatFilter();
  initOrderButtons();
  initSobreMobileModals();
  initCardapioMobileEnhancements();
  addWhatsappFloat();

  function renderDynamicContent() {
    if (typeof PD === 'undefined') return;
    if (PD.renderHeroCarousel) PD.renderHeroCarousel();
    PD.renderProdutosSemana();
    PD.renderHomePromos();
    PD.applyCardapioOverrides();
    initHomeFilters();
  }

  // Chamadas dinÃ¢micas (data.js)
  if (typeof PD !== 'undefined' && PD.loadProductsOnline) {
    PD.loadProductsOnline().finally(() => {
      renderDynamicContent();
      initCarousel();
    });
  } else {
    renderDynamicContent();
    initCarousel();
  }
});


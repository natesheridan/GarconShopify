// GARCON Theme JS

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initCartCount();
  initHeroAnimation();
  initProductPageSizes();
  initCollectionSearch();
});

// Header scroll state
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }, { passive: true });
}

// Update cart count from Shopify
function initCartCount() {
  const count = document.querySelector('.cart-count');
  if (!count) return;
  fetch('/cart.js')
    .then(r => r.json())
    .then(cart => {
      if (cart.item_count > 0) {
        count.textContent = cart.item_count;
        count.style.display = 'flex';
      } else {
        count.style.display = 'none';
      }
    })
    .catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO ANIMATION — slam → glitch → settle → scroll-to-header
// ─────────────────────────────────────────────────────────────────────────────
function initHeroAnimation() {
  const flash    = document.querySelector('.hero-flash');
  const logoMain = document.querySelector('.hero-logo-main');
  const logoWrap = document.querySelector('.hero-logo-wrap');
  const heroSub  = document.querySelector('.hero-sub');
  const heroScroll = document.querySelector('.hero-scroll');
  const heroRule = document.querySelector('.hero-rule');

  if (!logoMain) return;

  // Phase 1 — white flash
  setTimeout(() => {
    if (flash) flash.classList.add('fire');

    // Phase 2 — logo slams in
    setTimeout(() => {
      logoMain.classList.add('slam');

      // Phase 3 — chromatic glitch burst
      setTimeout(() => {
        if (logoWrap) logoWrap.classList.add('glitching');

        // Phase 4 — settle, reveal sub-content
        setTimeout(() => {
          if (logoWrap) logoWrap.classList.remove('glitching');
          logoMain.classList.add('settled');
          if (heroSub)    heroSub.classList.add('visible');
          if (heroScroll) heroScroll.classList.add('visible');
          setTimeout(() => { if (heroRule) heroRule.classList.add('drawn'); }, 120);

          // Phase 5 — hand off to scroll controller
          initLogoScrollMorph();
        }, 580);
      }, 920);
    }, 150);
  }, 320);
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGO SCROLL MORPH — fixed flying element tracks hero → shrinks into header
// ─────────────────────────────────────────────────────────────────────────────
function initLogoScrollMorph() {
  const hero      = document.querySelector('.garcon-hero');
  const heroMain  = document.querySelector('.hero-logo-main');
  const heroWrap  = document.querySelector('.hero-logo-wrap');
  const heroSub   = document.querySelector('.hero-sub');
  const heroScroll = document.querySelector('.hero-scroll');
  const headerLogoImg  = document.getElementById('site-logo-img');
  const headerLogoClip = document.querySelector('.site-header__logo-clip');

  if (!hero || !heroMain || !headerLogoImg || !headerLogoClip) return;

  // Measure hero logo's settled position in viewport
  const heroRect = heroMain.getBoundingClientRect();
  const startW   = heroRect.width;
  const startX   = heroRect.left + heroRect.width / 2;
  const startY   = heroRect.top  + heroRect.height / 2;

  // Build the flying element — same PNG, starts exactly over hero logo
  const flyLogo = document.createElement('img');
  flyLogo.id  = 'garcon-fly-logo';
  flyLogo.src = heroMain.src;
  flyLogo.alt = '';
  flyLogo.style.cssText = [
    'position:fixed',
    'pointer-events:none',
    'z-index:999',
    'display:block',
    'object-fit:contain',
    'transform:translate(-50%,-50%)',
    `width:${startW}px`,
    `left:${startX}px`,
    `top:${startY}px`,
  ].join(';');
  document.body.appendChild(flyLogo);

  // Hero logo invisible — fly logo takes over visually
  heroMain.style.transition = 'opacity 0.05s';
  heroMain.style.opacity    = '0';

  // Constants for header target
  const HEADER_H   = 52;    // header height px
  const END_W      = 140;   // logo width in header (wider than header height = clips top/bottom)
  const END_CLIP_V = Math.round((END_W - HEADER_H) / 2); // px clipped each side at full morph

  // Scroll range: start fading at 5vh, fully morphed by 65% of hero height
  const heroH      = hero.offsetHeight;
  const scrollStart = window.innerHeight * 0.05;
  const scrollEnd   = heroH * 0.65;

  function tick() {
    const sy = window.scrollY;
    const raw = (sy - scrollStart) / (scrollEnd - scrollStart);
    const progress = Math.min(1, Math.max(0, raw));
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic

    // Fade hero sub-content as user scrolls away
    if (heroSub)   heroSub.style.opacity   = String(Math.max(0, 1 - progress * 2.2));
    if (heroScroll) heroScroll.style.opacity = String(Math.max(0, 1 - progress * 3));
    // Glitch layers fade first
    if (heroWrap)  heroWrap.style.opacity  = String(Math.max(0, 1 - eased * 2.5));

    if (progress >= 1) {
      // Logo has fully landed in the header — swap fly logo for header img
      flyLogo.style.display = 'none';
      headerLogoImg.classList.add('is-visible');
      return;
    }

    // Header logo not yet shown
    headerLogoImg.classList.remove('is-visible');
    flyLogo.style.display = 'block';

    // Measure header logo slot each tick (handles resize)
    const clipRect = headerLogoClip.getBoundingClientRect();
    const endX     = clipRect.left + clipRect.width / 2;
    const endY     = clipRect.top  + clipRect.height / 2;

    // Interpolate size and position
    const w = startW + (END_W - startW) * eased;
    const x = startX + (endX - startX) * eased;

    // Y: the hero logo moves up with scroll in document flow, but flyLogo is fixed.
    // Track where hero logo center would be in viewport: startY - sy
    const heroCurrentY = startY - sy;
    const y = heroCurrentY + (endY - heroCurrentY) * eased;

    flyLogo.style.width = `${w}px`;
    flyLogo.style.left  = `${x}px`;
    flyLogo.style.top   = `${y}px`;

    // Apply clip-path in the final 35% of transition — logo appears to enter header bar
    if (progress > 0.65) {
      const clipP  = (progress - 0.65) / 0.35;   // 0→1 in last 35%
      const clip   = Math.round(END_CLIP_V * clipP);
      flyLogo.style.clipPath = `inset(${clip}px 0 ${clip}px 0)`;
    } else {
      flyLogo.style.clipPath = 'none';
    }
  }

  window.addEventListener('scroll', tick, { passive: true });

  // Run once in case page loads mid-scroll
  tick();
}

// ─────────────────────────────────────────────────────────────────────────────
// SIZE SELECTOR
// ─────────────────────────────────────────────────────────────────────────────
function initProductPageSizes() {
  const sizeBtns = document.querySelectorAll('.size-btn');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const variantInput = document.querySelector('[name="id"]');
      if (variantInput && btn.dataset.variantId) {
        variantInput.value = btn.dataset.variantId;
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// COLLECTION SEARCH + FILTER
// ─────────────────────────────────────────────────────────────────────────────
function initCollectionSearch() {
  const searchInput  = document.querySelector('.collection-search input');
  const filterSelects = document.querySelectorAll('.filter-select');
  const items        = document.querySelectorAll('.product-list-row');
  if (!items.length) return;

  function applyFilters() {
    const q    = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const typeSel = document.querySelector('.filter-select:not([name="sort_by"])');
    const type = typeSel ? typeSel.value : 'all';

    items.forEach(item => {
      const name = (item.querySelector('.product-list-row__name') || {}).textContent || '';
      const tag  = (item.querySelector('.product-list-row__type') || {}).textContent || '';
      const matchQ    = !q    || name.toLowerCase().includes(q);
      const matchType = !type || type === 'all' || tag.toLowerCase().includes(type.toLowerCase());
      item.style.display = (matchQ && matchType) ? '' : 'none';
    });
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  filterSelects.forEach(sel => {
    if (sel.name !== 'sort_by') sel.addEventListener('change', applyFilters);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD TO CART
// ─────────────────────────────────────────────────────────────────────────────
function addToCart(variantId, quantity = 1) {
  return fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity }),
  })
    .then(r => r.json())
    .then(item => {
      initCartCount();
      showCartToast(item.title);
      return item;
    });
}

function showCartToast(title) {
  const n = document.createElement('div');
  n.className = 'garcon-toast';
  n.textContent = `+ CART — ${title.toUpperCase()}`;
  document.body.appendChild(n);
  requestAnimationFrame(() => n.classList.add('garcon-toast--in'));
  setTimeout(() => {
    n.classList.remove('garcon-toast--in');
    setTimeout(() => n.remove(), 300);
  }, 2600);
}

// ─────────────────────────────────────────────────────────────────────────────
// INJECTED UTILITY STYLES
// ─────────────────────────────────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  .garcon-toast {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 9999;
    background: #0a0a0a;
    border: 1px solid var(--red);
    color: var(--bone);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    padding: 12px 18px;
    box-shadow: 0 0 20px rgba(192,57,43,0.25);
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.25s, transform 0.25s;
    pointer-events: none;
  }
  .garcon-toast--in {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(style);

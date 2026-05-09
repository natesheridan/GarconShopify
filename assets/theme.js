// GARCON Theme JS

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initCartCount();
  initHeroAnimation();
  initHeroParallax();
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

// Hero logo slam → glitch → settle animation sequence
function initHeroAnimation() {
  const flash    = document.querySelector('.hero-flash');
  const logoMain = document.querySelector('.hero-logo-main');
  const logoWrap = document.querySelector('.hero-logo-wrap');
  const heroSub  = document.querySelector('.hero-sub');
  const heroScroll = document.querySelector('.hero-scroll');
  const heroRule = document.querySelector('.hero-rule');

  if (!logoMain) return;

  // Phase 1 — white flash fires after brief darkness
  setTimeout(() => {
    if (flash) flash.classList.add('fire');

    // Phase 2 — logo slams in as flash fades
    setTimeout(() => {
      logoMain.classList.add('slam');

      // Phase 3 — chromatic glitch burst post-impact
      setTimeout(() => {
        if (logoWrap) logoWrap.classList.add('glitching');

        // Phase 4 — settle: everything goes quiet, sub-content appears
        setTimeout(() => {
          if (logoWrap) logoWrap.classList.remove('glitching');
          logoMain.classList.add('settled');
          if (heroSub)  heroSub.classList.add('visible');
          if (heroScroll) heroScroll.classList.add('visible');
          // Slight delay so rule draws after fade-in begins
          setTimeout(() => {
            if (heroRule) heroRule.classList.add('drawn');
          }, 120);
        }, 580);
      }, 920);
    }, 150);
  }, 320);
}

// Subtle hero depth parallax — runs only after settle phase
function initHeroParallax() {
  const hero = document.querySelector('.garcon-hero');
  if (!hero) return;
  let settled = false;

  // Don't start parallax until settle animation is done
  setTimeout(() => { settled = true; }, 2200);

  window.addEventListener('scroll', () => {
    if (!settled) return;
    const y = window.scrollY;
    if (y < window.innerHeight) {
      hero.style.setProperty('--parallax-y', `${y * 0.12}px`);
      const sub = hero.querySelector('.hero-sub');
      if (sub) sub.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.6)));
    }
  }, { passive: true });
}

// Size selector on product page
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

// Client-side search and filter in collection
function initCollectionSearch() {
  const searchInput = document.querySelector('.collection-search input');
  const filterSelects = document.querySelectorAll('.filter-select');
  const items = document.querySelectorAll('.product-list-row');
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

// Add to cart
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

// Injected utility styles
const style = document.createElement('style');
style.textContent = `
  .site-header.is-scrolled {
    background: rgba(0,0,0,0.96);
    box-shadow: 0 1px 0 rgba(255,255,255,0.06);
  }
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
  }
  .garcon-toast--in {
    opacity: 1;
    transform: translateY(0);
  }
  .garcon-hero {
    --parallax-y: 0px;
  }
`;
document.head.appendChild(style);

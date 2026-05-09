// GARCON Theme JS

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initCartCount();
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
    if (window.scrollY > 20) {
      header.style.borderBottomColor = 'var(--border)';
    } else {
      header.style.borderBottomColor = 'transparent';
    }
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

// Subtle hero parallax
function initHeroParallax() {
  const hero = document.querySelector('.garcon-hero');
  if (!hero) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const content = hero.querySelector('.hero-content');
    if (content && y < window.innerHeight) {
      content.style.transform = `translateY(${y * 0.18}px)`;
      content.style.opacity = 1 - (y / (window.innerHeight * 0.7));
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
      // Update hidden variant input if needed
      const variantInput = document.querySelector('[name="id"]');
      if (variantInput && btn.dataset.variantId) {
        variantInput.value = btn.dataset.variantId;
      }
    });
  });
}

// Client-side search in collection
function initCollectionSearch() {
  const searchInput = document.querySelector('.collection-search input');
  const items = document.querySelectorAll('.product-list-item, .product-card');
  if (!searchInput || !items.length) return;

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    items.forEach(item => {
      const name = (item.querySelector('.product-list-item__name, .product-card__name') || {}).textContent || '';
      item.style.display = (!q || name.toLowerCase().includes(q)) ? '' : 'none';
    });
  });

  // Filter by type
  const filterSelect = document.querySelector('.filter-select');
  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      const val = filterSelect.value;
      items.forEach(item => {
        const tag = (item.querySelector('.product-list-item__tag') || {}).textContent || '';
        item.style.display = (!val || val === 'all' || tag.toLowerCase().includes(val.toLowerCase())) ? '' : 'none';
      });
    });
  }
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
      showCartNotification(item.title);
      return item;
    });
}

function showCartNotification(title) {
  const n = document.createElement('div');
  n.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9998;
    background:var(--surface); border:1px solid var(--accent);
    padding:14px 20px; font-size:11px; font-family:var(--font-body);
    letter-spacing:0.1em; color:var(--text); max-width:280px;
    box-shadow:0 0 24px var(--accent-glow);
    animation: notif-in 0.3s ease-out;
  `;
  n.textContent = `Added to cart — ${title}`;
  document.body.appendChild(n);
  setTimeout(() => { n.style.opacity = '0'; n.style.transition = '0.3s'; setTimeout(() => n.remove(), 300); }, 2800);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes notif-in {
    from { opacity:0; transform: translateY(10px); }
    to   { opacity:1; transform: translateY(0); }
  }
  .site-header.is-scrolled { box-shadow: 0 1px 0 var(--border); }
`;
document.head.appendChild(style);

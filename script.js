/* ============================================ */
/* MEI KONG — Digital Menu                      */
/* Frontend JavaScript — Complete               */
/* DOT Design System                            */
/* ============================================ */

// ============================================
// 1. CONFIGURATION
// ============================================
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbzzr3KrIHx9hcDxfeolUOJZ3yl1MhT6xJPZoVs66JmV9zCYPZxUk2wpWtPz0pcDytkrLw/exec",
  CACHE_KEY: "meikong_menu_data",
  CACHE_DURATION: 5 * 60 * 1000,
};

// ============================================
// 2. GLOBAL STATE
// ============================================
let APP_DATA = null;
let ACTIVE_CATEGORY = "all";
let SELECTED_VARIANT = null;
let CURRENT_ITEM = null;
let CART = [];
let ORDER_TYPE = null;

// ============================================
// 3. DOM ELEMENTS
// ============================================
const DOM = {
  // States
  loader: document.getElementById("loader"),
  errorState: document.getElementById("error-state"),
  errorMessage: document.getElementById("error-message"),
  app: document.getElementById("app"),

  // Navbar
  navbar: document.getElementById("navbar"),
  brandEmoji: document.getElementById("brand-emoji"),
  brandName: document.getElementById("brand-name"),
  brandTagline: document.getElementById("brand-tagline"),
  btnPhone: document.getElementById("btn-phone"),
  btnWhatsapp: document.getElementById("btn-whatsapp"),

  // Hero
  heroEmoji: document.getElementById("hero-emoji"),
  heroTitle: document.getElementById("hero-title"),
  heroSubtitle: document.getElementById("hero-subtitle"),
  heroAddress: document.getElementById("hero-address"),

  // Category Nav
  categoryNavWrapper: document.getElementById("category-nav-wrapper"),
  categoryNav: document.getElementById("category-nav"),

  // Search
  searchInput: document.getElementById("search-input"),
  searchClear: document.getElementById("search-clear"),

  // Menu
  menuContainer: document.getElementById("menu-container"),
  noResults: document.getElementById("no-results"),

  // Modal
  modalOverlay: document.getElementById("modal-overlay"),
  itemModal: document.getElementById("item-modal"),
  modalClose: document.getElementById("modal-close"),
  modalImageWrapper: document.getElementById("modal-image-wrapper"),
  modalImage: document.getElementById("modal-image"),
  modalBadges: document.getElementById("modal-badges"),
  modalTitle: document.getElementById("modal-title"),
  modalDescription: document.getElementById("modal-description"),
  modalPriceSection: document.getElementById("modal-price-section"),
  modalPrice: document.getElementById("modal-price"),
  modalVariants: document.getElementById("modal-variants"),
  variantsList: document.getElementById("variants-list"),
  btnOrder: document.getElementById("btn-order"),
  btnAddCart: document.getElementById("btn-add-cart"),

  // Cart
  cartFab: document.getElementById("cart-fab"),
  cartFabCount: document.getElementById("cart-fab-count"),
  cartOverlay: document.getElementById("cart-overlay"),
  cartDrawer: document.getElementById("cart-drawer"),
  cartClose: document.getElementById("cart-close"),
  cartBody: document.getElementById("cart-body"),
  cartEmpty: document.getElementById("cart-empty"),
  cartFooter: document.getElementById("cart-footer"),
  cartTotal: document.getElementById("cart-total"),
  btnCheckout: document.getElementById("btn-checkout"),

  // Order Type Popup
  ordertypeOverlay: document.getElementById("ordertype-overlay"),
  ordertypeClose: document.getElementById("ordertype-close"),
  btnDinein: document.getElementById("btn-dinein"),
  btnTakeaway: document.getElementById("btn-takeaway"),

  // Dine In Popup
  dineinOverlay: document.getElementById("dinein-overlay"),
  dineinClose: document.getElementById("dinein-close"),
  dineinName: document.getElementById("dinein-name"),
  dineinTable: document.getElementById("dinein-table"),
  dineinNotes: document.getElementById("dinein-notes"),
  btnDineinSubmit: document.getElementById("btn-dinein-submit"),

  // Takeaway Popup
  takeawayOverlay: document.getElementById("takeaway-overlay"),
  takeawayClose: document.getElementById("takeaway-close"),
  takeawayName: document.getElementById("takeaway-name"),
  takeawayPhone: document.getElementById("takeaway-phone"),
  takeawayAddress: document.getElementById("takeaway-address"),
  takeawayNotes: document.getElementById("takeaway-notes"),
  btnTakeawaySubmit: document.getElementById("btn-takeaway-submit"),

  // Footer
  footerEmoji: document.getElementById("footer-emoji"),
  footerName: document.getElementById("footer-name"),
  footerText: document.getElementById("footer-text"),
  footerPhone: document.getElementById("footer-phone"),
  footerPhoneText: document.getElementById("footer-phone-text"),
  footerWhatsapp: document.getElementById("footer-whatsapp"),
  footerMaps: document.getElementById("footer-maps"),
  footerCopyName: document.getElementById("footer-copy-name"),
  footerSocial: document.getElementById("footer-social"),

  // Scroll Top
  scrollTop: document.getElementById("scroll-top"),
};

// ============================================
// 4. INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 MEI KONG Digital Menu — Initializing...");
  initApp();
});

async function initApp() {
  try {
    const cachedData = loadFromCache();

    if (cachedData) {
      console.log("📦 Using cached data");
      APP_DATA = cachedData;
      renderApp();
    } else {
      console.log("🌐 Fetching fresh data from API...");
      await fetchMenuData();
    }

    setupEventListeners();
    console.log("✅ App initialized successfully!");
  } catch (error) {
    console.error("❌ Init Error:", error);
    showError(error.message);
  }
}

// ============================================
// 5. DATA FETCHING
// ============================================
async function fetchMenuData() {
  try {
    const url = `${CONFIG.API_URL}?action=getFullMenu`;
    console.log("📡 Fetching:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("📥 Data received:", data);

    if (!data.success) {
      throw new Error(data.error || "API returned unsuccessful response");
    }

    APP_DATA = data;
    saveToCache(data);
    renderApp();
  } catch (error) {
    console.error("❌ Fetch Error:", error);

    const cachedData = loadFromCache(true);
    if (cachedData) {
      console.log("📦 Using expired cache as fallback");
      APP_DATA = cachedData;
      renderApp();
    } else {
      showError(error.message);
    }
  }
}

// ============================================
// 6. CACHE MANAGEMENT
// ============================================
function saveToCache(data) {
  try {
    const cacheObj = {
      data: data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(cacheObj));
    console.log("💾 Data cached successfully");
  } catch (e) {
    console.warn("⚠️ Cache save failed:", e);
  }
}

function loadFromCache(ignoreExpiry = false) {
  try {
    const cached = localStorage.getItem(CONFIG.CACHE_KEY);
    if (!cached) return null;

    const cacheObj = JSON.parse(cached);
    const age = Date.now() - cacheObj.timestamp;

    if (!ignoreExpiry && age > CONFIG.CACHE_DURATION) {
      console.log("⏰ Cache expired");
      return null;
    }

    return cacheObj.data;
  } catch (e) {
    console.warn("⚠️ Cache load failed:", e);
    return null;
  }
}

// ============================================
// 7. APP RENDERING
// ============================================
function renderApp() {
  console.log("🎨 Rendering app...");

  applyThemeColors();
  populateRestaurantInfo();
  renderCategoryNav();
  renderMenu();
  populateFooter();
  renderSocialLinks();
  hideLoader();

  console.log("✅ App rendered!");
}

// ============================================
// 8. THEME COLORS
// ============================================
function applyThemeColors() {
  const settings = APP_DATA.settings || {};

  if (settings.primary_color) {
    document.documentElement.style.setProperty("--color-primary", settings.primary_color);
  }
  if (settings.accent_color) {
    document.documentElement.style.setProperty("--color-accent", settings.accent_color);
    document.documentElement.style.setProperty(
      "--color-accent-light",
      hexToRgba(settings.accent_color, 0.08)
    );
    document.documentElement.style.setProperty(
      "--color-accent-hover",
      hexToRgba(settings.accent_color, 0.12)
    );
  }
  if (settings.bg_color) {
    document.documentElement.style.setProperty("--color-bg", settings.bg_color);
  }
  if (settings.surface_color) {
    document.documentElement.style.setProperty("--color-surface", settings.surface_color);
  }
  if (settings.muted_color) {
    document.documentElement.style.setProperty("--color-muted", settings.muted_color);
  }
  if (settings.border_color) {
    document.documentElement.style.setProperty("--color-border", settings.border_color);
  }

  console.log("🎨 Theme colors applied");
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================
// 9. POPULATE RESTAURANT INFO
// ============================================
function populateRestaurantInfo() {
  const info = APP_DATA.restaurant || {};
  const settings = APP_DATA.settings || {};

  DOM.brandEmoji.textContent = info.hero_emoji || "☕";
  DOM.brandName.textContent = info.name || "Restaurant";
  DOM.brandTagline.textContent = info.tagline || "";

  if (info.phone) {
    DOM.btnPhone.href = `tel:+${info.phone}`;
  }

  if (info.whatsapp) {
    DOM.btnWhatsapp.href = `https://wa.me/${info.whatsapp}`;
    DOM.btnWhatsapp.target = "_blank";
  }

  DOM.heroEmoji.textContent = info.hero_emoji || "☕";
  DOM.heroTitle.textContent = settings.welcome_message || `Welcome to ${info.name}`;
  DOM.heroSubtitle.textContent = info.tagline || "";

  if (info.address) {
    DOM.heroAddress.querySelector("span").textContent = info.address;
    if (info.maps_url) {
      DOM.heroAddress.href = info.maps_url;
      DOM.heroAddress.target = "_blank";
    }
  }

  // Render Hero Banner Slider
  renderHeroBanners();

  console.log("📍 Restaurant info populated");
}
// ============================================
// 10. CATEGORY NAVIGATION
// ============================================
function renderCategoryNav() {
  const menu = APP_DATA.menu || [];

  let html = `
    <button class="category-chip active" data-category="all">
      <span class="category-chip-emoji">📋</span>
      <span>All</span>
    </button>
  `;

  menu.forEach((cat) => {
    html += `
      <button class="category-chip" data-category="${cat.id}">
        <span class="category-chip-emoji">${cat.emoji || ""}</span>
        <span>${cat.name}</span>
      </button>
    `;
  });

  DOM.categoryNav.innerHTML = html;

  const chips = DOM.categoryNav.querySelectorAll(".category-chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      handleCategoryClick(chip.dataset.category, chip);
    });
  });

  console.log("📂 Category nav rendered: " + menu.length + " categories");
}

function handleCategoryClick(categoryId, chipElement) {
  ACTIVE_CATEGORY = categoryId;

  DOM.categoryNav.querySelectorAll(".category-chip").forEach((c) => {
    c.classList.remove("active");
  });
  chipElement.classList.add("active");

  chipElement.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "center",
  });

  DOM.searchInput.value = "";
  DOM.searchClear.style.display = "none";

  filterMenu();

  if (categoryId !== "all") {
    const section = document.getElementById(`section-${categoryId}`);
    if (section) {
      const offset = getNavbarHeight() + getCategoryNavHeight() + 16;
      const top = section.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  } else {
    const offset = getNavbarHeight() + getCategoryNavHeight() + 16;
    const top = DOM.menuContainer.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

function getNavbarHeight() {
  return DOM.navbar ? DOM.navbar.offsetHeight : 64;
}

function getCategoryNavHeight() {
  return DOM.categoryNavWrapper ? DOM.categoryNavWrapper.offsetHeight : 52;
}

// ============================================
// 11. RENDER MENU
// ============================================
function renderMenu() {
  const menu = APP_DATA.menu || [];
  const currency = APP_DATA.restaurant?.currency || "Rs.";

  let html = "";

  menu.forEach((category, catIndex) => {
    html += `
      <section class="menu-section" id="section-${category.id}" data-category="${category.id}" style="animation-delay: ${catIndex * 0.05}s;">
        <div class="section-header">
          <span class="section-emoji">${category.emoji || ""}</span>
          <h2 class="section-title">${category.name}</h2>
          <span class="section-count">${category.item_count} ${category.item_count === 1 ? "item" : "items"}</span>
        </div>
        <div class="items-grid">
    `;

    category.items.forEach((item, itemIndex) => {
      let priceDisplay = "";
      let hasVariants = item.has_variants && item.variants.length > 0;

      if (hasVariants) {
        const minPrice = Math.min(...item.variants.map((v) => v.price));
        priceDisplay = `<span class="card-price-from">from</span>${currency} ${formatPrice(minPrice)}`;
      } else {
        priceDisplay = `${currency} ${formatPrice(item.price)}`;
      }

      let badgesHtml = "";
      if (item.badges && item.badges.length > 0) {
        badgesHtml = '<div class="card-badges">';
        item.badges.forEach((badge) => {
          badgesHtml += `<span class="card-badge" style="background-color: ${badge.badge_color};">${badge.badge_text}</span>`;
        });
        badgesHtml += "</div>";
      }

      let variantTag = "";
      if (hasVariants) {
        variantTag = `
          <span class="card-variant-tag">
            <span>${item.variants.length} sizes</span>
          </span>
        `;
      }

      html += `
        <article class="menu-card" 
                 data-item-id="${item.id}" 
                 data-category="${category.id}"
                 data-name="${item.name.toLowerCase()}"
                 data-description="${(item.description || "").toLowerCase()}"
                 style="animation-delay: ${(catIndex * 0.05) + (itemIndex * 0.03)}s;"
                 role="button"
                 tabindex="0"
                 aria-label="View ${item.name}">
          <div class="card-image-wrapper">
            <img class="card-image" 
                 src="${item.image_url}" 
                 alt="${item.name}"
                 loading="lazy"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22 fill=%22%23F8F9FA%22><rect width=%22400%22 height=%22300%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2248%22>${category.emoji || "🍽️"}</text></svg>'">
          </div>
          <div class="card-content">
            <div class="card-top">
              ${badgesHtml}
              <h3 class="card-title">${item.name}</h3>
              <p class="card-description">${item.description || ""}</p>
            </div>
            <div class="card-bottom">
              <span class="card-price">${priceDisplay}</span>
              ${variantTag}
            </div>
          </div>
        </article>
      `;
    });

    html += `
        </div>
      </section>
    `;
  });

  DOM.menuContainer.innerHTML = html;

  const cards = DOM.menuContainer.querySelectorAll(".menu-card");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      openItemModal(card.dataset.itemId);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openItemModal(card.dataset.itemId);
      }
    });
  });

  console.log("🍽️ Menu rendered: " + menu.length + " categories");
}

// ============================================
// 12. FILTER MENU
// ============================================
function filterMenu() {
  const searchTerm = DOM.searchInput.value.toLowerCase().trim();
  const sections = DOM.menuContainer.querySelectorAll(".menu-section");
  const cards = DOM.menuContainer.querySelectorAll(".menu-card");

  let visibleCount = 0;

  if (searchTerm.length > 0) {
    sections.forEach((section) => {
      section.style.display = "none";
    });

    cards.forEach((card) => {
      const name = card.dataset.name || "";
      const description = card.dataset.description || "";
      const matchesSearch = name.includes(searchTerm) || description.includes(searchTerm);
      const matchesCategory = ACTIVE_CATEGORY === "all" || card.dataset.category === ACTIVE_CATEGORY;

      if (matchesSearch && matchesCategory) {
        card.style.display = "";
        card.closest(".menu-section").style.display = "";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });
  } else {
    sections.forEach((section) => {
      if (ACTIVE_CATEGORY === "all" || section.dataset.category === ACTIVE_CATEGORY) {
        section.style.display = "";
      } else {
        section.style.display = "none";
      }
    });

    cards.forEach((card) => {
      card.style.display = "";
      if (ACTIVE_CATEGORY === "all" || card.dataset.category === ACTIVE_CATEGORY) {
        visibleCount++;
      }
    });

    visibleCount = visibleCount || 1;
  }

  if (visibleCount === 0) {
    DOM.noResults.style.display = "";
    DOM.menuContainer.style.display = "none";
  } else {
    DOM.noResults.style.display = "none";
    DOM.menuContainer.style.display = "";
  }
}

// ============================================
// 13. SEARCH
// ============================================
function setupSearch() {
  let debounceTimer;

  DOM.searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const value = DOM.searchInput.value.trim();
      DOM.searchClear.style.display = value.length > 0 ? "" : "none";
      filterMenu();
    }, 200);
  });

  DOM.searchClear.addEventListener("click", () => {
    DOM.searchInput.value = "";
    DOM.searchClear.style.display = "none";
    filterMenu();
    DOM.searchInput.focus();
  });
}

// ============================================
// 14. ITEM MODAL
// ============================================
function openItemModal(itemId) {
  const item = findItemById(itemId);
  if (!item) {
    console.error("Item not found:", itemId);
    return;
  }

  CURRENT_ITEM = item;
  SELECTED_VARIANT = null;

  const currency = APP_DATA.restaurant?.currency || "Rs.";

  DOM.modalImage.src = item.image_url || "";
  DOM.modalImage.alt = item.name;

  let badgesHtml = "";
  if (item.badges && item.badges.length > 0) {
    item.badges.forEach((badge) => {
      badgesHtml += `<span class="modal-badge" style="background-color: ${badge.badge_color};">${badge.badge_text}</span>`;
    });
  }
  DOM.modalBadges.innerHTML = badgesHtml;
  DOM.modalBadges.style.display = item.badges && item.badges.length > 0 ? "" : "none";

  DOM.modalTitle.textContent = item.name;
  DOM.modalDescription.textContent = item.description || "";

  const hasVariants = item.has_variants && item.variants.length > 0;

  if (hasVariants) {
    DOM.modalVariants.style.display = "";

    let variantsHtml = "";
    item.variants.forEach((variant, index) => {
      variantsHtml += `
        <div class="variant-option ${index === 0 ? "selected" : ""}" 
             data-variant-id="${variant.variant_id}"
             data-variant-price="${variant.price}"
             data-variant-name="${variant.variant_name}">
          <span class="variant-name">${variant.variant_name}</span>
          <span class="variant-price">${currency} ${formatPrice(variant.price)}</span>
        </div>
      `;
    });
    DOM.variantsList.innerHTML = variantsHtml;

    SELECTED_VARIANT = item.variants[0];
    DOM.modalPrice.textContent = `${currency} ${formatPrice(SELECTED_VARIANT.price)}`;

    const variantOptions = DOM.variantsList.querySelectorAll(".variant-option");
    variantOptions.forEach((opt) => {
      opt.addEventListener("click", () => {
        variantOptions.forEach((o) => o.classList.remove("selected"));
        opt.classList.add("selected");

        SELECTED_VARIANT = {
          variant_id: opt.dataset.variantId,
          variant_name: opt.dataset.variantName,
          price: parseFloat(opt.dataset.variantPrice),
        };
        DOM.modalPrice.textContent = `${currency} ${formatPrice(SELECTED_VARIANT.price)}`;
        updateWhatsAppLink();
      });
    });
  } else {
    DOM.modalVariants.style.display = "none";
    DOM.modalPrice.textContent = `${currency} ${formatPrice(item.price)}`;
  }

  updateWhatsAppLink();

  const orderEnabled = APP_DATA.settings?.order_enabled === "yes";
  DOM.btnOrder.style.display = orderEnabled ? "" : "none";

  DOM.modalOverlay.style.display = "";
  requestAnimationFrame(() => {
    DOM.modalOverlay.classList.add("active");
  });

  document.body.style.overflow = "hidden";
  console.log("📋 Modal opened for:", item.name);
}

function closeItemModal() {
  DOM.modalOverlay.classList.remove("active");

  setTimeout(() => {
    DOM.modalOverlay.style.display = "none";
  }, 300);

  document.body.style.overflow = "";
  CURRENT_ITEM = null;
  SELECTED_VARIANT = null;
}

function updateWhatsAppLink() {
  if (!CURRENT_ITEM) return;

  const info = APP_DATA.restaurant || {};
  const currency = info.currency || "Rs.";
  const whatsapp = info.whatsapp || "";

  let message = "";

  if (SELECTED_VARIANT) {
    message = `Hi! I'd like to order:\n\n🍽️ *${CURRENT_ITEM.name}*\n📐 Size: ${SELECTED_VARIANT.variant_name}\n💰 Price: ${currency} ${formatPrice(SELECTED_VARIANT.price)}\n\nPlease confirm availability. Thank you!`;
  } else {
    message = `Hi! I'd like to order:\n\n🍽️ *${CURRENT_ITEM.name}*\n💰 Price: ${currency} ${formatPrice(CURRENT_ITEM.price)}\n\nPlease confirm availability. Thank you!`;
  }

  const encoded = encodeURIComponent(message);
  DOM.btnOrder.href = `https://wa.me/${whatsapp}?text=${encoded}`;
}

function findItemById(itemId) {
  const menu = APP_DATA.menu || [];
  for (const category of menu) {
    for (const item of category.items) {
      if (item.id === itemId) {
        return item;
      }
    }
  }
  return null;
}

// ============================================
// 15. CART SYSTEM
// ============================================
function addToCart() {
  if (!CURRENT_ITEM) return;

  const cartItem = {
    id: CURRENT_ITEM.id,
    name: CURRENT_ITEM.name,
    image_url: CURRENT_ITEM.image_url,
    price: SELECTED_VARIANT ? SELECTED_VARIANT.price : CURRENT_ITEM.price,
    variant_name: SELECTED_VARIANT ? SELECTED_VARIANT.variant_name : null,
    variant_id: SELECTED_VARIANT ? SELECTED_VARIANT.variant_id : null,
    quantity: 1,
  };

  const existingIndex = CART.findIndex(
    (item) =>
      item.id === cartItem.id &&
      item.variant_id === cartItem.variant_id
  );

  if (existingIndex > -1) {
    CART[existingIndex].quantity += 1;
  } else {
    CART.push(cartItem);
  }

  updateCartUI();
  closeItemModal();

  DOM.cartFab.classList.add("bounce");
  setTimeout(() => DOM.cartFab.classList.remove("bounce"), 500);

  DOM.btnAddCart.classList.add("added");
  setTimeout(() => DOM.btnAddCart.classList.remove("added"), 700);

  console.log("🛒 Added to cart:", cartItem.name, "| Cart size:", CART.length);
}

function removeFromCart(index) {
  CART.splice(index, 1);
  updateCartUI();
  console.log("🗑️ Removed from cart | Cart size:", CART.length);
}

function updateCartQuantity(index, change) {
  CART[index].quantity += change;

  if (CART[index].quantity <= 0) {
    removeFromCart(index);
    return;
  }

  updateCartUI();
}

function updateCartUI() {
  const currency = APP_DATA.restaurant?.currency || "Rs.";
  const totalItems = CART.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = CART.reduce((sum, item) => sum + item.price * item.quantity, 0);

  DOM.cartFabCount.textContent = totalItems;
  DOM.cartFab.style.display = totalItems > 0 ? "" : "none";

  if (CART.length === 0) {
    DOM.cartEmpty.style.display = "";
    DOM.cartBody.style.display = "none";
    DOM.cartFooter.style.display = "none";
  } else {
    DOM.cartEmpty.style.display = "none";
    DOM.cartBody.style.display = "";
    DOM.cartFooter.style.display = "";

    let html = "";
    CART.forEach((item, index) => {
      html += `
        <div class="cart-item">
          <img class="cart-item-image" src="${item.image_url}" alt="${item.name}" 
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 fill=%22%23F8F9FA%22><rect width=%22100%22 height=%22100%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2224%22>🍽️</text></svg>'">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            ${item.variant_name ? `<div class="cart-item-variant">${item.variant_name}</div>` : ""}
            <div class="cart-item-price">${currency} ${formatPrice(item.price * item.quantity)}</div>
          </div>
          <div class="cart-item-actions">
            <button class="cart-item-remove" onclick="removeFromCart(${index})" aria-label="Remove item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="qty-controls">
              <button class="qty-btn" onclick="updateCartQuantity(${index}, -1)">−</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn" onclick="updateCartQuantity(${index}, +1)">+</button>
            </div>
          </div>
        </div>
      `;
    });

    DOM.cartBody.innerHTML = html;
    DOM.cartTotal.textContent = `${currency} ${formatPrice(totalPrice)}`;
  }
}

function openCart() {
  DOM.cartOverlay.style.display = "";
  requestAnimationFrame(() => {
    DOM.cartOverlay.classList.add("active");
  });
  document.body.style.overflow = "hidden";
}

function closeCart() {
  DOM.cartOverlay.classList.remove("active");
  setTimeout(() => {
    DOM.cartOverlay.style.display = "none";
  }, 350);
  document.body.style.overflow = "";
}

// ============================================
// 16. ORDER TYPE POPUP
// ============================================
function openOrderTypePopup() {
  closeCart();
  setTimeout(() => {
    DOM.ordertypeOverlay.style.display = "";
    requestAnimationFrame(() => {
      DOM.ordertypeOverlay.classList.add("active");
    });
    document.body.style.overflow = "hidden";
  }, 400);
}

function closeOrderTypePopup() {
  DOM.ordertypeOverlay.classList.remove("active");
  setTimeout(() => {
    DOM.ordertypeOverlay.style.display = "none";
  }, 300);
  document.body.style.overflow = "";
}

// ============================================
// 17. DINE IN POPUP
// ============================================
function openDineInPopup() {
  closeOrderTypePopup();
  setTimeout(() => {
    DOM.dineinOverlay.style.display = "";
    requestAnimationFrame(() => {
      DOM.dineinOverlay.classList.add("active");
    });
    document.body.style.overflow = "hidden";
  }, 350);
}

function closeDineInPopup() {
  DOM.dineinOverlay.classList.remove("active");
  setTimeout(() => {
    DOM.dineinOverlay.style.display = "none";
  }, 300);
  document.body.style.overflow = "";
}

function submitDineInOrder() {
  const name = DOM.dineinName.value.trim();
  const table = DOM.dineinTable.value.trim();
  const notes = DOM.dineinNotes.value.trim();

  let hasError = false;

  if (!name) {
    DOM.dineinName.classList.add("form-error");
    hasError = true;
  } else {
    DOM.dineinName.classList.remove("form-error");
  }

  if (!table) {
    DOM.dineinTable.classList.add("form-error");
    hasError = true;
  } else {
    DOM.dineinTable.classList.remove("form-error");
  }

  if (hasError) return;

  const message = buildOrderMessage("dine-in", {
    name,
    table,
    notes,
  });

  sendWhatsAppOrder(message);

  DOM.dineinName.value = "";
  DOM.dineinTable.value = "";
  DOM.dineinNotes.value = "";
  CART = [];
  updateCartUI();
  closeDineInPopup();
}

// ============================================
// 18. TAKEAWAY POPUP
// ============================================
function openTakeawayPopup() {
  closeOrderTypePopup();
  setTimeout(() => {
    DOM.takeawayOverlay.style.display = "";
    requestAnimationFrame(() => {
      DOM.takeawayOverlay.classList.add("active");
    });
    document.body.style.overflow = "hidden";
  }, 350);
}

function closeTakeawayPopup() {
  DOM.takeawayOverlay.classList.remove("active");
  setTimeout(() => {
    DOM.takeawayOverlay.style.display = "none";
  }, 300);
  document.body.style.overflow = "";
}

function submitTakeawayOrder() {
  const name = DOM.takeawayName.value.trim();
  const phone = DOM.takeawayPhone.value.trim();
  const address = DOM.takeawayAddress.value.trim();
  const notes = DOM.takeawayNotes.value.trim();

  let hasError = false;

  if (!name) {
    DOM.takeawayName.classList.add("form-error");
    hasError = true;
  } else {
    DOM.takeawayName.classList.remove("form-error");
  }

  if (!phone) {
    DOM.takeawayPhone.classList.add("form-error");
    hasError = true;
  } else {
    DOM.takeawayPhone.classList.remove("form-error");
  }

  if (!address) {
    DOM.takeawayAddress.classList.add("form-error");
    hasError = true;
  } else {
    DOM.takeawayAddress.classList.remove("form-error");
  }

  if (hasError) return;

  const message = buildOrderMessage("takeaway", {
    name,
    phone,
    address,
    notes,
  });

  sendWhatsAppOrder(message);

  DOM.takeawayName.value = "";
  DOM.takeawayPhone.value = "";
  DOM.takeawayAddress.value = "";
  DOM.takeawayNotes.value = "";
  CART = [];
  updateCartUI();
  closeTakeawayPopup();
}

// ============================================
// 19. BUILD ORDER MESSAGE
// ============================================
function buildOrderMessage(type, details) {
  const currency = APP_DATA.restaurant?.currency || "Rs.";
  const restaurantName = APP_DATA.restaurant?.name || "Restaurant";
  const totalPrice = CART.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let msg = "";

  if (type === "dine-in") {
    msg += `🍽️ *DINE IN ORDER*\n`;
    msg += `━━━━━━━━━━━━━━━━━\n`;
    msg += `📋 *Restaurant:* ${restaurantName}\n`;
    msg += `👤 *Name:* ${details.name}\n`;
    msg += `🪑 *Table:* ${details.table}\n`;
  } else {
    msg += `🛵 *TAKEAWAY ORDER*\n`;
    msg += `━━━━━━━━━━━━━━━━━\n`;
    msg += `📋 *Restaurant:* ${restaurantName}\n`;
    msg += `👤 *Name:* ${details.name}\n`;
    msg += `📱 *Phone:* ${details.phone}\n`;
    msg += `📍 *Address:* ${details.address}\n`;
  }

  msg += `━━━━━━━━━━━━━━━━━\n`;
  msg += `🛒 *ORDER ITEMS:*\n\n`;

  CART.forEach((item, index) => {
    msg += `${index + 1}. *${item.name}*`;
    if (item.variant_name) {
      msg += ` (${item.variant_name})`;
    }
    msg += `\n`;
    msg += `   Qty: ${item.quantity} × ${currency} ${formatPrice(item.price)} = ${currency} ${formatPrice(item.price * item.quantity)}\n\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *TOTAL: ${currency} ${formatPrice(totalPrice)}*\n`;

  if (details.notes) {
    msg += `━━━━━━━━━━━━━━━━━\n`;
    msg += `📝 *Notes:* ${details.notes}\n`;
  }

  msg += `━━━━━━━━━━━━━━━━━\n`;
  msg += `🕐 *Time:* ${new Date().toLocaleString("en-PK")}\n`;
  msg += `\nThank you! 🙏`;

  return msg;
}

function sendWhatsAppOrder(message) {
  const whatsapp = APP_DATA.restaurant?.whatsapp || "";
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${whatsapp}?text=${encoded}`;
  window.open(url, "_blank");
}

// ============================================
// 20. SOCIAL LINKS
// ============================================
function renderSocialLinks() {
  const socialLinks = APP_DATA.social_links || [];

  if (socialLinks.length === 0) {
    DOM.footerSocial.style.display = "none";
    return;
  }

  let html = "";
  socialLinks.forEach((link) => {
    html += `
      <a href="${link.url}" class="social-link" target="_blank" rel="noopener noreferrer" title="${link.platform}" aria-label="${link.platform}">
        ${link.icon}
      </a>
    `;
  });

  DOM.footerSocial.innerHTML = html;
  DOM.footerSocial.style.display = "";

  console.log("🔗 Social links rendered:", socialLinks.length);
}
// ============================================
// HERO BANNER SLIDER
// ============================================
function renderHeroBanners() {
  const banners = APP_DATA.banners || [];
  const heroBanners = banners.filter((b) => b.position === "hero");

  const hero = document.getElementById("hero");
  const track = document.getElementById("hero-slider-track");
  const dotsContainer = document.getElementById("hero-dots");
  const bannerLink = document.getElementById("hero-banner-link");

  if (!hero || !track || !dotsContainer) return;

  // No banners — show solid color fallback
  if (heroBanners.length === 0) {
    hero.classList.add("no-banner");
    console.log("📢 No hero banners — using solid background");
    return;
  }

  // Build slides
  let slidesHtml = "";
  heroBanners.forEach((banner) => {
    slidesHtml += `
      <div class="hero-slide" data-link="${banner.link_url || ""}">
        <img class="hero-slide-image" src="${banner.image_url}" alt="${banner.alt_text || "Banner"}" loading="eager"
             onerror="this.src=''; this.closest('.hero-slide').style.backgroundColor='var(--color-primary)';">
      </div>
    `;
  });
  track.innerHTML = slidesHtml;

  // Build dots
  let dotsHtml = "";
  heroBanners.forEach((_, index) => {
    dotsHtml += `<button class="hero-dot ${index === 0 ? "active" : ""}" data-index="${index}" aria-label="Slide ${index + 1}"></button>`;
  });
  dotsContainer.innerHTML = dotsHtml;

  // Single banner — hide dots
  if (heroBanners.length <= 1) {
    dotsContainer.classList.add("single");
  }

  // Set initial banner link
  updateHeroBannerLink(heroBanners[0], bannerLink);

  // Current slide tracker
  let currentSlide = 0;
  const totalSlides = heroBanners.length;
  const dots = dotsContainer.querySelectorAll(".hero-dot");

  // Go to slide function
  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentSlide);
    });

    // Update banner link
    updateHeroBannerLink(heroBanners[currentSlide], bannerLink);
  }

  // Dot click
  dots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      const index = parseInt(dot.dataset.index);
      goToSlide(index);
    });
  });

  // Auto slide
  if (totalSlides > 1) {
    let autoSlideInterval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % totalSlides;
      goToSlide(nextSlide);
    }, 5000);

    // Pause on hover
    hero.addEventListener("mouseenter", () => {
      clearInterval(autoSlideInterval);
    });

    hero.addEventListener("mouseleave", () => {
      autoSlideInterval = setInterval(() => {
        const nextSlide = (currentSlide + 1) % totalSlides;
        goToSlide(nextSlide);
      }, 5000);
    });
  }

  // Touch/Swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  hero.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  hero.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleHeroSwipe();
  }, { passive: true });

  function handleHeroSwipe() {
    const diff = touchStartX - touchEndX;
    const threshold = 50;

    if (Math.abs(diff) < threshold) return;

    if (diff > 0) {
      // Swipe left — next
      const nextSlide = (currentSlide + 1) % totalSlides;
      goToSlide(nextSlide);
    } else {
      // Swipe right — prev
      const prevSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      goToSlide(prevSlide);
    }
  }

  console.log("📢 Hero banners rendered:", heroBanners.length);
}

function updateHeroBannerLink(banner, linkElement) {
  if (!linkElement) return;

  if (banner && banner.link_url && banner.link_url.trim() !== "") {
    linkElement.href = banner.link_url;
    linkElement.style.display = "";
    linkElement.classList.remove("no-link");
  } else {
    linkElement.href = "#";
    linkElement.style.display = "";
    linkElement.classList.add("no-link");
  }
}
// ============================================
// 21. FOOTER
// ============================================
function populateFooter() {
  const info = APP_DATA.restaurant || {};

  DOM.footerEmoji.textContent = info.hero_emoji || "☕";
  DOM.footerName.textContent = info.name || "Restaurant";
  DOM.footerText.textContent = info.footer_text || "Thank you for visiting";
  DOM.footerCopyName.textContent = info.name || "Restaurant";

  if (info.phone) {
    DOM.footerPhone.href = `tel:+${info.phone}`;
    DOM.footerPhoneText.textContent = "Call Us";
  }

  if (info.whatsapp) {
    DOM.footerWhatsapp.href = `https://wa.me/${info.whatsapp}`;
    DOM.footerWhatsapp.target = "_blank";
  }

  if (info.maps_url) {
    DOM.footerMaps.href = info.maps_url;
    DOM.footerMaps.target = "_blank";
  }
  // Google Review
  const reviewUrl = APP_DATA.settings?.google_review_url;
  const reviewBtn = document.getElementById("btn-google-review");
  const reviewSection = document.getElementById("review-section");
  
  if (reviewUrl && reviewBtn) {
    reviewBtn.href = reviewUrl;
    reviewSection.style.display = "";
  } else if (reviewSection) {
    reviewSection.style.display = "none";
  }
  console.log("📌 Footer populated");
}

// ============================================
// 22. SCROLL HANDLING
// ============================================
function setupScrollHandling() {
  let ticking = false;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
}

function handleScroll() {
  const scrollY = window.pageYOffset;

  if (scrollY > 10) {
    DOM.navbar.classList.add("scrolled");
  } else {
    DOM.navbar.classList.remove("scrolled");
  }

  if (scrollY > 200) {
    DOM.categoryNavWrapper.classList.add("scrolled");
  } else {
    DOM.categoryNavWrapper.classList.remove("scrolled");
  }

  if (scrollY > 600) {
    DOM.scrollTop.classList.add("visible");
    DOM.scrollTop.style.display = "";
  } else {
    DOM.scrollTop.classList.remove("visible");
  }

  updateActiveCategoryOnScroll();
}

function updateActiveCategoryOnScroll() {
  if (ACTIVE_CATEGORY !== "all" && DOM.searchInput.value.trim() !== "") return;

  const sections = DOM.menuContainer.querySelectorAll(".menu-section");
  const offset = getNavbarHeight() + getCategoryNavHeight() + 40;

  let currentSection = null;

  sections.forEach((section) => {
    if (section.style.display === "none") return;
    const rect = section.getBoundingClientRect();
    if (rect.top <= offset) {
      currentSection = section;
    }
  });

  if (currentSection) {
    const categoryId = currentSection.dataset.category;
    const chips = DOM.categoryNav.querySelectorAll(".category-chip");
    chips.forEach((chip) => {
      if (chip.dataset.category === categoryId) {
        chip.classList.add("active");
        chip.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      } else if (chip.dataset.category !== "all") {
        chip.classList.remove("active");
      }
    });
  }
}

// ============================================
// 23. SCROLL TO TOP
// ============================================
function setupScrollToTop() {
  DOM.scrollTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// ============================================
// 24. UI STATE HELPERS
// ============================================
function hideLoader() {
  DOM.loader.classList.add("hidden");

  setTimeout(() => {
    DOM.loader.style.display = "none";
  }, 400);

  DOM.app.style.display = "";
}

function showError(message) {
  DOM.loader.style.display = "none";
  DOM.app.style.display = "none";
  DOM.errorState.style.display = "";
  DOM.errorMessage.textContent = message || "Could not load menu data.";
}

// ============================================
// 25. UTILITY FUNCTIONS
// ============================================
function formatPrice(price) {
  const num = parseFloat(price);
  if (isNaN(num)) return "0";

  if (num >= 1000) {
    return num.toLocaleString("en-PK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  return Math.round(num).toString();
}

// ============================================
// 26. EVENT LISTENERS SETUP
// ============================================
function setupEventListeners() {
  // Search
  setupSearch();

  // Scroll handling
  setupScrollHandling();

  // Scroll to top
  setupScrollToTop();

  // Modal close
  DOM.modalClose.addEventListener("click", closeItemModal);

  DOM.modalOverlay.addEventListener("click", (e) => {
    if (e.target === DOM.modalOverlay) {
      closeItemModal();
    }
  });

  DOM.itemModal.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeItemModal();
      closeCart();
      closeOrderTypePopup();
      closeDineInPopup();
      closeTakeawayPopup();
    }
  });

  // Modal image error
  DOM.modalImage.addEventListener("error", () => {
    DOM.modalImageWrapper.style.display = "none";
  });

  DOM.modalImage.addEventListener("load", () => {
    DOM.modalImageWrapper.style.display = "";
  });

  // Add to Cart (Modal)
  DOM.btnAddCart.addEventListener("click", addToCart);

  // Cart FAB
  DOM.cartFab.addEventListener("click", openCart);

  // Cart Close
  DOM.cartClose.addEventListener("click", closeCart);
  DOM.cartOverlay.addEventListener("click", (e) => {
    if (e.target === DOM.cartOverlay) closeCart();
  });

  // Checkout
  DOM.btnCheckout.addEventListener("click", openOrderTypePopup);

  // Order Type
  DOM.ordertypeClose.addEventListener("click", closeOrderTypePopup);
  DOM.ordertypeOverlay.addEventListener("click", (e) => {
    if (e.target === DOM.ordertypeOverlay) closeOrderTypePopup();
  });

  DOM.btnDinein.addEventListener("click", () => {
    ORDER_TYPE = "dine-in";
    openDineInPopup();
  });

  DOM.btnTakeaway.addEventListener("click", () => {
    ORDER_TYPE = "takeaway";
    openTakeawayPopup();
  });

  // Dine In
  DOM.dineinClose.addEventListener("click", closeDineInPopup);
  DOM.dineinOverlay.addEventListener("click", (e) => {
    if (e.target === DOM.dineinOverlay) closeDineInPopup();
  });
  DOM.btnDineinSubmit.addEventListener("click", submitDineInOrder);

  // Takeaway
  DOM.takeawayClose.addEventListener("click", closeTakeawayPopup);
  DOM.takeawayOverlay.addEventListener("click", (e) => {
    if (e.target === DOM.takeawayOverlay) closeTakeawayPopup();
  });
  DOM.btnTakeawaySubmit.addEventListener("click", submitTakeawayOrder);

  console.log("🎯 Event listeners setup complete");
}

// ============================================
// 27. SERVICE WORKER REGISTRATION
// ============================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => console.log("✅ SW registered:", reg.scope))
      .catch((err) => console.log("❌ SW failed:", err));
  });
}
// ============================================================
// PAGE ROUTING (PISAHKAN HALAMAN)
// ============================================================
const PAGES = {
  hero: "beranda",
  menu: "menu",
  keranjang: "keranjang",
  checkout: "pesan",
  tentang: "tentang"
};

let currentPage = "hero";

function showPage(pageId) {
  // Sembunyikan semua section
  document.querySelectorAll("section[id]").forEach(section => {
    section.style.display = "none";
    section.classList.remove("active");
  });

  // Tampilkan section yang dipilih
  const section = document.getElementById(pageId);
  if (section) {
    section.style.display = "block";
    section.classList.add("active");
    currentPage = pageId;
    
    // Scroll ke atas
    window.scrollTo(0, 0);
    
    // Update URL hash
    history.pushState(null, "", `#${pageId}`);
    
    // Tutup hamburger menu
    const navLinks = document.getElementById("nav-links");
    if (navLinks) {
      navLinks.classList.remove("open");
    }
  }
}

function initializePageRouting() {
  // Sembunyikan semua section saat awal
  document.querySelectorAll("section[id]").forEach(section => {
    section.style.display = "none";
  });

  // Ambil halaman dari URL hash
  const hash = window.location.hash.slice(1) || "hero";
  showPage(hash);
  
  // Handle navigasi link
  document.querySelectorAll("nav a[href^='#']").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const pageId = link.getAttribute("href").slice(1);
      showPage(pageId);
    });
  });

  // Handle perubahan URL hash
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.slice(1) || "hero";
    showPage(hash);
  });

  // Handle tombol cart
  const cartBtn = document.querySelector(".nav-cart-btn");
  if (cartBtn) {
    cartBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showPage("keranjang");
    });
  }

  // Handle tombol checkout di keranjang
  const checkoutLinks = document.querySelectorAll('a[href="#checkout"]');
  checkoutLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showPage("checkout");
    });
  });
}

// ============================================================
// DATA MENU
// ============================================================
const MENU_DATA = [
  {
    id: 1,
    name: "Ayam Geprek Sambal Korek",
    desc: "Ayam crispy dilumat di atas sambal korek ulek segar. Crunchy di luar, juicy di dalam.",
    price: 18000,
    emoji: "🍗",
    badge: "Best Seller",
    hasLevel: true,
    image: "foto5.jpg"
  },
  {
    id: 2,
    name: "Ayam Geprek Keju Mozzarella",
    desc: "Geprek spesial disiram keju mozzarella meleleh. Kombinasi pedas & creamy yang nagih!",
    price: 24000,
    emoji: "🧀",
    badge: "Favorit",
    hasLevel: true,
    image: "foto4.jpeg"
  },
  {
    id: 3,
    name: "Ayam Geprek Sambal Ijo",
    desc: "Cabe hijau segar diulek kasar. Pedas khas yang berbeda, aroma harum menggugah selera.",
    price: 19000,
    emoji: "🌿",
    badge: "Spesial",
    hasLevel: true,
    image: "foto3.webp"
  },
  {
    id: 4,
    name: "Paket Geprek Hemat",
    desc: "Ayam Geprek + Nasi Putih + Es Teh Manis. Kenyang, segar, dompet aman!",
    price: 25000,
    emoji: "🍱",
    badge: "Hemat",
    hasLevel: true,
    image: "foto2.jpeg"
  }
];

// ============================================================
// STATE
// ============================================================
let cart = [];
let deliveryMethod = "pickup";

const DELIVERY_FEE = 5000;
const ADMIN_WA = "6281234567890";

// ============================================================
// LEVEL DEFAULT
// ============================================================
const selectedLevels = {};

MENU_DATA.forEach(item => {
  if (item.hasLevel) {
    selectedLevels[item.id] = 1;
  }
});

// ============================================================
// FORMAT RUPIAH
// ============================================================
function formatRp(value) {
  return "Rp " + value.toLocaleString("id-ID");
}

// ============================================================
// TOAST
// ============================================================
function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.innerHTML = `✅ ${message}`;
  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// ============================================================
// RENDER MENU
// ============================================================
function renderMenuCards() {
  const grid = document.getElementById("menu-grid");

  if (!grid) return;

  grid.innerHTML = MENU_DATA.map(item => `
    <div class="menu-card fade-in">

      <div class="card-emoji-wrap">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" class="card-image">` : `<span>${item.emoji}</span>`}
        <span class="card-badge">${item.badge}</span>
      </div>

      <div class="card-body">

        <div class="card-title">${item.name}</div>

        <div class="card-desc">
          ${item.desc}
        </div>

        <div class="card-price">
          ${formatRp(item.price)}
        </div>

        <div class="level-wrap">
          <div class="level-label">
            🌶️ Level Pedas
          </div>

          <div class="level-btns">
            ${[1,2,3,4,5].map(level => `
              <button
                class="lvl-btn ${level===1 ? "active" : ""}"
                onclick="selectLevel(this,${item.id},${level})">
                ${level}
              </button>
            `).join("")}
          </div>
        </div>

        <button
          class="add-btn"
          onclick="addToCart(${item.id})">
          🛒 Tambah ke Keranjang
        </button>

      </div>

    </div>
  `).join("");

  observeFadeIn();
}

// ============================================================
// PILIH LEVEL
// ============================================================
function selectLevel(btn, menuId, level) {
  selectedLevels[menuId] = level;

  const card = btn.closest(".menu-card");

  card.querySelectorAll(".lvl-btn").forEach(button => {
    button.classList.remove("active");
  });

  btn.classList.add("active");
}

// ============================================================
// TAMBAH KE KERANJANG
// ============================================================
function addToCart(menuId) {

  const item = MENU_DATA.find(menu => menu.id === menuId);

  if (!item) return;

  const level = selectedLevels[menuId] || 1;

  const key = `${menuId}-${level}`;

  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      key,
      menuId,
      name: item.name,
      emoji: item.emoji,
      level,
      price: item.price,
      qty: 1
    });
  }

  renderCart();

  showToast(`${item.name} ditambahkan`);
}

// ============================================================
// UBAH JUMLAH
// ============================================================
function changeQty(key, delta) {

  const item = cart.find(cartItem => cartItem.key === key);

  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    removeItem(key);
    return;
  }

  renderCart();
}

// ============================================================
// HAPUS ITEM
// ============================================================
function removeItem(key) {
  cart = cart.filter(item => item.key !== key);
  renderCart();
}

// ============================================================
// RENDER CART
// ============================================================
function renderCart() {

  const list = document.getElementById("cart-items-list");
  const badge = document.getElementById("cart-badge");

  if (!list || !badge) return;

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  badge.textContent = totalQty;

  if (cart.length === 0) {

    list.innerHTML = `
      <div class="cart-empty">
        Keranjang masih kosong 😢<br>
        Yuk pilih menu dulu!
      </div>
    `;

  } else {

    list.innerHTML = cart.map(item => `
      <div class="cart-item">

        <div class="ci-emoji">${item.emoji}</div>

        <div class="ci-info">
          <div class="ci-name">${item.name}</div>
          <div class="ci-detail">
            Level ${item.level} 🌶️
          </div>
        </div>

        <div class="ci-qty">
          <button class="qty-btn"
            onclick="changeQty('${item.key}',-1)">
            −
          </button>

          <span class="qty-num">
            ${item.qty}
          </span>

          <button class="qty-btn"
            onclick="changeQty('${item.key}',1)">
            +
          </button>
        </div>

        <div class="ci-price">
          ${formatRp(item.qty * item.price)}
        </div>

        <button
          class="del-btn"
          onclick="removeItem('${item.key}')">
          🗑
        </button>

      </div>
    `).join("");
  }

  updateTotals();
}

// ============================================================
// TOTAL HARGA
// ============================================================
function updateTotals() {

  const subtotal = cart.reduce((sum, item) => {
    return sum + item.price * item.qty;
  }, 0);

  const fee =
    deliveryMethod === "delivery"
      ? DELIVERY_FEE
      : 0;

  const subtotalEl = document.getElementById("subtotal-val");
  const feeEl = document.getElementById("delivery-fee-val");
  const totalEl = document.getElementById("total-val");

  if (subtotalEl) subtotalEl.textContent = formatRp(subtotal);
  if (feeEl) feeEl.textContent = fee ? formatRp(fee) : "Gratis";
  if (totalEl) totalEl.textContent = formatRp(subtotal + fee);
}

// ============================================================
// DELIVERY
// ============================================================
function updateDelivery(radio) {

  deliveryMethod = radio.value;

  document
    .getElementById("lbl-pickup")
    ?.classList.toggle(
      "selected",
      deliveryMethod === "pickup"
    );

  document
    .getElementById("lbl-delivery")
    ?.classList.toggle(
      "selected",
      deliveryMethod === "delivery"
    );

  const addressGroup =
    document.getElementById("address-group");

  if (addressGroup) {
    addressGroup.style.display =
      deliveryMethod === "delivery"
        ? "block"
        : "none";
  }

  updateTotals();
}

// ============================================================
// PAYMENT
// ============================================================
function selectPay(el) {

  document.querySelectorAll(".pay-opt")
    .forEach(item => {
      item.classList.remove("selected");
    });

  el.classList.add("selected");

  const radio = el.querySelector("input");

  if (radio) {
    radio.checked = true;
  }
}

// ============================================================
// CHECKOUT WA
// ============================================================
function konfirmasiPesanan() {

  const nama =
    document.getElementById("cust-name").value.trim();

  const wa =
    document.getElementById("cust-wa").value.trim();

  const alamat =
    document.getElementById("cust-address").value.trim();

  const catatan =
    document.getElementById("cust-note").value.trim();

  const pembayaran =
    document.querySelector(
      'input[name="payment"]:checked'
    )?.value || "-";

  if (!nama) {
    alert("Nama wajib diisi");
    return;
  }

  if (!wa) {
    alert("Nomor WhatsApp wajib diisi");
    return;
  }

  if (cart.length === 0) {
    alert("Keranjang masih kosong");
    return;
  }

  if (
    deliveryMethod === "delivery" &&
    !alamat
  ) {
    alert("Alamat wajib diisi");
    return;
  }

  const subtotal =
    cart.reduce(
      (sum,item)=>sum + item.price * item.qty,
      0
    );

  const fee =
    deliveryMethod === "delivery"
      ? DELIVERY_FEE
      : 0;

  const total = subtotal + fee;

  let pesan = `🔥 *GEPREK SULTAN* 🔥\n\n`;

  cart.forEach((item,index)=>{

    pesan += `${index+1}. ${item.name}\n`;
    pesan += `Level ${item.level}\n`;
    pesan += `${item.qty} x ${formatRp(item.price)}\n\n`;

  });

  pesan += `👤 Nama: ${nama}\n`;
  pesan += `📱 WA: ${wa}\n`;
  pesan += `🚗 Layanan: ${deliveryMethod}\n`;

  if (deliveryMethod === "delivery") {
    pesan += `📍 Alamat: ${alamat}\n`;
  }

  pesan += `💳 Pembayaran: ${pembayaran}\n`;

  if (catatan) {
    pesan += `📝 Catatan: ${catatan}\n`;
  }

  pesan += `\n💰 Total: ${formatRp(total)}`;

  window.open(
    `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(pesan)}`,
    "_blank"
  );
}

// ============================================================
// ANIMASI SCROLL
// ============================================================
function observeFadeIn() {

  const elements =
    document.querySelectorAll(".fade-in");

  const observer =
    new IntersectionObserver(entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          observer.unobserve(entry.target);
        }

      });

    }, {
      threshold: 0.1
    });

  elements.forEach(el => observer.observe(el));
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

  initializePageRouting();
  renderMenuCards();
  renderCart();
  observeFadeIn();

  const hamburger =
    document.getElementById("hamburger");

  if (hamburger) {

    hamburger.addEventListener("click", () => {

      document
        .getElementById("nav-links")
        ?.classList.toggle("open");

    });

  }

  window.addEventListener("scroll", () => {

    document
      .getElementById("navbar")
      ?.classList.toggle(
        "scrolled",
        window.scrollY > 40
      );

  });

});
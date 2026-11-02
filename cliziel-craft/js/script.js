// ====== SETTINGS ======
const IMG_FOLDER = "assets/";          // kung nasa subfolder: "assets/products/"
const IMG_EXT = ".jpg";                 // palitan kung .png / .jpeg / .webp
const CONTACT_EMAIL = "youremail@example.com"; // dito mapupunta ang orders at messages

// ====== PRODUCTS ======
const products = [
  { file: "p1", name: "Beaded Flower Keychain", price: 25 },
  { file: "p2", name: "Beaded Floral Bag Charm", price: 45 },
  { file: "p3", name: "Beaded Flower Stem Keychain", price: 40 },
  { file: "p4", name: "Beaded Butterfly Keychain", price: 35 },
  { file: "p5", name: "Beaded Flower Keychain Set", price: 25 },
  { file: "p6", name: "Beaded Butterfly Bag Charm", price: 65 },
  { file: "p7", name: "Handmade Pearl Headband", price: 99 },
  { file: "p8", name: "Handmade Rose Headband", price: 55 },
  { file: "p9", name: "Crystal Bracelet (₱70 with box)", price: 50 },
  { file: "p10", name: "Necklace & Bracelet Set, Red Box", price: 180 },
  { file: "p11", name: "Necklace & Bracelet Set, Blue Box", price: 180 },
  { file: "p12", name: "Pendant Necklace with Box", price: 80 },
  { file: "p13", name: "Beaded Bracelet (₱85 with box)", price: 75 },
  { file: "p14", name: "Purple Beaded Phone Strap", price: 55 },
  { file: "p15", name: "Blue Beaded Phone Strap", price: 55 },
  { file: "p16", name: "Flower Hair Clip", price: 30 },
  { file: "p17", name: "Butterfly Hair Clip", price: 15 },
  { file: "p18", name: "Triple Flower Hair Clip", price: 15 },
  { file: "p19", name: "Blue Flower & Butterfly Clip Set", price: 20 },
  { file: "p20", name: "Purple Butterfly Clip Set", price: 20 },
  { file: "p21", name: "Pink Butterfly Clip Set", price: 20 },
  { file: "p22", name: "Red Butterfly Clip Set", price: 20 },
  { file: "p23", name: "Green Butterfly Clip Set", price: 20 },
];

// ====== HELPERS ======
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const peso = n => "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 });
const imgSrc = p => IMG_FOLDER + p.file + IMG_EXT;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const find = file => products.find(p => p.file === file);

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

// ====== VIEWS (sidebar + tabs) ======
const views = ["home", "overview", "reviews", "contact", "settings"];
function showView(name) {
  if (!views.includes(name)) name = "home";
  $$(".view").forEach(v => v.classList.toggle("show", v.id === "view-" + name));
  $$("[data-view]").forEach(el => {
    if (el.matches(".tab, .nav-link")) el.classList.toggle("active", el.dataset.view === name);
  });
  history.replaceState(null, "", "#" + name);
  window.scrollTo({ top: 0 });
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-view]");
  if (!el) return;
  e.preventDefault();
  showView(el.dataset.view);
});

// ====== PRODUCTS ======
function renderProducts() {
  const q = $("#search").value.trim().toLowerCase();
  const sort = $("#sort").value;
  let list = products.filter(p => p.name.toLowerCase().includes(q));
  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);
  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  $("#productGrid").innerHTML = list.length ? list.map(p => `
    <div class="card">
      <img src="${imgSrc(p)}" alt="${esc(p.name)}" loading="lazy" data-open="${p.file}">
      <div class="info"><b>${esc(p.name)}</b><span class="price">${p.price > 0 ? peso(p.price) : "Price soon"}</span>
        <button class="btn" data-add="${p.file}">Add to cart</button></div>
    </div>`).join("") : `<p class="empty">Walang nahanap na produkto.</p>`;
}
$("#search").addEventListener("input", renderProducts);
$("#sort").addEventListener("change", renderProducts);

function renderStats() {
  const priced = products.filter(p => p.price > 0);
  $("#statCount").textContent = products.length + " items";
  $("#statAvg").textContent = priced.length ? peso(priced.reduce((s, p) => s + p.price, 0) / priced.length) : "—";
  const r = load("cc-reviews", []);
  $("#statRating").textContent = r.length ? "★ " + (r.reduce((s, x) => s + x.stars, 0) / r.length).toFixed(1) + " (" + r.length + ")" : "No reviews yet";
}

// ====== PRODUCT MODAL ======
let modalFile = null;
function openModal(file) {
  const p = find(file); if (!p) return;
  modalFile = file;
  $("#mImg").src = imgSrc(p); $("#mImg").alt = p.name;
  $("#mName").textContent = p.name;
  $("#mPrice").textContent = p.price > 0 ? peso(p.price) : "Price soon";
  $("#modal").showModal();
}
$("#closeModal").addEventListener("click", () => $("#modal").close());
$("#modal").addEventListener("click", e => { if (e.target.id === "modal") e.target.close(); });
$("#mAdd").addEventListener("click", () => { addToCart(modalFile); $("#modal").close(); });

// ====== CART ======
let cart = load("cc-cart", {});
function addToCart(file) { cart[file] = (cart[file] || 0) + 1; save("cc-cart", cart); renderCart(); toast("Added to cart"); }
function renderCart() {
  const items = Object.entries(cart).filter(([f]) => find(f));
  const count = items.reduce((s, [, q]) => s + q, 0);
  const total = items.reduce((s, [f, q]) => s + find(f).price * q, 0);
  $("#cartBadge").textContent = count;
  $("#cartTotal").textContent = peso(total);
  $("#cartItems").innerHTML = items.length ? items.map(([f, q]) => {
    const p = find(f);
    return `<div class="ci"><img src="${imgSrc(p)}" alt="">
      <div class="meta"><b>${esc(p.name)}</b><div>${p.price > 0 ? peso(p.price) : "Price soon"}</div>
      <div class="qty"><button data-dec="${f}" aria-label="Less">−</button><span>${q}</span><button data-inc="${f}" aria-label="More">+</button></div></div>
      <button class="icon-btn" data-del="${f}" aria-label="Remove">✕</button></div>`;
  }).join("") : `<p class="empty">Walang laman ang cart.</p>`;
}
document.addEventListener("click", e => {
  const t = e.target;
  if (t.dataset.add) addToCart(t.dataset.add);
  if (t.dataset.open) openModal(t.dataset.open);
  if (t.dataset.inc) { cart[t.dataset.inc]++; }
  if (t.dataset.dec) { cart[t.dataset.dec]--; if (cart[t.dataset.dec] <= 0) delete cart[t.dataset.dec]; }
  if (t.dataset.del) delete cart[t.dataset.del];
  if (t.dataset.inc || t.dataset.dec || t.dataset.del) { save("cc-cart", cart); renderCart(); }
});
const setCart = open => document.body.classList.toggle("cart-open", open);
$("#openCart").addEventListener("click", () => setCart(true));
$("#closeCart").addEventListener("click", () => setCart(false));
$("#overlay").addEventListener("click", () => setCart(false));
$("#clearCart").addEventListener("click", () => { cart = {}; save("cc-cart", cart); renderCart(); });
$("#checkout").addEventListener("click", () => {
  const items = Object.entries(cart).filter(([f]) => find(f));
  if (!items.length) return toast("Walang laman ang cart");
  const lines = items.map(([f, q]) => `${q} x ${find(f).name} - ${peso(find(f).price * q)}`);
  const body = "Hello, gusto kong umorder:\n\n" + lines.join("\n") + "\n\nTotal: " + $("#cartTotal").textContent;
  location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("New order")}&body=${encodeURIComponent(body)}`;
});

// ====== REVIEWS ======
function renderReviews() {
  const r = load("cc-reviews", []);
  $("#reviewList").innerHTML = r.length ? r.slice().reverse().map(x => `
    <div class="review"><b>${esc(x.name)}</b> <span class="stars">${"★".repeat(x.stars)}${"☆".repeat(5 - x.stars)}</span>
    <p>${esc(x.text)}</p><small>${esc(x.date)}</small></div>`).join("") : `<p class="empty">Wala pang reviews. Ikaw ang una!</p>`;
  renderStats();
}
$("#reviewForm").addEventListener("submit", e => {
  e.preventDefault();
  const r = load("cc-reviews", []);
  r.push({ name: $("#rvName").value.trim(), stars: +$("#rvStars").value, text: $("#rvText").value.trim(), date: new Date().toLocaleDateString("en-PH") });
  save("cc-reviews", r); e.target.reset(); renderReviews(); toast("Salamat sa review!");
});

// ====== CONTACT ======
$("#contactForm").addEventListener("submit", e => {
  e.preventDefault();
  const body = `From: ${$("#ctName").value}\n\n${$("#ctMsg").value}`;
  location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Message from website")}&body=${encodeURIComponent(body)}`;
});

// ====== SETTINGS ======
$("#darkToggle").checked = load("cc-dark", false);
document.body.classList.toggle("dark", $("#darkToggle").checked);
$("#darkToggle").addEventListener("change", e => { document.body.classList.toggle("dark", e.target.checked); save("cc-dark", e.target.checked); });
$("#resetData").addEventListener("click", () => {
  if (!confirm("I-clear ang cart at reviews?")) return;
  cart = {}; save("cc-cart", cart); save("cc-reviews", []); renderCart(); renderReviews(); toast("Na-reset na");
});

// ====== INIT ======
document.addEventListener("keydown", e => { if (e.key === "Escape") setCart(false); });
renderProducts(); renderCart(); renderReviews();
showView(location.hash.slice(1));
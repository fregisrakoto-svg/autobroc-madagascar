// Les 10 annonces de lancement (publiées au nom de "AutoBroc")
const INITIAL_LISTINGS = [
  { id: 1, title: "Phare avant droit", brand: "Toyota", model: "Hilux", year: "2016", category: "Carrosserie", price: 420000, city: "Antananarivo", seller: "AutoBroc", description: "Phare avant droit d'origine en très bon état, fixations intactes.", image: "" },
  { id: 2, title: "Pare-choc avant", brand: "Peugeot", model: "206", year: "2008", category: "Carrosserie", price: 280000, city: "Antananarivo", seller: "AutoBroc", description: "Pare-choc avant complet prêt à peindre.", image: "" },
  { id: 3, title: "Rétroviseur gauche", brand: "Hyundai", model: "Tucson", year: "2014", category: "Carrosserie", price: 150000, city: "Mahajanga", seller: "AutoBroc", description: "Rétroviseur extérieur gauche électrique, miroir impeccable.", image: "" },
  { id: 4, title: "4 Jantes alu 15 pouces", brand: "Universel", model: "4 trous", year: "-", category: "Roues", price: 600000, city: "Antananarivo", seller: "AutoBroc", description: "Lot de 4 jantes aluminium 15 pouces en excellent état, sans fissure.", image: "" },
  { id: 5, title: "Alternateur", brand: "Toyota", model: "Corolla", year: "2012", category: "Moteur", price: 320000, city: "Mandritsara", seller: "AutoBroc", description: "Alternateur testé et fonctionnel, charge parfaite.", image: "" },
  { id: 6, title: "Feu arrière droit", brand: "Renault", model: "Duster", year: "2015", category: "Carrosserie", price: 180000, city: "Mahajanga", seller: "AutoBroc", description: "Optique arrière droit complet avec platine ampoules.", image: "" },
  { id: 7, title: "Radiateur", brand: "Peugeot", model: "405", year: "2004", category: "Moteur", price: 250000, city: "Antananarivo", seller: "AutoBroc", description: "Radiateur de refroidissement moteur sans fuite, nettoyé.", image: "" },
  { id: 8, title: "Batterie 12V 70Ah - Presque neuve", brand: "Toutes marques", model: "12V 70Ah", year: "2025", category: "Moteur", price: 220000, city: "Mandritsara", seller: "AutoBroc", description: "Utilisée 3 mois, tient parfaitement la charge.", image: "" },
  { id: 9, title: "Siège avant conducteur", brand: "Toyota", model: "Land Cruiser", year: "2010", category: "Intérieur", price: 350000, city: "Antananarivo", seller: "AutoBroc", description: "Siège conducteur confortable, rails fonctionnels.", image: "" },
  { id: 10, title: "Volant + Airbag", brand: "Hyundai", model: "i10", year: "2017", category: "Intérieur", price: 200000, city: "Mahajanga", seller: "AutoBroc", description: "Volant complet avec module airbag intact.", image: "" }
];

// Chargement depuis localStorage
let listings = JSON.parse(localStorage.getItem("autobroc_listings")) || INITIAL_LISTINGS;
let orders = JSON.parse(localStorage.getItem("autobroc_orders")) || [];

function saveState() {
  localStorage.setItem("autobroc_listings", JSON.stringify(listings));
  localStorage.setItem("autobroc_orders", JSON.stringify(orders));
  updateOrdersBadge();
}

function formatAr(amount) {
  return amount.toLocaleString("fr-FR") + " Ar";
}

function getCategoryIcon(cat) {
  const icons = { "Carrosserie": "🚘", "Moteur": "⚙️", "Roues": "🛞", "Intérieur": "💺", "Autres": "🔩" };
  return icons[cat] || "🔧";
}

// Navigation entre onglets
function switchTab(tab) {
  document.getElementById("view-catalogue").classList.add("hidden");
  document.getElementById("view-commandes").classList.add("hidden");
  document.getElementById("view-admin").classList.add("hidden");

  document.getElementById("view-" + tab).classList.remove("hidden");

  if (tab === "catalogue") renderListings();
  if (tab === "commandes") renderOrders();
  if (tab === "admin") renderAdmin();
}

// Affichage du catalogue
function renderListings() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const city = document.getElementById("cityFilter").value;
  const category = document.getElementById("categoryFilter").value;
  const grid = document.getElementById("listingsGrid");

  const filtered = listings.filter(item => {
    const matchText = `${item.title} ${item.brand} ${item.model} ${item.description}`.toLowerCase().includes(query);
    const matchCity = city === "Toutes" || item.city === city;
    const matchCat = category === "Toutes" || item.category === category;
    return matchText && matchCity && matchCat;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p>Aucune pièce trouvée pour cette recherche.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="card">
      <div class="card-img">
        ${item.image ? `<img src="${item.image}" alt="${item.title}">` : getCategoryIcon(item.category)}
      </div>
      <div class="card-body">
        <div class="badges">
          <span class="badge-city">📍 ${item.city}</span>
          <span class="badge-cat">${item.category}</span>
        </div>
        <div class="card-title">${item.title}</div>
        <div class="card-vehicle">${item.brand} ${item.model} ${item.year !== "-" ? `(${item.year})` : ""}</div>
        <div class="seller-tag">Vendeur : <strong>${item.seller}</strong></div>
        <div class="card-price">${formatAr(item.price)}</div>
        <button class="btn btn-primary" onclick="openBuyModal(${item.id})">Voir & Acheter</button>
      </div>
    </div>
  `).join("");
}

// Modale d'achat MVola (sans aucune commission affichée à l'acheteur)
function openBuyModal(id) {
  const item = listings.find(l => l.id === id);
  if (!item) return;

  const mvolaFee = Math.round(item.price * 0.015); // Frais MVola estimés (1.5%)
  const deliveryFee = 10000; // Livraison standard 10 000 Ar
  const totalToPay = item.price + mvolaFee + deliveryFee;

  document.getElementById("buyModalBody").innerHTML = `
    <span class="badge-city">📍 ${item.city}</span>
    <h2 style="margin-top:8px;">${item.title} — ${item.brand} ${item.model}</h2>
    <p style="margin:8px 0; color:#475569;">${item.description}</p>
    <p style="font-size:0.85rem; color:#64748b;">Vendeur : <strong>${item.seller}</strong></p>

    <div class="price-breakdown">
      <div class="price-line"><span>Prix de la pièce :</span><span>${formatAr(item.price)}</span></div>
      <div class="price-line"><span>Frais MVola :</span><span>${formatAr(mvolaFee)}</span></div>
      <div class="price-line"><span>Livraison :</span><span>${formatAr(deliveryFee)}</span></div>
      <div class="price-line price-total"><span>TOTAL À PAYER :</span><span>${formatAr(totalToPay)}</span></div>
    </div>

    <div style="background:#fff7ed; padding:10px; border-radius:8px; font-size:0.85rem; margin-bottom:12px;">
      🔒 <strong>Protection acheteur :</strong> Votre paiement MVola reste bloqué jusqu'à ce que vous confirmiez la réception de la pièce.
    </div>

    <label>Votre numéro MVola (ex : 034 XX XXX XX) *</label>
    <input type="tel" id="buyerPhone" placeholder="034 00 000 00" required />

    <button class="btn btn-primary btn-full" onclick="confirmMvolaPayment(${item.id}, ${item.price}, ${mvolaFee}, ${deliveryFee}, ${totalToPay})">
      Payer ${formatAr(totalToPay)} par MVola
    </button>
  `;

  document.getElementById("buyModal").classList.remove("hidden");
}

function confirmMvolaPayment(itemId, piecePrice, mvolaFee, deliveryFee, totalToPay) {
  const phone = document.getElementById("buyerPhone").value.trim();
  if (!phone) {
    alert("Veuillez entrer votre numéro MVola.");
    return;
  }

  const item = listings.find(l => l.id === itemId);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const ref = `AB-2026-${randomNum}`;

  // Commission interne propriétaire (5% du prix pièce, invisible pour acheteur/vendeur)
  const adminCommission = Math.round(piecePrice * 0.05);

  const newOrder = {
    ref,
    itemTitle: `${item.title} (${item.brand} ${item.model})`,
    city: item.city,
    seller: item.seller,
    buyerPhone: phone,
    piecePrice,
    totalPaid: totalToPay,
    adminCommission,
    status: "BLOQUÉ", // BLOQUÉ -> DÉBLOQUÉ ou REMBOURSÉ
    date: new Date().toLocaleDateString("fr-FR")
  };

  orders.unshift(newOrder);
  saveState();

  document.getElementById("buyModalBody").innerHTML = `
    <div style="text-align:center; padding:10px 0;">
      <div style="font-size:3rem;">✅</div>
      <h2>Paiement MVola confirmé !</h2>
      <p style="margin:8px 0;">Référence de suivi : <strong>${ref}</strong></p>
      <p style="font-size:1.1rem; font-weight:700; color:#16a34a;">Montant payé : ${formatAr(totalToPay)}</p>
      <p style="font-size:0.9rem; color:#475569; margin:12px 0;">
        L'argent est actuellement <strong>bloqué en sécurité</strong>. Le vendeur a été notifié pour expédier la pièce.
      </p>
      <button class="btn btn-primary btn-full" onclick="closeModal('buyModal'); switchTab('commandes');">
        Suivre ma commande
      </button>
    </div>
  `;
}

// Parcours Vendeur (+ Vendre)
function openSellModal() {
  document.getElementById("sellModal").classList.remove("hidden");
}

function handleSellSubmit(e) {
  e.preventDefault();

  const newListing = {
    id: Date.now(),
    title: document.getElementById("sellTitle").value.trim(),
    brand: document.getElementById("sellBrand").value.trim(),
    model: document.getElementById("sellModel").value.trim(),
    year: document.getElementById("sellYear").value.trim() || "-",
    category: document.getElementById("sellCategory").value,
    price: parseInt(document.getElementById("sellPrice").value, 10),
    city: document.getElementById("sellCity").value,
    image: document.getElementById("sellImage").value.trim(),
    description: document.getElementById("sellDescription").value.trim(),
    seller: "Vendeur Particulier"
  };

  listings.unshift(newListing);
  saveState();
  closeModal("sellModal");
  document.getElementById("sellForm").reset();
  switchTab("catalogue");
  alert("Votre annonce est en ligne immédiatement !");
}

// Suivi des achats (Bouton "J'ai reçu")
function renderOrders() {
  const container = document.getElementById("ordersList");
  if (orders.length === 0) {
    container.innerHTML = `<p>Vous n'avez pas encore passé de commande.</p>`;
    return;
  }

  container.innerHTML = orders.map((order, index) => `
    <div class="order-card">
      <div>
        <strong>${order.ref}</strong> • <span>${order.date}</span>
        <div style="font-size:1.05rem; font-weight:700; margin:4px 0;">${order.itemTitle} (${order.city})</div>
        <div>Montant payé : <strong>${formatAr(order.totalPaid)}</strong></div>
      </div>
      <div>
        ${order.status === "BLOQUÉ" ? `
          <span class="status-pill status-blocked">🔒 Argent bloqué</span>
          <button class="btn btn-success" style="margin-left:8px;" onclick="confirmReceipt(${index})">J'ai reçu</button>
        ` : order.status === "DÉBLOQUÉ" ? `
          <span class="status-pill status-released">✅ Reçu — Vendeur payé</span>
        ` : `
          <span class="status-pill status-refunded">↩️ Acheteur remboursé</span>
        `}
      </div>
    </div>
  `).join("");
}

function confirmReceipt(index) {
  if (confirm("Confirmez-vous avoir bien reçu la pièce conforme ? L'argent sera débloqué pour le vendeur.")) {
    orders[index].status = "DÉBLOQUÉ";
    saveState();
    renderOrders();
  }
}

function updateOrdersBadge() {
  document.getElementById("ordersCount").textContent = orders.length;
}

// Espace Admin sécurisé par le code 2026
function openAdminPrompt() {
  const code = prompt("Entrez le code d'accès Espace Admin :");
  if (code === "2026") {
    switchTab("admin");
  } else if (code !== null) {
    alert("Code incorrect.");
  }
}

function renderAdmin() {
  document.getElementById("adminTotalListings").textContent = listings.length;
  document.getElementById("adminTotalOrders").textContent = orders.length;

  const blockedSum = orders
    .filter(o => o.status === "BLOQUÉ")
    .reduce((sum, o) => sum + o.totalPaid, 0);

  const commissionSum = orders
    .filter(o => o.status !== "REMBOURSÉ")
    .reduce((sum, o) => sum + o.adminCommission, 0);

  document.getElementById("adminEscrowAmount").textContent = formatAr(blockedSum);
  document.getElementById("adminCommissionAmount").textContent = formatAr(commissionSum);

  // Table des commandes / litiges
  const ordersTable = document.getElementById("adminOrdersTable");
  if (orders.length === 0) {
    ordersTable.innerHTML = `<p style="padding:12px;">Aucune transaction enregistrée.</p>`;
  } else {
    ordersTable.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Réf</th>
            <th>Pièce</th>
            <th>Total payé</th>
            <th>Votre commission (5%)</th>
            <th>Statut</th>
            <th>Action litige</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map((o, idx) => `
            <tr>
              <td><strong>${o.ref}</strong></td>
              <td>${o.itemTitle}</td>
              <td>${formatAr(o.totalPaid)}</td>
              <td style="color:#d35400; font-weight:700;">${formatAr(o.adminCommission)}</td>
              <td>${o.status}</td>
              <td>
                ${o.status === "BLOQUÉ" ? `
                  <button class="btn btn-danger" onclick="refundOrder(${idx})">Rembourser acheteur</button>
                ` : "-"}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  // Table modération annonces
  document.getElementById("adminListingsTable").innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Pièce</th>
          <th>Véhicule</th>
          <th>Ville</th>
          <th>Prix</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${listings.map(item => `
          <tr>
            <td>${item.title}</td>
            <td>${item.brand} ${item.model}</td>
            <td>${item.city}</td>
            <td>${formatAr(item.price)}</td>
            <td><button class="btn btn-danger" onclick="deleteListing(${item.id})">Supprimer</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function refundOrder(index) {
  if (confirm("Rembourser l'acheteur suite à un problème de livraison ?")) {
    orders[index].status = "REMBOURSÉ";
    saveState();
    renderAdmin();
  }
}

function deleteListing(id) {
  if (confirm("Supprimer cette annonce ?")) {
    listings = listings.filter(l => l.id !== id);
    saveState();
    renderAdmin();
  }
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

// Initialisation au chargement
updateOrdersBadge();
renderListings();
      

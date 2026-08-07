"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export interface CustomerUser {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
}

interface PublicWebsiteProps {
  currentUser?: CustomerUser | null;
  onOpenLogin: () => void;
  onOpenDashboard?: (tab?: string) => void;
  onOpenUserManagement?: () => void;
  onSignOut?: () => void;
}

export type Product = {
  id: number;
  title: string;
  category: string;
  brand: string;
  specs: string;
  priceNum: number;
  priceFormatted: string;
  origPriceFormatted: string;
  discountTag: string;
  image: string;
  gallery: string[];
  finishes: { name: string; hex: string }[];
  sizes: string[];
  badge: string;
  ratingNum: number;
  reviewsCount: number;
  desc: string;
};

type CartItem = {
  product: Product;
  selectedFinish: string;
  selectedSize: string;
  quantity: number;
};

const PRODUCTS_DATA: Product[] = [
  {
    id: 1,
    title: "Yamaha U1 Upright Piano",
    category: "Acoustic Upright Pianos",
    brand: "YAMAHA JAPAN",
    specs: "121cm · Made in Japan · Serialized",
    priceNum: 185000,
    priceFormatted: "₱185,000",
    origPriceFormatted: "₱210,000",
    discountTag: "Save 12%",
    image: "/upright-piano.png",
    gallery: [
      "/upright-piano.png",
      "/luxury-grand-piano.png",
      "/upright-piano.png",
      "/luxury-grand-piano.png",
    ],
    finishes: [
      { name: "Polished Ebony", hex: "#18181b" },
      { name: "Satin Mahogany", hex: "#7c2d12" },
      { name: "Polished White", hex: "#f8fafc" },
    ],
    sizes: ["121 cm", "122 cm", "131 cm"],
    badge: "New",
    ratingNum: 4.8,
    reviewsCount: 36,
    desc: "The Yamaha U1 is built around a kiln-dried solid spruce soundboard and supported by Japanese hard rock maple pinblock precision. Hand-finished felt hammers sit inside a solid cabinet for resonant, responsive tone that warms with age.",
  },
  {
    id: 2,
    title: "Kawai K-300 Upright Piano",
    category: "Acoustic Upright Pianos",
    brand: "KAWAI JAPAN",
    specs: "122cm · Carbon Composite Action",
    priceNum: 210000,
    priceFormatted: "₱210,000",
    origPriceFormatted: "₱235,000",
    discountTag: "Save 10%",
    image: "/upright-piano.png",
    gallery: [
      "/upright-piano.png",
      "/luxury-grand-piano.png",
      "/upright-piano.png",
      "/luxury-grand-piano.png",
    ],
    finishes: [
      { name: "Polished Ebony", hex: "#18181b" },
      { name: "Satin Walnut", hex: "#451a03" },
    ],
    sizes: ["122 cm", "130 cm"],
    badge: "Certified",
    ratingNum: 4.9,
    reviewsCount: 28,
    desc: "Featuring Kawai's revolutionary Millennium III Carbon Composite action, the K-300 offers exceptional touch consistency, warmth, and resilience against tropical humidity shifts.",
  },
  {
    id: 3,
    title: "Yamaha C3 Concert Grand Piano",
    category: "Concert Grand Pianos",
    brand: "YAMAHA CONSERVATORY",
    specs: "186cm · Conservatory Grand Series",
    priceNum: 480000,
    priceFormatted: "₱480,000",
    origPriceFormatted: "₱520,000",
    discountTag: "Save 8%",
    image: "/luxury-grand-piano.png",
    gallery: [
      "/luxury-grand-piano.png",
      "/upright-piano.png",
      "/luxury-grand-piano.png",
      "/upright-piano.png",
    ],
    finishes: [{ name: "Polished Ebony", hex: "#18181b" }],
    sizes: ["186 cm Grand", "211 cm Concert"],
    badge: "Flagship",
    ratingNum: 5.0,
    reviewsCount: 19,
    desc: "The Yamaha C3 Concert Grand delivers unparalleled expressiveness, rich bass resonance, and flawless key repetition for concert halls, recording studios, and luxury homes.",
  },
  {
    id: 4,
    title: "Concert Pitch Tuning Package",
    category: "Services & Care",
    brand: "RHPS MASTER SERVICE",
    specs: "A440 Precision Frequency Tuning",
    priceNum: 3500,
    priceFormatted: "₱3,500",
    origPriceFormatted: "₱4,500",
    discountTag: "Save 22%",
    image: "/piano-technician-home.png",
    gallery: ["/piano-technician-home.png"],
    finishes: [{ name: "Standard Service", hex: "#2563eb" }],
    sizes: ["Single Visit", "Annual (2 Visits)"],
    badge: "Popular",
    ratingNum: 4.9,
    reviewsCount: 86,
    desc: "In-home precision tuning to A440 concert pitch, pinblock torque check, key balance leveling, and pedal trapwork adjustment by certified master technicians.",
  },
  {
    id: 5,
    title: "Complete Piano Restoration",
    category: "Services & Care",
    brand: "RHPS WORKSHOP",
    specs: "Full Overhaul & Refurbishment",
    priceNum: 25000,
    priceFormatted: "₱25,000",
    origPriceFormatted: "₱30,000",
    discountTag: "Save 16%",
    image: "/piano-workshop.png",
    gallery: ["/piano-workshop.png"],
    finishes: [{ name: "Full Overhaul", hex: "#18181b" }],
    sizes: ["Upright Overhaul", "Grand Overhaul"],
    badge: "Master",
    ratingNum: 5.0,
    reviewsCount: 34,
    desc: "Full acoustic overhaul including hammer felt replacement, restringing, soundboard crown repair, key rebushing, and cabinet hand-rubbed satin finish.",
  },
  {
    id: 6,
    title: "Dehumidifier & Heater Rod",
    category: "Care Accessories",
    brand: "RHPS CLIMATE CARE",
    specs: "Automatic Climate Control Rod",
    priceNum: 2800,
    priceFormatted: "₱2,800",
    origPriceFormatted: "₱3,200",
    discountTag: "Save 12%",
    image: "/upright-piano.png",
    gallery: ["/upright-piano.png"],
    finishes: [{ name: "Standard 25W", hex: "#0284c7" }],
    sizes: ["24 inch", "36 inch"],
    badge: "Essential",
    ratingNum: 4.9,
    reviewsCount: 51,
    desc: "Essential climate protection heating rod that maintains optimal humidity inside the piano cabinet, preventing sticking keys, rusty strings, and sluggish action felts.",
  },
];

export default function PublicWebsite({ currentUser, onOpenLogin, onOpenDashboard, onOpenUserManagement, onSignOut }: PublicWebsiteProps) {
  const [activeTab, setActiveTab] = useState<"Home" | "Services" | "Products" | "Technology" | "About Us">("Home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([1]);

  // Pre-Checkout Rules Modal State
  const [checkoutRulesModalOpen, setCheckoutRulesModalOpen] = useState(false);
  const [checkoutRuleStep, setCheckoutRuleStep] = useState(1);

  // Step Accordion State
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [zipInput, setZipInput] = useState("");

  // Profile Drawer & Dropdown State
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState<"orders" | "wishlist" | "vouchers" | "address" | "settings">("orders");

  // Warm Beige Product Detail View State (Exact Reference Image UI/UX)
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [modalQuantity, setModalQuantity] = useState(1);
  const [detailActiveTab, setDetailActiveTab] = useState<"description" | "dimensions" | "materials" | "shipping">("description");

  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("rhps_piano_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch {
      /* fallback */
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("rhps_piano_cart", JSON.stringify(newCart));
    } catch {
      /* fallback */
    }
  };

  const handleAddToCart = (product: Product, qty: number = 1) => {
    const fin = selectedFinish || product.finishes[0]?.name || "Standard";
    const sz = selectedSize || product.sizes[0] || "Standard";

    const existingIdx = cart.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedFinish === fin &&
        item.selectedSize === sz
    );

    let updated: CartItem[];
    if (existingIdx >= 0) {
      updated = cart.map((item, idx) =>
        idx === existingIdx ? { ...item, quantity: item.quantity + qty } : item
      );
    } else {
      updated = [
        ...cart,
        {
          product,
          selectedFinish: fin,
          selectedSize: sz,
          quantity: qty,
        },
      ];
    }

    saveCart(updated);
    showToast(`🛒 Added ${qty}x "${product.title}" to your cart!`);
  };

  const toggleWishlist = (productId: number) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
      showToast("Removed from wishlist");
    } else {
      setWishlist([...wishlist, productId]);
      showToast("❤️ Added to your Wishlist!");
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = cart
      .map((item, idx) => {
        if (idx === index) {
          const q = item.quantity + delta;
          return q > 0 ? { ...item, quantity: q } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    saveCart(updated);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.priceNum * item.quantity,
    0
  );

  const openProductModal = (p: Product) => {
    setModalProduct(p);
    setActiveGalleryIdx(0);
    setSelectedFinish(p.finishes[0]?.name || "");
    setSelectedSize(p.sizes[0] || "");
    setModalQuantity(1);
    setDetailActiveTab("description");
  };

  const userInitial = currentUser?.fullName
    ? currentUser.fullName.trim().charAt(0).toUpperCase()
    : "👤";
  const userFirstName = currentUser?.fullName
    ? currentUser.fullName.trim().split(" ")[0]
    : "Account";

  return (
    <div style={styles.appContainer}>
      {/* Toast Notice */}
      {toastMsg && <div style={styles.toastNotice}>{toastMsg}</div>}

      {/* ── HEADER NAVBAR ────────────────────────────────────────────────── */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <div onClick={() => setActiveTab("Home")} style={{ ...styles.logoGroup, cursor: "pointer" }}>
            <span style={{ fontSize: "1.3rem" }}>🎹</span>
            <span style={styles.brandTitle}>RHPS PIANO MASTERS</span>
          </div>

          <nav style={styles.mdCenterNav}>
            {[
              { id: "Home", label: "Home" },
              { id: "Services", label: "Services" },
              { id: "Products", label: "Products & Catalog" },
              { id: "Technology", label: "Technology" },
              { id: "About Us", label: "About Us" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={
                  activeTab === tab.id
                    ? { ...styles.mdNavLink, ...styles.mdNavLinkActive }
                    : styles.mdNavLink
                }
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div style={styles.navActionsRow}>
            <button onClick={() => setCartOpen(true)} style={styles.iconBtn}>
              <span style={{ fontSize: "1.1rem" }}>🛒</span>
              {totalCartCount > 0 && <span style={styles.badgeCount}>{totalCartCount}</span>}
            </button>

            <button
              onClick={() => showToast("📞 Calling Master Helpline: 0917-123-4567")}
              style={styles.tealOutlinePillBtn}
            >
              Helpline
            </button>

            <button
              onClick={() => openProductModal(PRODUCTS_DATA[3])}
              style={styles.tealPillBtn}
            >
              Book Consultation
            </button>

            {currentUser ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  style={styles.profileAvatarPillBtn}
                >
                  <div style={styles.profileAvatarBadge}>{userInitial}</div>
                  <span style={styles.profileAvatarName}>{userFirstName}</span>
                  <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{showProfileDropdown ? "▲" : "▼"}</span>
                </button>

                {/* FLOATING USER PROFILE DROPDOWN MENU (OWNER VS CUSTOMER SPECIFIC) */}
                {showProfileDropdown && (
                  <div
                    style={styles.profileDropdownMenu}
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    {/* Check if logged-in user is Owner/Admin */}
                    {(() => {
                      const isOwner = currentUser && (
                        currentUser.email?.toLowerCase().includes("robert") ||
                        currentUser.fullName?.toLowerCase().includes("robert") ||
                        currentUser.role === "owner" ||
                        currentUser.role === "admin"
                      );

                      if (isOwner) {
                        return (
                          <>
                            <div style={styles.dropdownUserHeader}>
                              <div style={styles.dropdownAvatarCircle}>{userInitial}</div>
                              <div>
                                <strong style={{ fontSize: "0.82rem", color: "#0f172a", display: "block" }}>{currentUser.fullName}</strong>
                                <span style={{ fontSize: "0.7rem", color: "#64748b", display: "block" }}>{currentUser.email}</span>
                                <div style={{ fontSize: "0.62rem", fontWeight: 800, backgroundColor: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", padding: "0.08rem 0.35rem", borderRadius: "4px", display: "inline-block", marginTop: "0.15rem" }}>👑 Owner & Craftsman</div>
                              </div>
                            </div>

                            <div style={styles.dropdownDivider}></div>

                            <button
                              onClick={() => {
                                setShowProfileDropdown(false);
                                if (onOpenDashboard) onOpenDashboard("owner_dashboard");
                              }}
                              style={styles.dropdownItemBtn}
                            >
                              <span style={{ fontSize: "0.95rem" }}>⚡</span>
                              <span>RHPS Owner Dashboard</span>
                            </button>

                            <button
                              onClick={() => {
                                setShowProfileDropdown(false);
                                if (onOpenUserManagement) onOpenUserManagement();
                              }}
                              style={styles.dropdownItemBtn}
                            >
                              <span style={{ fontSize: "0.95rem" }}>👥</span>
                              <span>Registered User Management</span>
                            </button>

                            <button
                              onClick={() => {
                                setShowProfileDropdown(false);
                                if (onOpenDashboard) onOpenDashboard("crm_leads");
                              }}
                              style={styles.dropdownItemBtn}
                            >
                              <span style={{ fontSize: "0.95rem" }}>👥</span>
                              <span>CRM Leads Management</span>
                            </button>

                            <button
                              onClick={() => {
                                setShowProfileDropdown(false);
                                if (onOpenDashboard) onOpenDashboard("repairs");
                              }}
                              style={styles.dropdownItemBtn}
                            >
                              <span style={{ fontSize: "0.95rem" }}>🔧</span>
                              <span>General Repairs Queue</span>
                            </button>

                            <button
                              onClick={() => {
                                setShowProfileDropdown(false);
                                if (onOpenDashboard) onOpenDashboard("inventory");
                              }}
                              style={styles.dropdownItemBtn}
                            >
                              <span style={{ fontSize: "0.95rem" }}>🎹</span>
                              <span>Piano Inventory</span>
                            </button>

                            <div style={styles.dropdownDivider}></div>

                            <button
                              onClick={() => {
                                setShowProfileDropdown(false);
                                if (onSignOut) onSignOut();
                                showToast("🔒 Owner workspace locked & signed out");
                              }}
                              style={styles.dropdownSignOutBtn}
                            >
                              <span style={{ fontSize: "0.95rem" }}>🔒</span>
                              <span>Lock Workspace</span>
                            </button>
                          </>
                        );
                      }

                      return (
                        <>
                          <div style={styles.dropdownUserHeader}>
                            <div style={styles.dropdownAvatarCircle}>{userInitial}</div>
                            <div>
                              <strong style={{ fontSize: "0.82rem", color: "#0f172a", display: "block" }}>{currentUser.fullName}</strong>
                              <span style={{ fontSize: "0.7rem", color: "#64748b", display: "block" }}>{currentUser.email}</span>
                              <div style={styles.dropdownVipTag}>⭐ VIP Member</div>
                            </div>
                          </div>

                          <div style={styles.dropdownDivider}></div>

                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              if (onOpenDashboard) onOpenDashboard("dashboard");
                              else setShowProfileDrawer(true);
                            }}
                            style={styles.dropdownItemBtn}
                          >
                            <span style={{ fontSize: "0.95rem" }}>📊</span>
                            <span>Customer Dashboard</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              if (onOpenDashboard) onOpenDashboard("settings");
                              else setShowProfileDrawer(true);
                            }}
                            style={styles.dropdownItemBtn}
                          >
                            <span style={{ fontSize: "0.95rem" }}>⚙️</span>
                            <span>Account Settings</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              if (onOpenDashboard) onOpenDashboard("orders");
                              else setShowProfileDrawer(true);
                            }}
                            style={styles.dropdownItemBtn}
                          >
                            <span style={{ fontSize: "0.95rem" }}>📦</span>
                            <span>My Orders & Tracking</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              if (onOpenDashboard) onOpenDashboard("wishlist");
                              else setShowProfileDrawer(true);
                            }}
                            style={styles.dropdownItemBtn}
                          >
                            <span style={{ fontSize: "0.95rem" }}>❤️</span>
                            <span>Saved Wishlist</span>
                          </button>

                          <div style={styles.dropdownDivider}></div>

                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              if (onSignOut) onSignOut();
                              showToast("🚪 Signed out successfully");
                            }}
                            style={styles.dropdownSignOutBtn}
                          >
                            <span style={{ fontSize: "0.95rem" }}>🚪</span>
                            <span>Sign Out</span>
                          </button>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <button onClick={onOpenLogin} style={styles.accountPillBtn}>
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN HOMEPAGE ────────────────────────────────────────────────── */}
      {activeTab === "Home" && (
        <main style={styles.mainCanvas}>
          <section style={styles.fullWidthHero}>
            <Image
              src="/luxury-grand-piano.png"
              alt="Luxury Grand Piano Background"
              fill
              priority
              style={{ objectFit: "cover" }}
            />
            <div style={styles.heroOverlay}></div>
            <div style={styles.heroContent}>
              <h1 style={styles.heroMainTitle}>Master Piano Care That Comes to You</h1>
              <p style={styles.heroSubText}>
                Experience the finest acoustic resonance with our in-home precision tuning, climate control solutions, and certified Japanese piano catalog.
              </p>
              <div style={styles.heroBtnRow}>
                <button onClick={() => openProductModal(PRODUCTS_DATA[3])} style={styles.heroPrimaryBtn}>
                  Get Started
                </button>
                <button onClick={() => setActiveTab("Products")} style={styles.heroSecondaryBtn}>
                  Browse Catalog
                </button>
              </div>
            </div>
          </section>

          <section style={styles.sectionContainer}>
            <h2 style={styles.catalogHeading}>Certified Japan Acoustic Piano Catalog</h2>
            <div style={styles.catalogGrid}>
              {PRODUCTS_DATA.map((p) => (
                <div key={p.id} style={styles.catalogCard}>
                  <div style={styles.cardImgWrap} onClick={() => openProductModal(p)}>
                    <Image
                      src={p.image}
                      alt={p.title}
                      width={260}
                      height={180}
                      style={{ objectFit: "contain" }}
                    />
                    <span style={styles.cardBadge}>{p.badge}</span>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.cardBrand}>{p.brand}</div>
                    <h3 style={styles.cardTitle} onClick={() => openProductModal(p)}>
                      {p.title}
                    </h3>
                    <div style={styles.cardPrice}>{p.priceFormatted}</div>

                    <div style={styles.cardBtnRow}>
                      <button onClick={() => openProductModal(p)} style={styles.btnCardDetails}>
                        View Options
                      </button>
                      <button onClick={() => handleAddToCart(p, 1)} style={styles.btnCardAdd}>
                        🛒 Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ── PRODUCTS CATALOG PAGE ────────────────────────────────────────── */}
      {activeTab === "Products" && (
        <main style={styles.mainContent}>
          <section style={styles.catalogSection}>
            <h2 style={styles.catalogHeading}>All Acoustic & Grand Pianos</h2>
            <div style={styles.catalogGrid}>
              {PRODUCTS_DATA.map((p) => (
                <div key={p.id} style={styles.catalogCard}>
                  <div style={styles.cardImgWrap} onClick={() => openProductModal(p)}>
                    <Image
                      src={p.image}
                      alt={p.title}
                      width={260}
                      height={180}
                      style={{ objectFit: "contain" }}
                    />
                    <span style={styles.cardBadge}>{p.badge}</span>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.cardBrand}>{p.brand}</div>
                    <h3 style={styles.cardTitle} onClick={() => openProductModal(p)}>
                      {p.title}
                    </h3>
                    <div style={styles.cardPrice}>{p.priceFormatted}</div>

                    <div style={styles.cardBtnRow}>
                      <button onClick={() => openProductModal(p)} style={styles.btnCardDetails}>
                        View Options
                      </button>
                      <button onClick={() => handleAddToCart(p, 1)} style={styles.btnCardAdd}>
                        🛒 Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ── WARM BEIGE LUXURY PRODUCT DETAIL VIEW MODAL (EXACT REFERENCE IMAGE UI/UX) ── */}
      {modalProduct && (
        <div style={styles.warmModalBackdrop} onClick={() => setModalProduct(null)}>
          <div style={styles.warmModalBox} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModalProduct(null)} style={styles.warmCloseBtn}>
              ✕
            </button>

            {/* TOP PRODUCT SHOWCASE (BEIGE LUXURY GRID) */}
            <div style={styles.warmProductGrid}>
              {/* LEFT COLUMN: MAIN IMAGE & THUMBNAILS */}
              <div style={styles.warmGalleryCol}>
                <div style={styles.warmMainImgWrap}>
                  <span style={styles.warmRedBadge}>New</span>
                  <button
                    onClick={() => toggleWishlist(modalProduct.id)}
                    style={styles.warmHeartOutlineBtn}
                  >
                    {wishlist.includes(modalProduct.id) ? "❤️" : "♡"}
                  </button>

                  <Image
                    src={modalProduct.gallery[activeGalleryIdx] || modalProduct.image}
                    alt={modalProduct.title}
                    width={460}
                    height={360}
                    priority
                    style={{ objectFit: "contain" }}
                  />
                </div>

                <div style={styles.warmThumbStrip}>
                  {modalProduct.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveGalleryIdx(idx)}
                      style={
                        activeGalleryIdx === idx
                          ? { ...styles.warmThumbBtn, ...styles.warmThumbBtnActive }
                          : styles.warmThumbBtn
                      }
                    >
                      <Image
                        src={img}
                        alt="Thumbnail"
                        width={68}
                        height={68}
                        style={{ objectFit: "cover", borderRadius: "10px" }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: PRODUCT INFO & SELECTOR */}
              <div style={styles.warmInfoCol}>
                <span style={styles.warmCategoryEyebrow}>{modalProduct.category}</span>
                <h1 style={styles.warmSerifTitle}>{modalProduct.title}</h1>
                <p style={styles.warmSubText}>{modalProduct.specs}</p>

                <div style={styles.warmRatingRow}>
                  <span style={{ color: "#d97706", fontSize: "0.95rem" }}>★★★★☆</span>
                  <span style={styles.warmRatingScore}>{modalProduct.ratingNum} ({modalProduct.reviewsCount})</span>
                </div>

                <div style={styles.warmPriceRow}>
                  <span style={styles.warmBigPrice}>{modalProduct.priceFormatted}</span>
                  <span style={styles.warmStrikePrice}>{modalProduct.origPriceFormatted}</span>
                  <span style={styles.warmSaveBadge}>{modalProduct.discountTag}</span>
                </div>

                {/* COLOUR SELECTOR */}
                <div style={styles.warmOptionSection}>
                  <label style={styles.warmOptionLabel}>Colour</label>
                  <div style={styles.warmChipsRow}>
                    {modalProduct.finishes.map((f) => (
                      <button
                        key={f.name}
                        onClick={() => setSelectedFinish(f.name)}
                        style={
                          selectedFinish === f.name
                            ? { ...styles.warmColorChip, ...styles.warmColorChipActive }
                            : styles.warmColorChip
                        }
                      >
                        <span style={{ ...styles.warmColorDot, backgroundColor: f.hex }}></span>
                        <span>{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SIZE SELECTOR */}
                <div style={styles.warmOptionSection}>
                  <label style={styles.warmOptionLabel}>Size</label>
                  <div style={styles.warmChipsRow}>
                    {modalProduct.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        style={
                          selectedSize === sz
                            ? { ...styles.warmSizeChip, ...styles.warmSizeChipActive }
                            : styles.warmSizeChip
                        }
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* QUANTITY STEPPER & ADD TO CART */}
                <div style={styles.warmActionRow}>
                  <div style={styles.warmQtyStepper}>
                    <button
                      onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                      style={styles.warmQtyBtn}
                    >
                      −
                    </button>
                    <span style={styles.warmQtyVal}>{modalQuantity}</span>
                    <button
                      onClick={() => setModalQuantity(modalQuantity + 1)}
                      style={styles.warmQtyBtn}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      handleAddToCart(modalProduct, modalQuantity);
                      setModalProduct(null);
                    }}
                    style={styles.warmBlackAddToCartBtn}
                  >
                    Add to cart 🛍️
                  </button>
                </div>

                <div style={styles.warmWishlistUnderlineRow}>
                  <span
                    onClick={() => toggleWishlist(modalProduct.id)}
                    style={{ cursor: "pointer", fontSize: "0.85rem", color: "#451a03" }}
                  >
                    {wishlist.includes(modalProduct.id) ? "❤️ Remove from wishlist" : "♡ Add to wishlist"}
                  </span>
                </div>

                {/* GOLD CHECKMARK FEATURE LIST */}
                <div style={styles.warmChecklistGroup}>
                  <div style={styles.warmCheckLine}>
                    <span style={styles.warmCheckIcon}>✓</span>
                    <span>Solid spruce soundboard, Japan-certified acoustic build</span>
                  </div>
                  <div style={styles.warmCheckLine}>
                    <span style={styles.warmCheckIcon}>✓</span>
                    <span>Removable 25W climate protection heater rod included</span>
                  </div>
                  <div style={styles.warmCheckLine}>
                    <span style={styles.warmCheckIcon}>✓</span>
                    <span>Free climate delivery & white-glove in-home setup</span>
                  </div>
                  <div style={styles.warmCheckLine}>
                    <span style={styles.warmCheckIcon}>✓</span>
                    <span>10-year frame & acoustic pinblock warranty</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LOWER TABBED SPECIFICATION SECTION */}
            <div style={styles.warmDetailTabsSection}>
              <div style={styles.warmTabsHeaderBar}>
                {[
                  { id: "description", label: "Description" },
                  { id: "dimensions", label: "Dimensions" },
                  { id: "materials", label: "Materials & care" },
                  { id: "shipping", label: "Shipping" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDetailActiveTab(t.id as any)}
                    style={
                      detailActiveTab === t.id
                        ? { ...styles.warmTabBtn, ...styles.warmTabBtnActive }
                        : styles.warmTabBtn
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div style={styles.warmTabContentGrid}>
                <div style={styles.warmTabLeftText}>
                  <p>{modalProduct.desc}</p>
                  <p style={{ marginTop: "1rem", color: "#78716c" }}>
                    Double-tuned and regulated in our Davao master workshop using electronic frequency calibration prior to climate-sealed air-ride truck shipment.
                  </p>
                </div>

                <div style={styles.warmTabRightSpecTable}>
                  <div style={styles.warmSpecRow}>
                    <strong style={styles.warmSpecKey}>Frame</strong>
                    <span style={styles.warmSpecVal}>Solid Japanese hard rock maple, FSC-certified</span>
                  </div>
                  <div style={styles.warmSpecRow}>
                    <strong style={styles.warmSpecKey}>Soundboard</strong>
                    <span style={styles.warmSpecVal}>Solid quarter-sawn spruce crown</span>
                  </div>
                  <div style={styles.warmSpecRow}>
                    <strong style={styles.warmSpecKey}>Action felt</strong>
                    <span style={styles.warmSpecVal}>100% Japanese wool felt, moisture-resistant</span>
                  </div>
                  <div style={styles.warmSpecRow}>
                    <strong style={styles.warmSpecKey}>Pedals</strong>
                    <span style={styles.warmSpecVal}>Solid polished brass trapwork (Sustain, Mute, Soft)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM CUSTOMER REVIEWS BREAKDOWN SECTION */}
            <div style={styles.warmReviewsSection}>
              <h2 style={styles.warmReviewHeading}>Customer reviews</h2>

              <div style={styles.warmScoreGrid}>
                <div style={styles.warmScoreBox}>
                  <span style={styles.warmBigScoreVal}>4.8</span>
                  <div style={{ color: "#d97706", fontSize: "1rem", margin: "0.2rem 0" }}>★★★★☆ 4.8 (36)</div>
                  <small style={{ color: "#78716c" }}>Based on 36 reviews</small>
                </div>

                <div style={styles.warmBarChartList}>
                  <div style={styles.warmBarLine}>
                    <span>5</span>
                    <div style={styles.warmBarTrack}><div style={{ ...styles.warmBarFill, width: "78%" }}></div></div>
                    <span>78%</span>
                  </div>
                  <div style={styles.warmBarLine}>
                    <span>4</span>
                    <div style={styles.warmBarTrack}><div style={{ ...styles.warmBarFill, width: "16%" }}></div></div>
                    <span>16%</span>
                  </div>
                  <div style={styles.warmBarLine}>
                    <span>3</span>
                    <div style={styles.warmBarTrack}><div style={{ ...styles.warmBarFill, width: "4%" }}></div></div>
                    <span>4%</span>
                  </div>
                  <div style={styles.warmBarLine}>
                    <span>2</span>
                    <div style={styles.warmBarTrack}><div style={{ ...styles.warmBarFill, width: "1%" }}></div></div>
                    <span>1%</span>
                  </div>
                  <div style={styles.warmBarLine}>
                    <span>1</span>
                    <div style={styles.warmBarTrack}><div style={{ ...styles.warmBarFill, width: "1%" }}></div></div>
                    <span>1%</span>
                  </div>
                </div>
              </div>

              {/* 3-COLUMN VERIFIED REVIEWS GRID */}
              <div style={styles.warmReviewCardsGrid}>
                <div style={styles.warmReviewCard}>
                  <div style={{ color: "#d97706", fontSize: "0.95rem", marginBottom: "0.4rem" }}>★★★★★</div>
                  <h4 style={styles.warmReviewTitle}>Worth every penny</h4>
                  <p style={styles.warmReviewBody}>
                    Sturdy, beautifully made, and the acoustic resonance is exactly as pictured. It took two of us to position, but sound is magnificent.
                  </p>
                  <div style={styles.warmAuthorTag}>
                    <span style={styles.warmAuthorCircle}>M</span>
                    <span>Maya R.</span>
                  </div>
                </div>

                <div style={styles.warmReviewCard}>
                  <div style={{ color: "#d97706", fontSize: "0.95rem", marginBottom: "0.4rem" }}>★★★★★</div>
                  <h4 style={styles.warmReviewTitle}>Our living room finally feels finished</h4>
                  <p style={styles.warmReviewBody}>
                    The hammer felt action is so soft but doesn't pill. Delivery team was careful and tidy—genuinely impressed with RHPS service.
                  </p>
                  <div style={styles.warmAuthorTag}>
                    <span style={styles.warmAuthorCircle}>T</span>
                    <span>Theo B.</span>
                  </div>
                </div>

                <div style={styles.warmReviewCard}>
                  <div style={{ color: "#d97706", fontSize: "0.95rem", marginBottom: "0.4rem" }}>★★★★☆</div>
                  <h4 style={styles.warmReviewTitle}>Lovely piano, slow delivery</h4>
                  <p style={styles.warmReviewBody}>
                    The piano itself is excellent and very comfortable to play. Climate shipping took a little longer than estimated, but support kept us updated.
                  </p>
                  <div style={styles.warmAuthorTag}>
                    <span style={styles.warmAuthorCircle}>P</span>
                    <span>Priya N.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LOGGED-IN CUSTOMER PROFILE DRAWER ─────────────────────────────── */}
      {showProfileDrawer && currentUser && (
        <div style={styles.drawerOverlay} onClick={() => setShowProfileDrawer(false)}>
          <div style={styles.profileDrawerBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div style={styles.userCardInfo}>
                <div style={styles.largeAvatarCircle}>{userInitial}</div>
                <div>
                  <h3 style={styles.userNameTitle}>{currentUser.fullName}</h3>
                  <span style={styles.userEmailSub}>{currentUser.email}</span>
                  <div style={styles.vipBadge}>⭐ VIP Piano Member · Certified Customer</div>
                </div>
              </div>

              <button onClick={() => setShowProfileDrawer(false)} style={styles.closeDrawerBtn}>
                ✕
              </button>
            </div>

            <div style={styles.drawerTabsBar}>
              {[
                { id: "orders", label: "📦 My Orders", icon: "📦" },
                { id: "wishlist", label: "❤️ Wishlist", icon: "❤️" },
                { id: "vouchers", label: "🏷️ Vouchers", icon: "🏷️" },
                { id: "address", label: "📍 Address", icon: "📍" },
                { id: "settings", label: "⚙️ Settings", icon: "⚙️" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setProfileActiveTab(t.id as any)}
                  style={
                    profileActiveTab === t.id
                      ? { ...styles.drawerTabBtn, ...styles.drawerTabBtnActive }
                      : styles.drawerTabBtn
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div style={styles.drawerTabBody}>
              {profileActiveTab === "orders" && (
                <div style={styles.profileSectionContent}>
                  <h4 style={styles.drawerSectionTitle}>Active Orders & Package Tracking</h4>
                  
                  <div style={styles.orderCardItem}>
                    <div style={styles.orderCardTop}>
                      <div>
                        <strong style={{ fontSize: "0.95rem", color: "#09090b" }}>Order #RHPS-89124</strong>
                        <span style={styles.orderDateSub}>Placed on Aug 05, 2026 · ₱185,000</span>
                      </div>
                      <span style={styles.statusBadgeGreen}>🚚 In Climate Transport</span>
                    </div>

                    <div style={styles.orderProductInfo}>
                      <Image
                        src="/upright-piano.png"
                        alt="Yamaha U1"
                        width={60}
                        height={60}
                        style={{ objectFit: "contain", backgroundColor: "#f5f5f4", borderRadius: "10px" }}
                      />
                      <div>
                        <strong style={{ fontSize: "0.9rem" }}>Yamaha U1 Upright Piano</strong>
                        <div style={{ fontSize: "0.8rem", color: "#71717a" }}>Polished Ebony · 121 cm Model</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.drawerFooter}>
              <button
                onClick={() => {
                  setShowProfileDrawer(false);
                  if (onSignOut) onSignOut();
                  showToast("🚪 Signed out successfully");
                }}
                style={styles.signOutRedBtn}
              >
                🚪 Sign Out of Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER SECTION ─────────────────────────────────────────────────── */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
              <span style={{ fontSize: "1.4rem" }}>🎹</span>
              <strong style={{ fontSize: "1.2rem", color: "#ffffff" }}>RHPS PIANO MASTERS</strong>
            </div>
            <p style={{ color: "#9ca3af", fontSize: "0.85rem", maxWidth: "320px", margin: 0 }}>
              Certified Japanese acoustic piano importer and master restoration workshop. Providing in-home tuning and 5-Year Full Acoustic Warranty protection.
            </p>
          </div>

          <div>
            <h4 style={styles.footerColTitle}>Navigation</h4>
            <div style={styles.footerLinks}>
              <span onClick={() => setActiveTab("Home")} style={styles.footerLink}>Home</span>
              <span onClick={() => setActiveTab("Services")} style={styles.footerLink}>Services</span>
              <span onClick={() => setActiveTab("Products")} style={styles.footerLink}>Products</span>
              <span onClick={() => setActiveTab("Technology")} style={styles.footerLink}>Technology</span>
            </div>
          </div>

          <div>
            <h4 style={styles.footerColTitle}>Customer Care</h4>
            <div style={styles.footerLinks}>
              {currentUser ? (
                <span onClick={() => setShowProfileDrawer(true)} style={styles.footerLink}>My Customer Profile ({userFirstName})</span>
              ) : (
                <span onClick={onOpenLogin} style={styles.footerLink}>Sign In to Account</span>
              )}
              <span onClick={() => showToast("📞 Helpline: 0917-123-4567")} style={styles.footerLink}>Master Technician Helpline</span>
            </div>
          </div>
        </div>

        <div style={styles.footerBottom}>
          © 2026 RHPS Piano Masters. All rights reserved. Registered Supabase E-Commerce Platform.
        </div>
      </footer>

      {/* ── PRE-CHECKOUT RULES MODAL WIZARD ─────────────────────────────── */}
      {checkoutRulesModalOpen && (
        <div style={styles.rulesOverlay}>
          <div style={styles.rulesModalBox}>
            <div style={styles.rulesHeader}>
              <h2 style={styles.rulesTitle}>Before you proceed...</h2>
              <button onClick={() => setCheckoutRulesModalOpen(false)} style={styles.closeCartBtn}>✕</button>
            </div>
            
            <div style={styles.rulesBody}>
              <div style={styles.rulesStepIndicator}>
                Step {checkoutRuleStep} of 3
              </div>

              {checkoutRuleStep === 1 && (
                <div>
                  <h3 style={{ margin: "0 0 1rem 0", color: "#0f172a" }}>📜 5-Year Full Acoustic Warranty</h3>
                  <p style={{ color: "#334155", lineHeight: 1.6 }}>
                    Every piano from RHPS Piano Masters comes with a comprehensive 5-year warranty covering the soundboard, pinblock, frame, and acoustic components.
                    Any climate-related warping not caused by negligence is covered under our policy.
                  </p>
                </div>
              )}

              {checkoutRuleStep === 2 && (
                <div>
                  <h3 style={{ margin: "0 0 1rem 0", color: "#0f172a" }}>🚚 Free Climate-Controlled Delivery</h3>
                  <p style={{ color: "#334155", lineHeight: 1.6 }}>
                    We provide complimentary white-glove delivery within Metro Manila using our climate-controlled trucks.
                    Our technicians will assemble and tune the piano in your home to A440 concert pitch during delivery.
                  </p>
                </div>
              )}

              {checkoutRuleStep === 3 && (
                <div>
                  <h3 style={{ margin: "0 0 1rem 0", color: "#0f172a" }}>💳 Reservation & Payment Terms</h3>
                  <p style={{ color: "#334155", lineHeight: 1.6 }}>
                    Proceeding to checkout will place an inquiry. A 50% reservation deposit is required to lock in your piano.
                    The remaining 50% must be settled upon successful home delivery and tuning.
                  </p>
                </div>
              )}
            </div>

            <div style={styles.rulesFooter}>
              {checkoutRuleStep > 1 && (
                <button
                  onClick={() => setCheckoutRuleStep(checkoutRuleStep - 1)}
                  style={styles.rulesSecondaryBtn}
                >
                  ← Back
                </button>
              )}
              <div style={{ flex: 1 }} />
              {checkoutRuleStep < 3 ? (
                <button
                  onClick={() => setCheckoutRuleStep(checkoutRuleStep + 1)}
                  style={styles.rulesPrimaryBtn}
                >
                  I Understand, Next →
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCheckoutRulesModalOpen(false);
                    setCartOpen(false);
                    if (currentUser) {
                      setShowProfileDrawer(true);
                      setProfileActiveTab("orders");
                    } else {
                      onOpenLogin();
                    }
                  }}
                  style={styles.rulesPrimaryBtn}
                >
                  Accept & Continue to Checkout
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CART DRAWER ───────────────────────────────────────────────────── */}
      {cartOpen && (
        <div style={styles.cartOverlay} onClick={() => setCartOpen(false)}>
          <div style={styles.cartDrawer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.cartHeader}>
              <h2 style={styles.cartTitle}>Shopping Cart ({totalCartCount})</h2>
              <button onClick={() => setCartOpen(false)} style={styles.closeCartBtn}>
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={styles.emptyCart}>
                <div style={{ fontSize: "3rem" }}>🛒</div>
                <p>Your shopping cart is currently empty.</p>
                <button onClick={() => { setCartOpen(false); setActiveTab("Products"); }} style={styles.tealPillBtn}>
                  Browse Products
                </button>
              </div>
            ) : (
              <div style={styles.cartBody}>
                <div style={styles.cartItemsList}>
                  {cart.map((item, idx) => (
                    <div key={idx} style={styles.cartItemRow}>
                      <div style={styles.cartItemThumb}>
                        <Image
                          src={item.product.image}
                          alt={item.product.title}
                          width={60}
                          height={60}
                          style={{ objectFit: "cover", borderRadius: "8px" }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <h4 style={styles.cartItemTitle}>{item.product.title}</h4>
                        <div style={styles.cartItemMeta}>
                          {item.selectedFinish} · {item.selectedSize}
                        </div>
                        <div style={styles.cartItemPrice}>{item.product.priceFormatted}</div>
                      </div>

                      <div style={styles.qtyControls}>
                        <button onClick={() => updateQuantity(idx, -1)} style={styles.qtyBtn}>
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(idx, 1)} style={styles.qtyBtn}>
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.cartFooter}>
                  <div style={styles.subtotalRow}>
                    <span>Subtotal</span>
                    <strong>₱{cartSubtotal.toLocaleString()}</strong>
                  </div>
                  <button
                    onClick={() => {
                      if (cart.length > 0) {
                        setCheckoutRuleStep(1);
                        setCheckoutRulesModalOpen(true);
                      }
                    }}
                    style={{ ...styles.tealPillBtn, width: "100%", padding: "0.85rem" }}
                  >
                    Proceed to Checkout Inquiry →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── KASADYA AESTHETIC STYLES ────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    color: "#4a3418", // Theme Brown
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  toastNotice: {
    position: "fixed",
    top: "1.5rem",
    right: "1.5rem",
    backgroundColor: "#3eb7b0", // Primary Teal
    color: "#ffffff",
    padding: "0.85rem 1.25rem",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(62, 183, 176, 0.25)",
    zIndex: 999999,
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  header: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #f3f4f6",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
  },
  headerContainer: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "1rem 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  brandTitle: {
    fontSize: "1.2rem",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    color: "#3eb7b0",
  },
  mdCenterNav: {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
  },
  mdNavLink: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#4a3418",
    cursor: "pointer",
    padding: "0.2rem 0",
    transition: "color 0.2s",
  },
  mdNavLinkActive: {
    color: "#3eb7b0",
    fontWeight: 600,
    borderBottom: "2px solid #3eb7b0",
  },
  navActionsRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  iconBtn: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    position: "relative",
    color: "#4a3418",
  },
  badgeCount: {
    backgroundColor: "#3eb7b0",
    color: "#ffffff",
    fontSize: "0.65rem",
    fontWeight: 700,
    padding: "0.1rem 0.35rem",
    borderRadius: "10px",
    position: "absolute",
    top: "-5px",
    right: "-8px",
  },
  tealPillBtn: {
    backgroundColor: "#3eb7b0",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.5rem 1.2rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.2s",
    boxShadow: "0 4px 6px rgba(62, 183, 176, 0.2)",
  },
  tealOutlinePillBtn: {
    backgroundColor: "transparent",
    border: "1px solid #3eb7b0",
    color: "#3eb7b0",
    borderRadius: "8px",
    padding: "0.5rem 1.2rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  accountPillBtn: {
    backgroundColor: "#09090b",
    color: "#ffffff",
    border: "none",
    borderRadius: "18px",
    padding: "0.4rem 0.95rem",
    fontSize: "0.78rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  profileAvatarPillBtn: {
    backgroundColor: "#f1f5f9",
    border: "1px solid #cbd5e1",
    borderRadius: "20px",
    padding: "0.25rem 0.65rem 0.25rem 0.35rem",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    cursor: "pointer",
  },
  profileAvatarBadge: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarName: {
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#0f172a",
  },
  profileDropdownMenu: {
    position: "absolute",
    top: "calc(100% + 6px)",
    right: 0,
    width: "200px",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "0.5rem",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.12)",
    border: "1px solid #e2e8f0",
    zIndex: 99999,
    display: "flex",
    flexDirection: "column",
    gap: "0.15rem",
  },
  dropdownUserHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.3rem 0.4rem 0.4rem 0.4rem",
  },
  dropdownAvatarCircle: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dropdownVipTag: {
    fontSize: "0.62rem",
    fontWeight: 800,
    backgroundColor: "#fef3c7",
    color: "#b45309",
    padding: "0.08rem 0.35rem",
    borderRadius: "4px",
    display: "inline-block",
    marginTop: "0.15rem",
  },
  dropdownDivider: {
    height: "1px",
    backgroundColor: "#f1f5f9",
    margin: "0.2rem 0",
  },
  dropdownItemBtn: {
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    padding: "0.4rem 0.55rem",
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#334155",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  },
  dropdownSignOutBtn: {
    backgroundColor: "#fef2f2",
    border: "none",
    borderRadius: "8px",
    padding: "0.4rem 0.55rem",
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#dc2626",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  },
  mainCanvas: {
    width: "100%",
  },
  fullWidthHero: {
    position: "relative",
    width: "100%",
    height: "600px",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 1,
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 2rem",
    width: "100%",
  },
  heroMainTitle: {
    fontSize: "3.5rem",
    fontWeight: 700,
    color: "#ffffff",
    lineHeight: 1.2,
    margin: "0 0 1rem 0",
    maxWidth: "800px",
  },
  heroSubText: {
    fontSize: "1.1rem",
    color: "#f8fafc",
    marginBottom: "2rem",
    maxWidth: "600px",
    lineHeight: 1.6,
  },
  heroBtnRow: {
    display: "flex",
    gap: "1rem",
  },
  heroPrimaryBtn: {
    backgroundColor: "#3eb7b0",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "1rem 2rem",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  heroSecondaryBtn: {
    backgroundColor: "transparent",
    color: "#ffffff",
    border: "2px solid #ffffff",
    borderRadius: "8px",
    padding: "1rem 2rem",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  sectionContainer: {
    maxWidth: "1280px",
    margin: "4rem auto",
    padding: "0 1.5rem",
  },
  catalogSection: {
    borderTop: "1px solid #e2e8f0",
    paddingTop: "3rem",
  },
  catalogHeading: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#4a3418", // Theme Brown
    marginBottom: "2rem",
    textAlign: "center",
  },
  catalogGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "2rem",
  },
  catalogCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardImgWrap: {
    backgroundColor: "#f9fafb",
    padding: "2rem 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    cursor: "pointer",
  },
  cardBadge: {
    position: "absolute",
    top: "1rem",
    left: "1rem",
    backgroundColor: "#3eb7b0", // Primary Teal
    color: "#ffffff",
    fontSize: "0.7rem",
    fontWeight: 700,
    padding: "0.25rem 0.75rem",
    borderRadius: "4px",
    textTransform: "uppercase",
  },
  cardBody: {
    padding: "1.5rem",
  },
  cardBrand: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#9ca3af",
    marginBottom: "0.4rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#4a3418", // Theme Brown
    margin: "0 0 0.5rem 0",
    cursor: "pointer",
    lineHeight: 1.4,
  },
  cardPrice: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#3eb7b0", // Primary Teal
    marginBottom: "1.5rem",
  },
  cardBtnRow: {
    display: "flex",
    gap: "0.8rem",
  },
  btnCardDetails: {
    flex: 1,
    backgroundColor: "transparent",
    border: "1px solid #3eb7b0",
    color: "#3eb7b0",
    fontWeight: 600,
    padding: "0.65rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnCardAdd: {
    backgroundColor: "#3eb7b0",
    border: "none",
    color: "#ffffff",
    fontWeight: 600,
    padding: "0.65rem 1rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  mainContent: {
    maxWidth: "1280px",
    margin: "2rem auto 5rem auto",
    padding: "0 1.5rem",
  },
  warmModalBackdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(8px)",
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    overflowY: "auto",
  },
  warmModalBox: {
    backgroundColor: "#faf7f2",
    borderRadius: "24px",
    maxWidth: "1040px",
    width: "100%",
    padding: "2.5rem",
    position: "relative",
    boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.3)",
    maxHeight: "92vh",
    overflowY: "auto",
    color: "#292524",
  },
  warmCloseBtn: {
    position: "absolute",
    top: "1.2rem",
    right: "1.5rem",
    background: "#f5f0e8",
    border: "none",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    fontSize: "1.1rem",
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    color: "#44403c",
  },
  warmProductGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "3rem",
    marginBottom: "3rem",
  },
  warmGalleryCol: {
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
  },
  warmMainImgWrap: {
    backgroundColor: "#fdfbf7",
    borderRadius: "20px",
    padding: "2.2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    position: "relative",
    border: "1px solid #f5f0e8",
  },
  warmRedBadge: {
    position: "absolute",
    top: "1rem",
    left: "1rem",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontSize: "0.72rem",
    fontWeight: 800,
    padding: "0.2rem 0.65rem",
    borderRadius: "12px",
  },
  warmHeartOutlineBtn: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    color: "#44403c",
  },
  warmThumbStrip: {
    display: "flex",
    gap: "0.8rem",
  },
  warmThumbBtn: {
    background: "#fdfbf7",
    border: "2px solid transparent",
    borderRadius: "12px",
    padding: "3px",
    cursor: "pointer",
  },
  warmThumbBtnActive: {
    borderColor: "#1c1917",
  },
  warmInfoCol: {
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
  },
  warmCategoryEyebrow: {
    fontSize: "0.75rem",
    fontWeight: 800,
    color: "#c2410c",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  warmSerifTitle: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: "2.2rem",
    fontWeight: 700,
    color: "#1c1917",
    margin: 0,
    lineHeight: 1.15,
  },
  warmSubText: {
    fontSize: "0.88rem",
    color: "#78716c",
    margin: 0,
  },
  warmRatingRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  warmRatingScore: {
    fontSize: "0.85rem",
    color: "#78716c",
    fontWeight: 600,
  },
  warmPriceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.8rem",
  },
  warmBigPrice: {
    fontSize: "2rem",
    fontWeight: 900,
    color: "#1c1917",
  },
  warmStrikePrice: {
    fontSize: "1.2rem",
    color: "#a8a29e",
    textDecoration: "line-through",
  },
  warmSaveBadge: {
    backgroundColor: "#fecdd3",
    color: "#be123c",
    fontSize: "0.75rem",
    fontWeight: 800,
    padding: "0.2rem 0.6rem",
    borderRadius: "10px",
  },
  warmOptionSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  warmOptionLabel: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#44403c",
  },
  warmChipsRow: {
    display: "flex",
    gap: "0.6rem",
  },
  warmColorChip: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#ffffff",
    border: "1px solid #d6d3d1",
    borderRadius: "20px",
    padding: "0.4rem 0.85rem",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    color: "#292524",
  },
  warmColorChipActive: {
    borderColor: "#1c1917",
    boxShadow: "0 0 0 1px #1c1917",
    fontWeight: 800,
  },
  warmColorDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "1px solid #d6d3d1",
  },
  warmSizeChip: {
    backgroundColor: "#ffffff",
    border: "1px solid #d6d3d1",
    borderRadius: "20px",
    padding: "0.5rem 1rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#292524",
    cursor: "pointer",
  },
  warmSizeChipActive: {
    backgroundColor: "#1c1917",
    color: "#ffffff",
    borderColor: "#1c1917",
    fontWeight: 800,
  },
  warmActionRow: {
    display: "flex",
    gap: "0.8rem",
    marginTop: "0.5rem",
  },
  warmQtyStepper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    border: "1px solid #d6d3d1",
    borderRadius: "24px",
    padding: "0 0.8rem",
    gap: "0.8rem",
  },
  warmQtyBtn: {
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    fontWeight: 800,
    cursor: "pointer",
    color: "#44403c",
  },
  warmQtyVal: {
    fontSize: "0.95rem",
    fontWeight: 800,
  },
  warmBlackAddToCartBtn: {
    flex: 1,
    height: "48px",
    backgroundColor: "#1c1917",
    color: "#ffffff",
    border: "none",
    borderRadius: "24px",
    fontSize: "0.95rem",
    fontWeight: 800,
    cursor: "pointer",
  },
  warmWishlistUnderlineRow: {
    fontSize: "0.85rem",
    textDecoration: "underline",
  },
  warmChecklistGroup: {
    borderTop: "1px solid #e7e5e4",
    paddingTop: "1.2rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
    fontSize: "0.85rem",
    color: "#57534e",
  },
  warmCheckLine: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
  },
  warmCheckIcon: {
    color: "#d97706",
    fontWeight: 900,
  },
  warmDetailTabsSection: {
    borderTop: "1px solid #e7e5e4",
    paddingTop: "2rem",
    marginBottom: "3rem",
  },
  warmTabsHeaderBar: {
    display: "flex",
    gap: "2rem",
    borderBottom: "1px solid #e7e5e4",
    marginBottom: "1.8rem",
  },
  warmTabBtn: {
    background: "none",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: "2px solid transparent",
    paddingBottom: "0.8rem",
    fontSize: "1.05rem",
    fontWeight: 600,
    color: "#a8a29e",
    cursor: "pointer",
  },
  warmTabBtnActive: {
    color: "#1c1917",
    fontWeight: 800,
    borderBottomColor: "#d97706",
  },
  warmTabContentGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "3rem",
  },
  warmTabLeftText: {
    fontSize: "0.92rem",
    color: "#57534e",
    lineHeight: 1.65,
  },
  warmTabRightSpecTable: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },
  warmSpecRow: {
    borderBottom: "1px solid #e7e5e4",
    paddingBottom: "0.6rem",
    display: "flex",
    flexDirection: "column",
  },
  warmSpecKey: {
    fontSize: "0.75rem",
    color: "#78716c",
    textTransform: "uppercase",
    marginBottom: "0.2rem",
  },
  warmSpecVal: {
    fontSize: "0.88rem",
    color: "#1c1917",
    fontWeight: 600,
  },
  warmReviewsSection: {
    borderTop: "1px solid #e7e5e4",
    paddingTop: "2.5rem",
  },
  warmReviewHeading: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#1c1917",
    marginBottom: "1.8rem",
  },
  warmScoreGrid: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "3rem",
    marginBottom: "2.5rem",
    alignItems: "center",
  },
  warmScoreBox: {
    display: "flex",
    flexDirection: "column",
  },
  warmBigScoreVal: {
    fontSize: "3rem",
    fontWeight: 900,
    color: "#1c1917",
    lineHeight: 1,
  },
  warmBarChartList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  warmBarLine: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    fontSize: "0.8rem",
    color: "#78716c",
  },
  warmBarTrack: {
    flex: 1,
    height: "6px",
    backgroundColor: "#e7e5e4",
    borderRadius: "10px",
    overflow: "hidden",
  },
  warmBarFill: {
    height: "100%",
    backgroundColor: "#d97706",
  },
  warmReviewCardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  warmReviewCard: {
    backgroundColor: "#fdfbf7",
    border: "1px solid #f5f0e8",
    borderRadius: "16px",
    padding: "1.5rem",
  },
  warmReviewTitle: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#1c1917",
    margin: "0 0 0.5rem 0",
  },
  warmReviewBody: {
    fontSize: "0.88rem",
    color: "#57534e",
    lineHeight: 1.55,
    margin: "0 0 1.2rem 0",
  },
  warmAuthorTag: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "#44403c",
  },
  warmAuthorCircle: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#e7e5e4",
    color: "#44403c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
    fontWeight: 800,
  },
  drawerOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(5px)",
    zIndex: 999999,
    display: "flex",
    justifyContent: "flex-end",
  },
  profileDrawerBox: {
    width: "100%",
    maxWidth: "480px",
    backgroundColor: "#ffffff",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-15px 0 40px rgba(0,0,0,0.25)",
  },
  drawerHeader: {
    padding: "1.8rem 1.5rem 1.2rem 1.5rem",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#f8fafc",
  },
  userCardInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  largeAvatarCircle: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontSize: "1.5rem",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userNameTitle: {
    fontSize: "1.15rem",
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 0.2rem 0",
  },
  userEmailSub: {
    fontSize: "0.82rem",
    color: "#64748b",
    display: "block",
    marginBottom: "0.4rem",
  },
  vipBadge: {
    fontSize: "0.72rem",
    fontWeight: 800,
    backgroundColor: "#fef3c7",
    color: "#b45309",
    padding: "0.15rem 0.5rem",
    borderRadius: "6px",
    display: "inline-block",
  },
  closeDrawerBtn: {
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    fontWeight: 800,
    cursor: "pointer",
  },
  drawerTabsBar: {
    display: "flex",
    borderBottom: "1px solid #e2e8f0",
    padding: "0 1rem",
    gap: "0.5rem",
    overflowX: "auto",
  },
  drawerTabBtn: {
    background: "none",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: "2px solid transparent",
    padding: "0.8rem 0.6rem",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#64748b",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  drawerTabBtnActive: {
    color: "#0f172a",
    fontWeight: 800,
    borderBottomColor: "#0f172a",
  },
  drawerTabBody: {
    flex: 1,
    padding: "1.5rem",
    overflowY: "auto",
  },
  profileSectionContent: {},
  drawerSectionTitle: {
    fontSize: "1rem",
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 1rem 0",
  },
  orderCardItem: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "1.2rem",
  },
  orderCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  orderDateSub: {
    fontSize: "0.78rem",
    color: "#64748b",
    display: "block",
  },
  statusBadgeGreen: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    fontSize: "0.72rem",
    fontWeight: 800,
    padding: "0.25rem 0.6rem",
    borderRadius: "8px",
  },
  orderProductInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
  },
  drawerFooter: {
    padding: "1.2rem 1.5rem",
    borderTop: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },
  signOutRedBtn: {
    width: "100%",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#dc2626",
    padding: "0.75rem",
    borderRadius: "12px",
    fontSize: "0.88rem",
    fontWeight: 800,
    cursor: "pointer",
  },
  footer: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    borderTop: "1px solid #1e293b",
    paddingTop: "3.5rem",
    paddingBottom: "2rem",
    marginTop: "5rem",
  },
  footerContainer: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 2rem",
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr 1fr",
    gap: "3rem",
    marginBottom: "3rem",
  },
  footerColTitle: {
    fontSize: "0.95rem",
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: "1.2rem",
  },
  footerLinks: {
    display: "flex",
    flexDirection: "column",
    gap: "0.65rem",
    fontSize: "0.88rem",
  },
  footerLink: {
    color: "#94a3b8",
    cursor: "pointer",
  },
  footerBottom: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "1.5rem 2rem 0 2rem",
    borderTop: "1px solid #1e293b",
    fontSize: "0.8rem",
    color: "#64748b",
    textAlign: "center",
  },
  cartOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "flex-end",
  },
  cartDrawer: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-10px 0 30px rgba(0,0,0,0.2)",
  },
  cartHeader: {
    padding: "1.5rem",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartTitle: {
    fontSize: "1.2rem",
    fontWeight: 800,
    margin: 0,
  },
  closeCartBtn: {
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
  },
  emptyCart: {
    padding: "3rem 1.5rem",
    textAlign: "center",
  },
  cartBody: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "space-between",
  },
  cartItemsList: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    overflowY: "auto",
  },
  cartItemRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "1rem",
  },
  cartItemThumb: {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
  },
  cartItemTitle: {
    fontSize: "0.9rem",
    fontWeight: 700,
    margin: "0 0 0.2rem 0",
  },
  cartItemMeta: {
    fontSize: "0.75rem",
    color: "#64748b",
  },
  cartItemPrice: {
    fontSize: "0.95rem",
    fontWeight: 800,
    marginTop: "0.2rem",
  },
  qtyControls: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.85rem",
    fontWeight: 700,
  },
  qtyBtn: {
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    background: "#f1f5f9",
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
  },
  cartFooter: {
    padding: "1.5rem",
    borderTop: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },
  subtotalRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1rem",
    fontSize: "1.05rem",
  },
  rulesOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999,
  },
  rulesModalBox: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "540px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  rulesHeader: {
    padding: "1.5rem 2rem",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  rulesTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    margin: 0,
    color: "#4a3418", // Theme Brown
  },
  rulesBody: {
    padding: "2rem",
    minHeight: "200px",
  },
  rulesStepIndicator: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#9ca3af",
    marginBottom: "1.5rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  rulesFooter: {
    padding: "1.25rem 2rem",
    borderTop: "1px solid #f3f4f6",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    backgroundColor: "#f9fafb",
  },
  rulesPrimaryBtn: {
    backgroundColor: "#3eb7b0", // Primary Teal
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.85rem 1.5rem",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(62, 183, 176, 0.2)",
    transition: "background-color 0.2s",
  },
  rulesSecondaryBtn: {
    backgroundColor: "transparent",
    color: "#4a3418",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "0.85rem 1.5rem",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface PublicWebsiteProps {
  onOpenLogin: () => void;
}

type Product = {
  id: number;
  title: string;
  category: string;
  specs: string;
  priceNum: number;
  priceFormatted: string;
  image: string;
  icon: string;
  desc: string;
  badge: string;
  rating: string;
  stockLocation: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

const PRODUCTS_DATA: Product[] = [
  {
    id: 1,
    title: "Yamaha U1 Upright Piano",
    category: "Acoustic Piano",
    specs: "121cm · Made in Japan · Serialized",
    priceNum: 185000,
    priceFormatted: "₱185,000",
    image: "/grand-piano-hero.png",
    icon: "🎹",
    badge: "Best-Seller",
    rating: "★★★★★ 5.0 (42 reviews)",
    stockLocation: "Davao Main Showroom Yard",
    desc: "Original Japanese pinblock, mahogany core hammers, bench & 5-year warranty included.",
  },
  {
    id: 2,
    title: "Kawai K-300 Upright Piano",
    category: "Acoustic Piano",
    specs: "122cm · Carbon Composite Action",
    priceNum: 210000,
    priceFormatted: "₱210,000",
    image: "/grand-piano-hero.png",
    icon: "🎹",
    badge: "Certified Import",
    rating: "★★★★★ 4.9 (28 reviews)",
    stockLocation: "Davao Yard - Ready for Transport",
    desc: "Millennium III carbon action, mahogany core, exceptionally warm acoustic tone.",
  },
  {
    id: 3,
    title: "Yamaha C3 Concert Grand Piano",
    category: "Grand Piano",
    specs: "186cm · Conservatory Series",
    priceNum: 480000,
    priceFormatted: "₱480,000",
    image: "/grand-piano-hero.png",
    icon: "🎹",
    badge: "Flagship Grand",
    rating: "★★★★★ 5.0 (19 reviews)",
    stockLocation: "Main Workshop Showroom",
    desc: "Acoustic grand piano, duplex scaling, solid spruce soundboard, polished ebony finish.",
  },
  {
    id: 4,
    title: "Concert Pitch Tuning Package",
    category: "Service",
    specs: "A440 Precision Frequency Tuning",
    priceNum: 3500,
    priceFormatted: "₱3,500",
    image: "/grand-piano-hero.png",
    icon: "🎼",
    badge: "Popular Service",
    rating: "★★★★★ 5.0 (86 reviews)",
    stockLocation: "Master Technician On-Call",
    desc: "In-home precision tuning, pinblock torque check, key leveling, and pedal adjustment.",
  },
  {
    id: 5,
    title: "Complete Piano Restoration",
    category: "Service",
    specs: "Full Overhaul & Refurbishment",
    priceNum: 25000,
    priceFormatted: "₱25,000",
    image: "/grand-piano-hero.png",
    icon: "🛠️",
    badge: "Master Restoration",
    rating: "★★★★★ 5.0 (34 reviews)",
    stockLocation: "Restoration Workshop Yard",
    desc: "Hammer felt replacement, string restringing, cabinet satin polish, and double tuning.",
  },
  {
    id: 6,
    title: "Dehumidifier & Heater Rod",
    category: "Accessories",
    specs: "Climate Protection Rod",
    priceNum: 2800,
    priceFormatted: "₱2,800",
    image: "/grand-piano-hero.png",
    icon: "🌡️",
    badge: "Essential Care",
    rating: "★★★★★ 4.9 (51 reviews)",
    stockLocation: "In Stock - Davao Yard",
    desc: "Automatic humidity regulation to protect acoustic soundboards and action felts.",
  },
];

const FAQ_LIST = [
  {
    q: "How often should an acoustic piano be tuned?",
    a: "We recommend tuning your acoustic piano at least twice a year (every 6 months) to maintain A440 concert pitch, especially in tropical climates like the Philippines where humidity shifts affect soundboards and pinblock tension.",
  },
  {
    q: "What does the 5-Year Full Warranty cover on purchased pianos?",
    a: "Our 5-Year Full Warranty covers the acoustic pinblock, soundboard crown, cast iron plate integrity, key balance, and internal action hammer mechanisms. Free initial in-home tuning and setup regulation are also included.",
  },
  {
    q: "How is climate-controlled transport handled for deliveries?",
    a: "All piano shipments are transported using specialized air-ride suspension trucks, moisture-proof climate wrapping, and heavy-duty padded piano skids. Our certified crew handles ground or multi-story positioning safely.",
  },
  {
    q: "How can I request a custom restoration quote for an old heirloom piano?",
    a: "You can submit an inquiry through our contact section or call our master technicians directly. We conduct a multi-point acoustic diagnostic on soundboards, hammers, and action felts to provide an exact restoration scope.",
  },
];

export default function PublicWebsite({ onOpenLogin }: PublicWebsiteProps) {
  // Cart & Account State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activePageTab, setActivePageTab] = useState<"home" | "store">("home");

  const [hasAccount, setHasAccount] = useState(false);
  const [showPoliteModal, setShowPoliteModal] = useState(false);
  const [intentProduct, setIntentProduct] = useState<Product | null>(null);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Checkout form state
  const [checkoutDetails, setCheckoutDetails] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Load cart from localStorage and clear legacy bypass tokens
  useEffect(() => {
    try {
      localStorage.removeItem("rhps_customer_registered");
      const savedCart = localStorage.getItem("rhps_piano_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch {
      /* localStorage fallback */
    }

    setHasAccount(false);
  }, []);

  const updateCartState = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("rhps_piano_cart", JSON.stringify(newCart));
    } catch {
      /* localStorage fallback */
    }
  };

  const addToCart = (product: Product) => {
    // If guest visitor -> Open polite account notice modal with product memory
    if (!hasAccount) {
      setIntentProduct(product);
      setShowPoliteModal(true);
      return;
    }

    const existing = cart.find((item) => item.product.id === product.id);
    let updated: CartItem[];

    if (existing) {
      updated = cart.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updated = [...cart, { product, quantity: 1 }];
    }

    updateCartState(updated);
    setToastMsg(`Added "${product.title}" to Cart`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleCartClick = () => {
    if (!hasAccount) {
      setIntentProduct(null);
      setShowPoliteModal(true);
      return;
    }
    setCartOpen(true);
  };

  const updateQuantity = (productId: number, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    updateCartState(updated);
  };

  const removeFromCart = (productId: number) => {
    const updated = cart.filter((item) => item.product.id !== productId);
    updateCartState(updated);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.priceNum * item.quantity,
    0
  );

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;

    if (!hasAccount) {
      setShowPoliteModal(true);
      return;
    }

    setCheckingOut(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: checkoutDetails.name,
          phone: checkoutDetails.phone,
          address: checkoutDetails.address,
          itemTitle: cart.map((i) => `${i.product.title} (x${i.quantity})`).join(", "),
          itemPrice: `₱${cartSubtotal.toLocaleString()}`,
          addons: checkoutDetails.notes || "E-Commerce Web Order",
        }),
      });

      if (res.ok) {
        setOrderComplete(true);
      }
    } catch (err) {
      console.error("Checkout exception:", err);
    } finally {
      setCheckingOut(false);
    }
  };

  const handleViberCheckout = () => {
    if (!cart.length) return;

    if (!hasAccount) {
      setShowPoliteModal(true);
      return;
    }

    const itemsList = cart.map((i) => `• ${i.product.title} (x${i.quantity}) - ${i.product.priceFormatted}`).join("%0A");
    const text = `Hi Rhps Piano Masters! I would like to place an order:%0A${itemsList}%0ATotal: ₱${cartSubtotal.toLocaleString()}%0AName: ${checkoutDetails.name || "Customer"}`;
    window.open(`https://viber.com`, "_blank");
  };

  const filteredProducts =
    activeCategory === "All"
      ? PRODUCTS_DATA
      : PRODUCTS_DATA.filter((p) => p.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div style={styles.container}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={styles.toastNotification}>
          <span>🛒</span> {toastMsg}
        </div>
      )}

      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div style={styles.topAnnouncementBar}>
        <div style={styles.topInner}>
          <div style={styles.statusPill}>
            <span style={styles.statusDot}>●</span>
            <span>Workshop Active · Davao City & Regional Showrooms</span>
          </div>
          <div style={styles.topContactInfo}>
            <span>✉️ info@rhps-piano.com</span>
            <span style={styles.dotDivider}>•</span>
            <span>📞 +63 (917) 123 4567</span>
          </div>
        </div>
      </div>

      {/* 2. LUXURY FROSTED GLASS NAVBAR */}
      <header style={styles.navbar}>
        <div style={styles.navInner}>
          {/* Logo */}
          <div style={styles.logoGroup}>
            <div style={styles.brandEmblem}>🎹</div>
            <div>
              <span style={styles.brandTitle}>RHPS PIANO MASTERS</span>
              <span style={styles.brandSubtitle}>Acoustic Craftsmanship & Store</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={styles.navLinks}>
            <button
              onClick={() => setActivePageTab("home")}
              style={{
                ...styles.navLink,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: activePageTab === "home" ? 800 : 500,
                color: activePageTab === "home" ? "#2563eb" : "#475569",
              }}
            >
              Home
            </button>
            <button
              onClick={() => setActivePageTab("store")}
              style={{
                ...styles.navLink,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: activePageTab === "store" ? 800 : 500,
                color: activePageTab === "store" ? "#2563eb" : "#475569",
              }}
            >
              Piano Store
            </button>
            <button
              onClick={() => {
                setActivePageTab("home");
                setTimeout(() => document.getElementById("workflow")?.scrollIntoView({ behavior: "smooth" }), 100);
              }}
              style={{ ...styles.navLink, background: "none", border: "none", cursor: "pointer" }}
            >
              Restoration
            </button>
            <button
              onClick={() => {
                setActivePageTab("home");
                setTimeout(() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" }), 100);
              }}
              style={{ ...styles.navLink, background: "none", border: "none", cursor: "pointer" }}
            >
              Client Reviews
            </button>
            <button
              onClick={() => {
                setActivePageTab("home");
                setTimeout(() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }), 100);
              }}
              style={{ ...styles.navLink, background: "none", border: "none", cursor: "pointer" }}
            >
              FAQ
            </button>
          </nav>

          {/* Right Header Action: Single Unified Log In / Register Button */}
          <div style={styles.headerActionRow}>
            {totalCartCount > 0 && (
              <button onClick={handleCartClick} style={styles.headerCartPill}>
                <span>Cart</span>
                <span style={styles.cartCountBadge}>{totalCartCount}</span>
              </button>
            )}

            <button onClick={onOpenLogin} style={styles.portalLoginPill}>
              Log In / Register
            </button>
          </div>
        </div>
      </header>

      {/* 3. LUXURY EDITORIAL HERO SECTION (HOME PAGE ONLY) */}
      {activePageTab === "home" && (
        <section id="hero" style={styles.heroSection}>
          <div style={styles.heroInner}>
            <div style={styles.heroContent}>
              <div style={styles.eyebrowChip}>
                <span>CERTIFIED ACOUSTIC PIANO SPECIALISTS</span>
              </div>

              <h1 style={styles.heroTitle}>
                Precision Piano Tuning, <span style={styles.blueSpan}>Master Restoration</span> & Certified Imports<span style={styles.dotSpan}>.</span>
              </h1>

              <p style={styles.heroSubtitle}>
                Handcrafted acoustic piano restoration, A440 concert pitch tuning, and handpicked Japanese & European acoustic pianos available in our online store.
              </p>

              <div style={styles.trustBadgesRow}>
                <span style={styles.trustBadge}>✓ 25+ Years Experience</span>
                <span style={styles.trustBadge}>✓ A440 Concert Standard</span>
                <span style={styles.trustBadge}>✓ 5-Year Full Warranty</span>
              </div>

              <div style={styles.heroCtaGroup}>
                <button onClick={() => setActivePageTab("store")} style={styles.primaryBluePill}>
                  Explore Store Catalog ➔
                </button>
                <button onClick={onOpenLogin} style={styles.secondaryWhitePill}>
                  Log In / Register
                </button>
              </div>
            </div>

            {/* Right Showcase Frame */}
            <div style={styles.heroVisual}>
              <div style={styles.visualFrame}>
                <Image
                  src="/grand-piano-hero.png"
                  alt="RHPS Concert Grand Piano Showcase"
                  width={560}
                  height={390}
                  style={styles.heroImg}
                  priority
                />

                <div style={styles.floatingSpecBadge1}>
                  <span style={{ fontSize: "1.2rem" }}>🎹</span>
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "#0f172a", display: "block" }}>
                      Certified Piano Imports
                    </strong>
                    <small style={{ color: "#2563eb", fontWeight: 700 }}>Japan & Europe Stock</small>
                  </div>
                </div>

                <div style={styles.floatingSpecBadge2}>
                  <span style={{ fontSize: "1.2rem" }}>⚡</span>
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "#0f172a", display: "block" }}>
                      A440 Concert Pitch
                    </strong>
                    <small style={{ color: "#16a34a", fontWeight: 700 }}>100% Quality Guaranteed</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. LUXURY STOREFRONT CATALOG (PIANO STORE PAGE ONLY) */}
      {activePageTab === "store" && (
        <>
          {/* DEDICATED PIANO STORE BANNER */}
          <div
            style={{
              backgroundColor: "#0f172a",
              color: "#ffffff",
              padding: "4rem 1.5rem 3.5rem 1.5rem",
              textAlign: "center",
              borderBottom: "1px solid #1e293b",
            }}
          >
            <span
              style={{
                color: "#60a5fa",
                fontWeight: 800,
                fontSize: "0.82rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "inline-block",
                marginBottom: "0.6rem",
              }}
            >
              ✨ RHPS PIANO MASTERS STOREFRONT
            </span>
            <h1 style={{ fontSize: "2.4rem", fontWeight: 800, margin: "0 0 0.8rem 0", color: "#ffffff" }}>
              Certified Acoustic Pianos & Services
            </h1>
            <p style={{ color: "#94a3b8", maxWidth: "620px", margin: "0 auto", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Browse our handpicked Japanese & European grand pianos, upright pianos, and certified tuning & restoration packages with 5-Year Warranty.
            </p>
          </div>

          <section id="shop" style={styles.shopSection}>
          <div style={styles.shopHeaderRow}>
            <div>
              <span style={styles.sectionEyebrow}>STORE CATALOG</span>
              <h2 style={styles.sectionTitle}>Featured Pianos & Services</h2>
            </div>

            {/* Category Filter Pills */}
            <div style={styles.filterPillsRow}>
              {["All", "Piano", "Grand", "Service", "Accessories"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    ...styles.filterPill,
                    ...(activeCategory === cat ? styles.filterPillActive : {}),
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div style={styles.productGrid}>
            {filteredProducts.map((product) => {
              const inCart = cart.find((i) => i.product.id === product.id);

              return (
                <div key={product.id} style={styles.productTile}>
                  <div style={styles.productImageFrame}>
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={280}
                      height={180}
                      style={styles.tileImage}
                    />
                    <span style={styles.tileBadge}>{product.badge}</span>
                    <span style={styles.tileLocationBadge}>📍 {product.stockLocation}</span>
                  </div>

                  <div style={styles.tileBody}>
                    <div style={styles.tileCategoryRow}>
                      <span style={styles.tileCategory}>{product.category}</span>
                      <span style={styles.ratingBadge}>{product.rating}</span>
                    </div>

                    <h3 style={styles.tileTitle}>{product.title}</h3>
                    <span style={styles.tileSpecs}>{product.specs}</span>
                    <p style={styles.tileDesc}>{product.desc}</p>

                    <div style={styles.tileFooter}>
                      <div>
                        <span style={styles.tilePriceLabel}>PRICE</span>
                        <strong style={styles.tilePrice}>{product.priceFormatted}</strong>
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        style={{
                          ...styles.addToCartPill,
                          ...(inCart ? styles.addToCartPillActive : {}),
                        }}
                      >
                        {inCart ? `✓ Added (${inCart.quantity})` : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </section>
        </>
      )}

      {/* HOME PAGE SECTIONS (RESTORATION, REVIEWS, FAQ) */}
      {activePageTab === "home" && (
        <>
          {/* 5. RESTORATION WORKFLOW */}
          <section id="workflow" style={styles.workflowSection}>
            <div style={styles.sectionCenterHeader}>
              <span style={styles.sectionEyebrow}>THE RHPS STANDARD</span>
              <h2 style={styles.sectionTitle}>4-Stage Master Restoration Workflow</h2>
              <p style={styles.sectionSubtitle}>Rigorous acoustic restoration protocol performed by experienced craftsmen.</p>
            </div>

            <div style={styles.workflowGrid}>
              {[
                {
                  step: "01",
                  title: "Diagnostic & Action Inspection",
                  desc: "Multi-point inspection of pinblock torque, soundboard crown, hammer felts, and iron plate.",
                  icon: "🔍",
                },
                {
                  step: "02",
                  title: "Pinblock & Hammer Regulation",
                  desc: "Precision hammer action alignment, key balance weighting, and bushed pin re-torquing.",
                  icon: "⚙️",
                },
                {
                  step: "03",
                  title: "Cabinet & Keytop Polish",
                  desc: "Deep cabinet refinishing, brass hardware buffing, and original ivory/poly keytop polish.",
                  icon: "✨",
                },
                {
                  step: "04",
                  title: "Concert Pitch Voicing",
                  desc: "Triple-pass A440 tuning, acoustic voicing, and master technician final quality signoff.",
                  icon: "🎼",
                },
              ].map((item, idx) => (
                <div key={idx} style={styles.workflowTile}>
                  <div style={styles.workflowHeader}>
                    <span style={styles.stepPill}>{item.step}</span>
                    <span style={{ fontSize: "1.6rem" }}>{item.icon}</span>
                  </div>
                  <h3 style={styles.workflowTitle}>{item.title}</h3>
                  <p style={styles.workflowDesc}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 6. CLIENT REVIEWS & SOCIAL PROOF */}
          <section id="reviews" style={styles.reviewsSection}>
            <div style={styles.sectionCenterHeader}>
              <span style={styles.sectionEyebrow}>TRUSTED ACROSS MINDANAO</span>
              <h2 style={styles.sectionTitle}>What Musician & Schools Say</h2>
              <p style={styles.sectionSubtitle}>Over 1,200+ acoustic pianos restored and serviced for concert halls, academies, and private collectors.</p>
            </div>

            <div style={styles.reviewsGrid}>
              {[
                {
                  quote: "RHPS restored our Yamaha C3 grand piano to perfection for our concert hall. Their A440 pitch stability and action voicing are unmatched in the region.",
                  author: "Prof. M. Santos",
                  role: "Director, Davao Music Conservatory",
                  stars: "★★★★★",
                },
                {
                  quote: "Bought a serialized Yamaha U1 upright piano. Pristine Japanese mahogany hammers and pristine soundboard. The 5-year full warranty gives total peace of mind.",
                  author: "Dra. E. Reyes",
                  role: "Private Collector & Home Owner",
                  stars: "★★★★★",
                },
                {
                  quote: "Their master tuning and hammer action regulation brought our family heirloom Kawai grand back to life! Exceptional craftsmanship and fast delivery.",
                  author: "R. Agbon",
                  role: "Concert Accompanist & Teacher",
                  stars: "★★★★★",
                },
              ].map((rev, idx) => (
                <div key={idx} style={styles.reviewCard}>
                  <div style={styles.starRow}>{rev.stars}</div>
                  <p style={styles.reviewQuote}>"{rev.quote}"</p>
                  <div style={styles.reviewAuthorBox}>
                    <strong style={styles.authorName}>{rev.author}</strong>
                    <span style={styles.authorRole}>{rev.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 7. COLLAPSIBLE FAQ ACCORDION */}
          <section id="faq" style={styles.faqSection}>
            <div style={styles.sectionCenterHeader}>
              <span style={styles.sectionEyebrow}>FREQUENTLY ASKED QUESTIONS</span>
              <h2 style={styles.sectionTitle}>Everything You Need to Know</h2>
            </div>

            <div style={styles.faqContainer}>
              {FAQ_LIST.map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={idx} style={styles.faqCard}>
                    <button
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      style={styles.faqQuestionBtn}
                    >
                      <span style={styles.faqQuestionText}>{faq.q}</span>
                      <span style={styles.faqToggleIcon}>{isOpen ? "−" : "+"}</span>
                    </button>
                    {isOpen && <p style={styles.faqAnswerText}>{faq.a}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* 8. FLOATING CART BADGE (Only visible when items added) */}
      {totalCartCount > 0 && (
        <button onClick={handleCartClick} style={styles.floatingCartBtn}>
          <span style={{ fontSize: "1.2rem" }}>🛒</span>
          <span>Cart ({totalCartCount})</span>
          {cartSubtotal > 0 && (
            <span style={styles.floatingSubtotalPill}>₱{cartSubtotal.toLocaleString()}</span>
          )}
        </button>
      )}

      {/* 9. SLIDE-OUT E-COMMERCE CART DRAWER & CHECKOUT */}
      {cartOpen && (
        <div style={styles.drawerBackdrop} onClick={() => setCartOpen(false)}>
          <div style={styles.drawerSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerTopBar}>
              <div>
                <span style={styles.drawerCategory}>SHOPPING CART</span>
                <h2 style={styles.drawerHeading}>Your Cart ({totalCartCount})</h2>
              </div>
              <button onClick={() => setCartOpen(false)} style={styles.closeDrawerPill}>
                ✕
              </button>
            </div>

            <div style={styles.drawerContent}>
              {!orderComplete ? (
                <>
                  {cart.length === 0 ? (
                    <div style={styles.emptyStateBox}>
                      <div style={{ fontSize: "3.5rem" }}>🛒</div>
                      <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", margin: "0.5rem 0" }}>
                        Your Shopping Cart is Empty
                      </h3>
                      <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                        Browse our store catalog to add pianos or service packages to your cart.
                      </p>
                      <button onClick={() => setCartOpen(false)} style={styles.browseStorePill}>
                        Browse Store ➔
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={styles.cartList}>
                        {cart.map((item) => (
                          <div key={item.product.id} style={styles.cartRow}>
                            <span style={{ fontSize: "1.8rem" }}>{item.product.icon}</span>

                            <div style={{ flex: 1 }}>
                              <strong style={{ fontSize: "0.95rem", color: "#0f172a", display: "block" }}>
                                {item.product.title}
                              </strong>
                              <small style={{ color: "#64748b" }}>{item.product.priceFormatted}</small>
                            </div>

                            <div style={styles.qtyStepper}>
                              <button onClick={() => updateQuantity(item.product.id, -1)} style={styles.stepperBtn}>
                                -
                              </button>
                              <span style={{ fontWeight: 800, fontSize: "0.9rem" }}>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, 1)} style={styles.stepperBtn}>
                                +
                              </button>
                            </div>

                            <button onClick={() => removeFromCart(item.product.id)} style={styles.removeBtn}>
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>

                      <div style={styles.summaryCard}>
                        <div style={styles.summaryLine}>
                          <span style={{ color: "#64748b" }}>Subtotal:</span>
                          <strong style={{ color: "#0f172a" }}>₱{cartSubtotal.toLocaleString()}</strong>
                        </div>
                        <div style={styles.summaryLine}>
                          <span style={{ color: "#64748b" }}>Setup & Delivery:</span>
                          <span style={{ color: "#16a34a", fontWeight: 700 }}>FREE (Promo)</span>
                        </div>
                        <div style={{ ...styles.summaryLine, borderTop: "1px solid #cbd5e1", paddingTop: "0.6rem", marginTop: "0.4rem" }}>
                          <span style={{ fontWeight: 800, color: "#0f172a" }}>Total:</span>
                          <strong style={{ fontSize: "1.35rem", color: "#2563eb", fontWeight: 900 }}>
                            ₱{cartSubtotal.toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      {/* Checkout Form */}
                      <form onSubmit={handleCheckoutSubmit} style={styles.checkoutForm}>
                        <div style={styles.accountVerifiedBadge}>
                          <span>✅ Verified Customer Account</span>
                        </div>

                        <label style={styles.formLabel}>Customer Delivery & Checkout Info:</label>

                        <input
                          type="text"
                          required
                          placeholder="Full Name *"
                          value={checkoutDetails.name}
                          onChange={(e) => setCheckoutDetails({ ...checkoutDetails, name: e.target.value })}
                          style={styles.lightFormInput}
                        />

                        <input
                          type="tel"
                          required
                          placeholder="Mobile / Viber Number *"
                          value={checkoutDetails.phone}
                          onChange={(e) => setCheckoutDetails({ ...checkoutDetails, phone: e.target.value })}
                          style={styles.lightFormInput}
                        />

                        <input
                          type="text"
                          placeholder="Delivery Address / City"
                          value={checkoutDetails.address}
                          onChange={(e) => setCheckoutDetails({ ...checkoutDetails, address: e.target.value })}
                          style={styles.lightFormInput}
                        />

                        <div style={styles.checkoutBtnGroup}>
                          <button type="submit" disabled={checkingOut} style={styles.primaryCheckoutPill}>
                            {checkingOut ? "Processing..." : "💳 Place Order Request"}
                          </button>

                          <button type="button" onClick={handleViberCheckout} style={styles.viberCheckoutPill}>
                            💬 Order via Viber Chat
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </>
              ) : (
                <div style={styles.successStateBox}>
                  <div style={{ fontSize: "3.5rem" }}>🎉</div>
                  <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: "0.5rem 0" }}>
                    Order Placed Successfully!
                  </h3>
                  <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.5" }}>
                    Thank you <strong>{checkoutDetails.name}</strong>. Your order request total <strong>₱{cartSubtotal.toLocaleString()}</strong> has been submitted to our sales queue.
                  </p>

                  <div style={styles.statusNoticeBox}>
                    <span>STATUS: Saved to Admin Dashboard</span>
                  </div>

                  <button
                    onClick={() => {
                      setCart([]);
                      updateCartState([]);
                      setOrderComplete(false);
                      setCartOpen(false);
                    }}
                    style={styles.doneCloseBtn}
                  >
                    Done & Close ➔
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 10. POLITE CUSTOMER ACCOUNT NOTICE MODAL */}
      {showPoliteModal && (
        <div style={styles.politeModalOverlay} onClick={() => setShowPoliteModal(false)}>
          <div style={styles.politeModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.politeHeaderIcon}>🎹</div>

            <h3 style={styles.politeModalTitle}>
              {intentProduct
                ? `Create an Account to Reserve ${intentProduct.title}`
                : "Create an Account to Save Your Selection"}
            </h3>

            <p style={styles.politeModalSubtitle}>
              To save your piano selection, track your official receipt, and activate your <strong>5-Year Warranty</strong>, please sign up or log in to your customer account.
            </p>

            {intentProduct && (
              <div style={styles.politeIntentPreview}>
                <span style={{ fontSize: "1.8rem" }}>{intentProduct.icon}</span>
                <div style={{ textAlign: "left", flex: 1 }}>
                  <strong style={{ fontSize: "0.95rem", color: "#0f172a", display: "block" }}>
                    {intentProduct.title}
                  </strong>
                  <small style={{ color: "#2563eb", fontWeight: 700 }}>{intentProduct.priceFormatted}</small>
                </div>
                <span style={styles.selectedPillTag}>Selected Unit</span>
              </div>
            )}

            <div style={styles.politeValueStrip}>
              <span style={styles.politeValueBadge}>✓ 5-Year Full Warranty</span>
              <span style={styles.politeValueBadge}>✓ Official Order Receipt</span>
              <span style={styles.politeValueBadge}>✓ Priority Transport</span>
            </div>

            <div style={styles.politeCtaGroup}>
              <button
                onClick={() => {
                  setShowPoliteModal(false);
                  onOpenLogin();
                }}
                style={styles.politeRegisterPill}
              >
                Log In / Register ➔
              </button>

              <button
                onClick={() => setShowPoliteModal(false)}
                style={styles.politeCancelLink}
              >
                Continue Browsing First
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. FOOTER */}
      <footer style={styles.footerBar}>
        <div style={styles.footerInner}>
          <div>
            <div style={{ fontWeight: 900, color: "#ffffff", fontSize: "1.1rem", marginBottom: "0.3rem" }}>
              RHPS PIANO MASTERS
            </div>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8" }}>
              © 2026 RHPS PIANO MASTERS. Davao City & Mindanao Regional Workshop Yards.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    position: "relative",
  },
  toastNotification: {
    position: "fixed",
    top: "90px",
    right: "24px",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "0.9rem",
    padding: "0.85rem 1.4rem",
    borderRadius: "999px",
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.25)",
    zIndex: 1000,
  },
  topAnnouncementBar: {
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    padding: "0.5rem 0",
    fontSize: "0.82rem",
    color: "#64748b",
  },
  topInner: {
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusPill: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  statusDot: {
    color: "#16a34a",
    fontSize: "0.75rem",
  },
  topContactInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
  },
  dotDivider: {
    color: "#cbd5e1",
  },
  navbar: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(24px)",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navInner: {
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "0.9rem 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  brandEmblem: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.4rem",
  },
  brandTitle: {
    fontSize: "1.1rem",
    fontWeight: 900,
    letterSpacing: "0.05em",
    color: "#0f172a",
    display: "block",
    lineHeight: "1.1",
  },
  brandSubtitle: {
    fontSize: "0.7rem",
    fontWeight: 600,
    color: "#64748b",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "1.8rem",
  },
  navLink: {
    color: "#475569",
    textDecoration: "none",
    fontSize: "0.92rem",
    fontWeight: 600,
  },
  registerPillBtn: {
    color: "#2563eb",
    textDecoration: "none",
    fontSize: "0.88rem",
    fontWeight: 600,
    padding: "0.45rem 0.95rem",
    borderRadius: "999px",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
  },
  headerActionRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
  },
  headerCartPill: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "0.88rem",
    padding: "0.55rem 1.2rem",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
  },
  cartCountBadge: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "0.75rem",
    fontWeight: 900,
    padding: "0.15rem 0.5rem",
    borderRadius: "999px",
  },
  portalLoginPill: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "0.88rem",
    padding: "0.55rem 1.25rem",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
  },
  heroSection: {
    backgroundColor: "#ffffff",
    padding: "4.5rem 0 5.5rem 0",
    borderBottom: "1px solid #f1f5f9",
  },
  heroInner: {
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "3.5rem",
    alignItems: "center",
  },
  heroContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  eyebrowChip: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1d4ed8",
    padding: "0.35rem 0.9rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    marginBottom: "1.2rem",
  },
  heroTitle: {
    fontSize: "3.5rem",
    fontWeight: 900,
    lineHeight: "1.12",
    color: "#0f172a",
    margin: "0 0 1.2rem 0",
  },
  blueSpan: {
    color: "#2563eb",
  },
  dotSpan: {
    color: "#2563eb",
  },
  heroSubtitle: {
    fontSize: "1.1rem",
    color: "#475569",
    lineHeight: "1.65",
    margin: "0 0 2rem 0",
  },
  trustBadgesRow: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2.2rem",
    flexWrap: "wrap",
  },
  trustBadge: {
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "#1e40af",
    backgroundColor: "#f0f9ff",
    padding: "0.35rem 0.75rem",
    borderRadius: "6px",
    border: "1px solid #e0f2fe",
  },
  heroCtaGroup: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  primaryBluePill: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "1rem",
    padding: "0.95rem 1.8rem",
    borderRadius: "999px",
    textDecoration: "none",
    boxShadow: "0 10px 25px rgba(37, 99, 235, 0.35)",
  },
  secondaryWhitePill: {
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: "1rem",
    padding: "0.95rem 1.6rem",
    borderRadius: "999px",
    textDecoration: "none",
  },
  heroVisual: {
    position: "relative",
  },
  visualFrame: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    padding: "1rem",
    boxShadow: "0 25px 50px -15px rgba(0, 0, 0, 0.08)",
    position: "relative",
  },
  heroImg: {
    width: "100%",
    height: "auto",
    borderRadius: "18px",
    display: "block",
  },
  floatingSpecBadge1: {
    position: "absolute",
    top: "-18px",
    left: "-18px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "0.75rem 1.1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.08)",
  },
  floatingSpecBadge2: {
    position: "absolute",
    bottom: "-18px",
    right: "-18px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "0.75rem 1.1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.08)",
  },
  shopSection: {
    backgroundColor: "#ffffff",
    padding: "5rem 0 6rem 0",
    borderBottom: "1px solid #f1f5f9",
  },
  shopHeaderRow: {
    maxWidth: "1250px",
    margin: "0 auto 3rem auto",
    padding: "0 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: "1.5rem",
  },
  sectionEyebrow: {
    fontSize: "0.78rem",
    fontWeight: 800,
    color: "#2563eb",
    letterSpacing: "0.08em",
  },
  sectionTitle: {
    fontSize: "2.3rem",
    fontWeight: 900,
    color: "#0f172a",
    margin: "0.3rem 0 0 0",
  },
  filterPillsRow: {
    display: "flex",
    gap: "0.5rem",
    backgroundColor: "#f1f5f9",
    padding: "0.35rem",
    borderRadius: "999px",
  },
  filterPill: {
    backgroundColor: "transparent",
    border: "none",
    color: "#64748b",
    padding: "0.5rem 1.1rem",
    borderRadius: "999px",
    fontSize: "0.88rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  filterPillActive: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontWeight: 800,
  },
  productGrid: {
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.8rem",
  },
  productTile: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    padding: "1.4rem",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 15px 35px -10px rgba(0, 0, 0, 0.05)",
  },
  productImageFrame: {
    backgroundColor: "#f8fafc",
    borderRadius: "18px",
    padding: "1rem",
    position: "relative",
    textAlign: "center",
    marginBottom: "1.2rem",
  },
  tileImage: {
    width: "100%",
    height: "auto",
    borderRadius: "12px",
    display: "block",
  },
  tileBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "0.72rem",
    fontWeight: 800,
    padding: "0.25rem 0.65rem",
    borderRadius: "6px",
    border: "1px solid #bfdbfe",
  },
  tileLocationBadge: {
    position: "absolute",
    bottom: "12px",
    left: "12px",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    color: "#ffffff",
    fontSize: "0.7rem",
    fontWeight: 700,
    padding: "0.2rem 0.55rem",
    borderRadius: "6px",
    backdropFilter: "blur(4px)",
  },
  tileBody: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  tileCategoryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.4rem",
  },
  tileCategory: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  ratingBadge: {
    fontSize: "0.75rem",
    color: "#d97706",
    fontWeight: 700,
  },
  tileTitle: {
    fontSize: "1.15rem",
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 0.3rem 0",
    lineHeight: "1.3",
  },
  tileSpecs: {
    fontSize: "0.78rem",
    color: "#64748b",
    fontWeight: 600,
    marginBottom: "0.8rem",
    display: "block",
  },
  tileDesc: {
    fontSize: "0.88rem",
    color: "#475569",
    lineHeight: "1.5",
    margin: "0 0 1.5rem 0",
    flex: 1,
  },
  tileFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "1rem",
    marginTop: "auto",
    borderTop: "1px solid #f1f5f9",
  },
  tilePriceLabel: {
    fontSize: "0.68rem",
    fontWeight: 700,
    color: "#94a3b8",
    display: "block",
  },
  tilePrice: {
    fontSize: "1.2rem",
    fontWeight: 900,
    color: "#0f172a",
  },
  addToCartPill: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "0.85rem",
    padding: "0.65rem 1.25rem",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.2)",
  },
  addToCartPillActive: {
    backgroundColor: "#16a34a",
  },
  workflowSection: {
    backgroundColor: "#f8fafc",
    padding: "5rem 0 6rem 0",
  },
  sectionCenterHeader: {
    textAlign: "center",
    maxWidth: "750px",
    margin: "0 auto 3.5rem auto",
  },
  workflowGrid: {
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  workflowTile: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    padding: "2rem 1.6rem",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.03)",
  },
  workflowHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  stepPill: {
    fontSize: "0.8rem",
    fontWeight: 900,
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    padding: "0.3rem 0.7rem",
    borderRadius: "8px",
  },
  workflowTitle: {
    fontSize: "1.15rem",
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 0.5rem 0",
  },
  workflowDesc: {
    fontSize: "0.88rem",
    color: "#475569",
    lineHeight: "1.55",
    margin: 0,
  },
  reviewsSection: {
    backgroundColor: "#ffffff",
    padding: "5rem 0 6rem 0",
    borderBottom: "1px solid #f1f5f9",
  },
  reviewsGrid: {
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.8rem",
  },
  reviewCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
  },
  starRow: {
    color: "#d97706",
    fontSize: "1.1rem",
    marginBottom: "0.8rem",
  },
  reviewQuote: {
    color: "#334155",
    fontSize: "0.95rem",
    lineHeight: "1.65",
    fontStyle: "italic",
    margin: "0 0 1.5rem 0",
    flex: 1,
  },
  reviewAuthorBox: {
    borderTop: "1px solid #e2e8f0",
    paddingTop: "0.8rem",
    display: "flex",
    flexDirection: "column",
  },
  authorName: {
    color: "#0f172a",
    fontSize: "0.95rem",
    fontWeight: 800,
  },
  authorRole: {
    color: "#64748b",
    fontSize: "0.8rem",
  },
  faqSection: {
    backgroundColor: "#f8fafc",
    padding: "5rem 0 6rem 0",
  },
  faqContainer: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  faqCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "1.4rem 1.8rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
  },
  faqHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  faqQuestion: {
    fontSize: "1.05rem",
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
  },
  faqToggleIcon: {
    fontSize: "1.4rem",
    color: "#2563eb",
    fontWeight: 800,
  },
  faqAnswer: {
    fontSize: "0.92rem",
    color: "#475569",
    lineHeight: "1.65",
    marginTop: "0.8rem",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "0.8rem",
    margin: "0.8rem 0 0 0",
  },
  floatingCartBtn: {
    position: "fixed",
    bottom: "32px",
    right: "32px",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "0.95rem",
    padding: "0.9rem 1.5rem",
    borderRadius: "999px",
    border: "2px solid #2563eb",
    boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    cursor: "pointer",
    zIndex: 99,
  },
  floatingSubtotalPill: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "0.82rem",
    fontWeight: 900,
    padding: "0.2rem 0.65rem",
    borderRadius: "999px",
  },
  drawerBackdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(12px)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "flex-end",
  },
  drawerSheet: {
    width: "520px",
    maxWidth: "100%",
    height: "100vh",
    backgroundColor: "#ffffff",
    boxShadow: "-20px 0 50px rgba(0, 0, 0, 0.25)",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  drawerTopBar: {
    padding: "1.8rem 2.2rem",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  drawerCategory: {
    fontSize: "0.72rem",
    fontWeight: 800,
    color: "#2563eb",
    letterSpacing: "0.08em",
  },
  drawerHeading: {
    fontSize: "1.45rem",
    fontWeight: 900,
    color: "#0f172a",
    margin: "0.2rem 0 0 0",
  },
  closeDrawerPill: {
    background: "transparent",
    border: "1px solid #cbd5e1",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    color: "#475569",
    fontWeight: 800,
    fontSize: "1rem",
    cursor: "pointer",
  },
  drawerContent: {
    padding: "2.2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.6rem",
  },
  emptyStateBox: {
    textAlign: "center",
    padding: "3.5rem 1rem",
  },
  browseStorePill: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "0.95rem",
    padding: "0.85rem 1.6rem",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    marginTop: "1.2rem",
  },
  cartList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
  },
  cartRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.9rem",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "1rem",
  },
  qtyStepper: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "0.2rem 0.5rem",
  },
  stepperBtn: {
    background: "transparent",
    border: "none",
    fontWeight: 800,
    fontSize: "1rem",
    color: "#2563eb",
    cursor: "pointer",
    width: "24px",
    height: "24px",
  },
  removeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
  },
  summaryCard: {
    backgroundColor: "#eff6ff",
    borderRadius: "14px",
    border: "1px solid #bfdbfe",
    padding: "1.4rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  summaryLine: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.92rem",
  },
  checkoutForm: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
  },
  accountVerifiedBadge: {
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#15803d",
    fontSize: "0.82rem",
    fontWeight: 700,
    padding: "0.4rem 0.8rem",
    borderRadius: "8px",
    textAlign: "center",
    marginBottom: "0.8rem",
  },
  formLabel: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#0f172a",
  },
  lightFormInput: {
    backgroundColor: "#f8fafc",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "0.8rem 1rem",
    color: "#0f172a",
    fontSize: "0.9rem",
    outline: "none",
  },
  checkoutBtnGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.65rem",
    marginTop: "1rem",
  },
  primaryCheckoutPill: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "1rem",
    padding: "0.95rem",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(37, 99, 235, 0.35)",
  },
  viberCheckoutPill: {
    backgroundColor: "#7360f2",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "0.95rem",
    padding: "0.9rem",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
  },
  successStateBox: {
    textAlign: "center",
    padding: "3rem 1rem",
  },
  statusNoticeBox: {
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    fontSize: "0.85rem",
    fontWeight: 700,
    padding: "0.8rem",
    borderRadius: "10px",
    margin: "1.5rem 0",
  },
  doneCloseBtn: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "0.95rem",
    padding: "0.9rem 1.6rem",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
  },
  politeModalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(10px)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
  },
  politeModalCard: {
    backgroundColor: "#ffffff",
    borderRadius: "28px",
    padding: "2.5rem 2.2rem",
    maxWidth: "480px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.25)",
    border: "1px solid #e2e8f0",
  },
  politeHeaderIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontSize: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.2rem auto",
  },
  politeModalTitle: {
    fontSize: "1.45rem",
    fontWeight: 900,
    color: "#0f172a",
    margin: "0 0 0.5rem 0",
    lineHeight: "1.25",
  },
  politeModalSubtitle: {
    color: "#475569",
    fontSize: "0.92rem",
    lineHeight: "1.6",
    margin: "0 0 1.4rem 0",
  },
  politeIntentPreview: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "0.85rem 1.1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.9rem",
    marginBottom: "1.4rem",
  },
  selectedPillTag: {
    fontSize: "0.72rem",
    fontWeight: 800,
    color: "#1d4ed8",
    backgroundColor: "#eff6ff",
    padding: "0.25rem 0.6rem",
    borderRadius: "6px",
  },
  politeValueStrip: {
    display: "flex",
    justifyContent: "center",
    gap: "0.6rem",
    marginBottom: "1.8rem",
    flexWrap: "wrap",
  },
  politeValueBadge: {
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#1e40af",
    backgroundColor: "#f0f9ff",
    padding: "0.3rem 0.7rem",
    borderRadius: "6px",
    border: "1px solid #e0f2fe",
  },
  politeCtaGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  politeRegisterPill: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "1rem",
    padding: "0.95rem",
    borderRadius: "999px",
    textDecoration: "none",
    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.35)",
    display: "block",
  },
  politeLoginPill: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1d4ed8",
    fontWeight: 800,
    fontSize: "0.92rem",
    padding: "0.85rem",
    borderRadius: "999px",
    cursor: "pointer",
  },
  politeCancelLink: {
    backgroundColor: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: "0.88rem",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "0.3rem",
  },
  footerBar: {
    backgroundColor: "#090d16",
    color: "#94a3b8",
    padding: "3rem 0 2.5rem 0",
    fontSize: "0.85rem",
  },
  footerInner: {
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerPortalLink: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#60a5fa",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "0.85rem",
    padding: "0.65rem 1.2rem",
    borderRadius: "999px",
  },
};

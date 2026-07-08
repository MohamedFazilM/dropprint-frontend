import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import useCartStore from "../store/cartStore";
import useWishlistStore from "../store/wishlistStore";

function Navbar() {
    const count = useCartStore((state) => state.getCount());
    const wishlistCount = useWishlistStore((state) => state.items.length);
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [customerUser, setCustomerUser] = useState(null);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    // Sync customer user from localStorage
    useEffect(() => {
        const syncUser = () => {
            setProfileDropdownOpen(false);
            const stored = localStorage.getItem("customerUser");
            if (stored) {
                try {
                    setCustomerUser(JSON.parse(stored));
                } catch (e) {
                    setCustomerUser(null);
                }
            } else {
                setCustomerUser(null);
            }
        };

        syncUser();
        
        window.addEventListener("storage", syncUser);
        window.addEventListener("customerLoginUpdate", syncUser);
        return () => {
            window.removeEventListener("storage", syncUser);
            window.removeEventListener("customerLoginUpdate", syncUser);
        };
    }, [location.pathname]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Close mobile menu on page change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { to: "/", label: "Home" },
        { to: "/shop", label: "Shop" },
        { to: "/customize", label: "Customize" },
        { to: "/about", label: "About" },
        { to: "/contact", label: "Contact" },
        { to: "/pricing", label: "Pricing" },
        { to: "/faq", label: "FAQ" },
    ];

    return (
        <>
            <nav style={{
                fontFamily: "'Outfit', sans-serif",
                position: "sticky",
                top: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: isMobile ? "0 16px" : "0 40px",
                height: "68px",
                background: scrolled || mobileMenuOpen
                    ? "rgba(255, 255, 255, 0.95)"
                    : "#fff",
                backdropFilter: scrolled || mobileMenuOpen ? "blur(16px)" : "none",
                WebkitBackdropFilter: scrolled || mobileMenuOpen ? "blur(16px)" : "none",
                borderBottom: scrolled || mobileMenuOpen ? "1px solid rgba(0,0,0,0.08)" : "1px solid #f0f0f0",
                boxShadow: scrolled && !mobileMenuOpen ? "0 2px 24px rgba(0,0,0,0.07)" : "none",
                transition: "all 0.3s ease",
            }}>
                {/* Logo */}
                <Link to="/" style={{ textDecoration: "none", flexShrink: 0 }}>
                    <div style={{ lineHeight: 1 }}>
                        <div style={{
                            display: "flex",
                            gap: "5px",
                            alignItems: "baseline",
                            fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                            letterSpacing: "2px"
                        }}>
                            <span style={{ fontSize: isMobile ? "22px" : "28px", color: "#111", fontWeight: 900 }}>
                                DR<span style={{ color: "#cc0000" }}>O</span>P
                            </span>
                            <span style={{ fontSize: isMobile ? "22px" : "28px", color: "#111", fontWeight: 900 }}>
                                PRIN<span style={{ color: "#cc0000" }}>T</span>
                            </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                            <span style={{ flex: 1, height: "1px", background: "#ccc", display: "inline-block" }}></span>
                            <span style={{
                                fontSize: isMobile ? "5.5px" : "7px",
                                fontFamily: "'Outfit', sans-serif",
                                fontWeight: 600,
                                letterSpacing: isMobile ? "3px" : "5px",
                                color: "#999",
                                textTransform: "uppercase"
                            }}>CLOTHING</span>
                            <span style={{ flex: 1, height: "1px", background: "#ccc", display: "inline-block" }}></span>
                        </div>
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                {!isMobile && (
                    <div style={{
                        display: "flex",
                        gap: "4px",
                        alignItems: "center",
                    }}>
                        {navLinks.map(({ to, label }) => {
                            const isActive = location.pathname === to;
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    style={{
                                        fontFamily: "'Outfit', sans-serif",
                                        fontSize: "13px",
                                        fontWeight: isActive ? 700 : 500,
                                        letterSpacing: "0.3px",
                                        textTransform: "uppercase",
                                        color: isActive ? "#cc0000" : "#333",
                                        textDecoration: "none",
                                        padding: "6px 12px",
                                        borderRadius: "6px",
                                        background: isActive ? "rgba(204,0,0,0.07)" : "transparent",
                                        transition: "all 0.2s ease",
                                        position: "relative",
                                    }}
                                    onMouseEnter={e => {
                                        if (!isActive) {
                                            e.currentTarget.style.color = "#cc0000";
                                            e.currentTarget.style.background = "rgba(204,0,0,0.06)";
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!isActive) {
                                            e.currentTarget.style.color = "#333";
                                            e.currentTarget.style.background = "transparent";
                                        }
                                    }}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Actions: Wishlist, Cart and Hamburger */}
                <div style={{ display: "flex", gap: isMobile ? "8px" : "10px", alignItems: "center", flexShrink: 0 }}>
                    {/* Wishlist Link */}
                    <Link
                        to="/wishlist"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 600,
                            fontSize: "13px",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                            color: "#111",
                            textDecoration: "none",
                            position: "relative",
                            padding: isMobile ? "8px 10px" : "8px 16px",
                            borderRadius: "8px",
                            border: "1.5px solid #e5e5e5",
                            background: "#fff",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = "#cc0000";
                            e.currentTarget.style.color = "#cc0000";
                            e.currentTarget.style.background = "rgba(204,0,0,0.04)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = "#e5e5e5";
                            e.currentTarget.style.color = "#111";
                            e.currentTarget.style.background = "#fff";
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {!isMobile && "WISHLIST"}
                        {wishlistCount > 0 && (
                            <span style={{
                                position: "absolute",
                                top: "-6px",
                                right: "-6px",
                                background: "#cc0000",
                                color: "#fff",
                                fontSize: "10px",
                                borderRadius: "50%",
                                width: "18px",
                                height: "18px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                boxShadow: "0 2px 6px rgba(204,0,0,0.4)",
                            }}>
                                {wishlistCount}
                            </span>
                        )}
                    </Link>

                    {/* Cart Link */}
                    <Link
                        to="/cart"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 600,
                            fontSize: "13px",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                            color: "#111",
                            textDecoration: "none",
                            position: "relative",
                            padding: isMobile ? "8px 10px" : "8px 16px",
                            borderRadius: "8px",
                            border: "1.5px solid #e5e5e5",
                            background: "#fff",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = "#cc0000";
                            e.currentTarget.style.color = "#cc0000";
                            e.currentTarget.style.background = "rgba(204,0,0,0.04)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = "#e5e5e5";
                            e.currentTarget.style.color = "#111";
                            e.currentTarget.style.background = "#fff";
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        {!isMobile && "CART"}
                        {count > 0 && (
                            <span style={{
                                position: "absolute",
                                top: "-6px",
                                right: "-6px",
                                background: "#cc0000",
                                color: "#fff",
                                fontSize: "10px",
                                borderRadius: "50%",
                                width: "18px",
                                height: "18px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                boxShadow: "0 2px 6px rgba(204,0,0,0.4)",
                            }}>
                                {count}
                            </span>
                        )}
                    </Link>

                    {/* Customer Login/Profile Action */}
                    {customerUser ? (
                        <div 
                            style={{ position: "relative" }}
                            onMouseEnter={() => setProfileDropdownOpen(true)}
                            onMouseLeave={() => setProfileDropdownOpen(false)}
                        >
                            {/* Profile Trigger Button (Circular Avatar) */}
                            <button
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "38px",
                                    height: "38px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #cc0000 0%, #a30000 100%)",
                                    color: "#fff",
                                    fontFamily: "'Outfit', sans-serif",
                                    fontWeight: 700,
                                    fontSize: "15px",
                                    border: "1.5px solid transparent",
                                    cursor: "pointer",
                                    boxShadow: "0 2px 8px rgba(204,0,0,0.2)",
                                    transition: "all 0.2s ease",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = "scale(1.05)";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(204,0,0,0.35)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(204,0,0,0.2)";
                                }}
                            >
                                {customerUser.name.charAt(0).toUpperCase()}
                            </button>

                            {/* Dropdown Menu Box */}
                            {profileDropdownOpen && (
                                <div style={{
                                    position: "absolute",
                                    top: "100%",
                                    right: 0,
                                    marginTop: "6px",
                                    width: "230px",
                                    background: "#fff",
                                    borderRadius: "14px",
                                    boxShadow: "0 12px 36px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04)",
                                    border: "1px solid #eef0f3",
                                    padding: "6px 0",
                                    zIndex: 1000,
                                    animation: "slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) both"
                                }}>
                                    {/* User header section */}
                                    <div style={{
                                        padding: "12px 16px",
                                        borderBottom: "1px solid #f3f4f6"
                                    }}>
                                        <div style={{ fontSize: "14px", fontWeight: 800, color: "#111", textTransform: "capitalize" }}>{customerUser.name}</div>
                                        <div style={{ fontSize: "11px", color: "#71717a", marginTop: "2px", wordBreak: "break-all" }}>{customerUser.email}</div>
                                    </div>

                                    {/* User metadata list */}
                                    <div style={{ padding: "6px 0" }}>
                                        {customerUser.phone && (
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                padding: "6px 16px",
                                                fontSize: "12px",
                                                color: "#4b5563"
                                            }}>
                                                <span>📞</span>
                                                <span>{customerUser.phone}</span>
                                            </div>
                                        )}
                                        {customerUser.address && (
                                            <div style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: "8px",
                                                padding: "6px 16px",
                                                fontSize: "12px",
                                                color: "#4b5563",
                                                lineHeight: "1.4"
                                            }}>
                                                <span>📍</span>
                                                <span style={{
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden"
                                                }}>{customerUser.address}</span>
                                            </div>
                                        )}

                                        <hr style={{ border: 0, borderTop: "1px solid #f3f4f6", margin: "8px 0" }} />

                                        {/* Logout trigger */}
                                        <button
                                            onClick={() => {
                                                localStorage.removeItem("customerUser");
                                                localStorage.removeItem("supabaseAccessToken");
                                                window.dispatchEvent(new Event("customerLoginUpdate"));
                                            }}
                                            style={{
                                                width: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                padding: "10px 16px",
                                                fontFamily: "'Outfit', sans-serif",
                                                fontSize: "13px",
                                                fontWeight: 700,
                                                color: "#cc0000",
                                                background: "none",
                                                border: "none",
                                                textAlign: "left",
                                                cursor: "pointer",
                                                transition: "background 0.2s"
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = "#fff1f1"}
                                            onMouseLeave={e => e.currentTarget.style.background = "none"}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                <polyline points="16 17 21 12 16 7" />
                                                <line x1="21" y1="12" x2="9" y2="12" />
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontFamily: "'Outfit', sans-serif",
                                fontWeight: 600,
                                fontSize: "13px",
                                letterSpacing: "0.5px",
                                textTransform: "uppercase",
                                color: "#111",
                                textDecoration: "none",
                                padding: isMobile ? "8px 10px" : "8px 16px",
                                borderRadius: "8px",
                                border: "1.5px solid #e5e5e5",
                                background: "#fff",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "#cc0000";
                                e.currentTarget.style.color = "#cc0000";
                                e.currentTarget.style.background = "rgba(204,0,0,0.04)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "#e5e5e5";
                                e.currentTarget.style.color = "#111";
                                e.currentTarget.style.background = "#fff";
                            }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            {!isMobile && "LOGIN"}
                        </Link>
                    )}

                    {/* Hamburger Button */}
                    {isMobile && (
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "38px",
                                height: "38px",
                                borderRadius: "8px",
                                border: "1.5px solid #e5e5e5",
                                background: "#fff",
                                color: "#111",
                                cursor: "pointer",
                                padding: 0,
                                transition: "all 0.2s ease",
                            }}
                        >
                            {mobileMenuOpen ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            {isMobile && mobileMenuOpen && (
                <div style={{
                    position: "fixed",
                    top: "68px",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(255, 255, 255, 0.98)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    zIndex: 999,
                    display: "flex",
                    flexDirection: "column",
                    padding: "24px 16px",
                    gap: "12px",
                    borderTop: "1px solid rgba(0,0,0,0.05)",
                    overflowY: "auto",
                    animation: "fadeInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) both"
                }}>
                    {navLinks.map(({ to, label }) => {
                        const isActive = location.pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                style={{
                                    fontFamily: "'Outfit', sans-serif",
                                    fontSize: "18px",
                                    fontWeight: isActive ? 800 : 500,
                                    letterSpacing: "0.5px",
                                    textTransform: "uppercase",
                                    color: isActive ? "#cc0000" : "#111",
                                    textDecoration: "none",
                                    padding: "16px 20px",
                                    borderRadius: "12px",
                                    background: isActive ? "rgba(204,0,0,0.06)" : "#fafafa",
                                    border: isActive ? "1px solid rgba(204,0,0,0.1)" : "1px solid #eee",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {label}
                            </Link>
                        );
                    })}
                    <style>{`
                        @keyframes fadeInDown {
                            from { opacity: 0; transform: translateY(-10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes slideDown {
                            from { opacity: 0; transform: translateY(6px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </div>
            )}
        </>
    );
}

export default Navbar;
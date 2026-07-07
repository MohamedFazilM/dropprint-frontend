import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import CustomizeHeroAnimation from "../components/CustomizeHeroAnimation";
import "../components/ScrollFrameAnimation.css";

import tshirt1 from "./customize_image/tshirt1.jfif";
import tshirt2 from "./customize_image/tshirt2.jfif";
import tshirt3 from "./customize_image/tshirt3.jfif";
import tshirt4 from "./customize_image/tshirt4.jfif";
import tshirt5 from "./customize_image/tshirt5.jfif";
import tshirt6 from "./customize_image/tshirt6.jfif";


// Top of component-ல இதை add பண்ணு
const SCROLL_PER_FRAME = 14;
const tshirts = [
    { id: 1, image: tshirt1, title: "Street Vibes Tee", tag: "Trending" },
    { id: 2, image: tshirt2, title: "Abstract Flow Tee", tag: "New" },
    { id: 3, image: tshirt3, title: "Minimal Edge Tee", tag: "Popular" },
    { id: 4, image: tshirt4, title: "Urban Canvas Tee", tag: "Hot" },
    { id: 5, image: tshirt5, title: "Retro Graphic Tee", tag: "Best Seller" },
    { id: 6, image: tshirt6, title: "Bold Statement Tee", tag: "Limited" },
];

function Customize() {
    const [vh, setVh] = useState(() => window.innerHeight);
    const [scrollY, setScrollY] = useState(0);
    const [visibleCards, setVisibleCards] = useState(new Set());
    const cardRefs = useRef([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const updateVh = () => setVh(window.innerHeight);
        const handleResize = () => {
            updateVh();
            setIsMobile(window.innerWidth < 768);
        };
        updateVh();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleCards((prev) => new Set([...prev, entry.target.dataset.index]));
                    }
                });
            },
            { threshold: 0.15 }
        );
        cardRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });
        return () => observer.disconnect();
    }, []);

    const totalScrollHeightPx = vh + (263 * SCROLL_PER_FRAME);

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", background: "#fff", color: "#111" }}>

            {/* ─── HERO SECTION ─── */}
            <section className="customize-hero-section" style={{
                position: "relative",
                width: "100%",
                minHeight: `${vh * 6}px`,
                background: "#fafafa",
            }}>
                <div className="customize-hero-sticky" style={{
                    position: "sticky",
                    top: 0,
                    height: `${vh}px`,
                    width: "100%",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    background: "#fafafa",
                }}>
                    {/* The Full Width Scroll Animation */}
                    <CustomizeHeroAnimation />

                    {/* Content Overlay */}
                    <div className="customize-hero-content" style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: "100%",
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        padding: "40px 24px 15px",
                        textAlign: "center",
                        background: "radial-gradient(ellipse 70% 40% at 50% 5%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%)",
                    }}>

                        {/* Title */}
                        <h1 style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: "clamp(40px, 6vw, 70px)",
                            fontWeight: 800,
                            lineHeight: 0.9,
                            margin: "0 0 24px",
                            letterSpacing: "-2px",
                            color: "#111",
                            animation: "fadeInUp 0.8s ease-out 0.15s both",
                        }}>
                            Make It{" "}
                            <span style={{
                                background: "linear-gradient(135deg, #dc0000, #aa0000)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}>
                                Yours
                            </span>
                            {" "}
                            <span style={{ color: "#333", fontWeight: 500 }}>
                                Wear It{" "}
                            </span>
                            <span style={{ color: "#222" }}>
                                Proud
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: "clamp(15px, 1.8vw, 18px)",
                            color: "#555",
                            maxWidth: "520px",
                            margin: "0 0 36px 0",
                            lineHeight: 1.4,
                            fontWeight: 500,
                            animation: "fadeInUp 0.8s ease-out 0.3s both",
                        }}>
                            Upload your artwork, position it just right, and we'll print it on premium
                            drop-shoulder tees. Your vision, our craft.
                        </p>

                        {/* CTA Buttons */}
                        <div style={{
                            display: "flex",
                            gap: isMobile ? "8px" : "30px",
                            flexWrap: "nowrap",
                            justifyContent: "center",
                            marginTop: "auto",
                            animation: "fadeInUp 0.8s ease-out 0.45s both",
                        }}>
                            <Link
                                to="/shop"
                                id="hero-cta-shop"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                    padding: isMobile ? "8px 14px" : "14px 32px",
                                    borderRadius: "5px",
                                    background: "#fff",
                                    color: "#333",
                                    fontWeight: 600,
                                    fontSize: isMobile ? "12px" : "15px",
                                    letterSpacing: "0.3px",
                                    textDecoration: "none",
                                    border: "1px solid #ddd",
                                    cursor: "pointer",
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#f8f8f8";
                                    e.currentTarget.style.borderColor = "#bbb";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "#fff";
                                    e.currentTarget.style.borderColor = "#ddd";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                Browse Collection
                            </Link>

                            <Link
                                to="/design-studio"
                                id="hero-cta-design-studio"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                    padding: isMobile ? "8px 14px" : "14px 32px",
                                    borderRadius: "5px",
                                    background: "linear-gradient(135deg, #dc0000, #aa0000)",
                                    color: "#fff",
                                    fontWeight: 700,
                                    fontSize: isMobile ? "12px" : "15px",
                                    letterSpacing: "0.3px",
                                    textDecoration: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    boxShadow: "0 4px 16px rgba(220, 0, 0, 0.25)",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                                    e.currentTarget.style.boxShadow = "0 6px 24px rgba(220, 0, 0, 0.35)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(220, 0, 0, 0.25)";
                                }}
                            >
                                Start Designing
                                <span style={{ fontSize: isMobile ? "12px" : "18px", transition: "transform 0.3s" }}>→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── T-SHIRT SHOWCASE SECTION ─── */}
            <section style={{
                position: "relative",
                padding: "80px 24px 100px",
                background: "#f7f7f8",
                width: "100%",
            }}>
                {/* Section header */}
                <div style={{
                    textAlign: "center",
                    maxWidth: "640px",
                    margin: "0 auto 64px",
                }}>
                    <span style={{
                        display: "inline-block",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "3px",
                        textTransform: "uppercase",
                        color: "#cc0000",
                        marginBottom: "16px",
                    }}>
                        Inspiration Gallery
                    </span>
                    <h2 style={{
                        fontSize: "clamp(28px, 4.5vw, 44px)",
                        fontWeight: 800,
                        letterSpacing: "-1.5px",
                        margin: "0 0 16px",
                        lineHeight: 1.1,
                        color: "#111",
                    }}>
                        Designs That{" "}
                        <span style={{
                            background: "linear-gradient(135deg, #dc0000, #aa0000)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}>
                            Inspire
                        </span>
                    </h2>
                    <p style={{
                        fontSize: "16px",
                        color: "#888",
                        lineHeight: 1.7,
                        margin: 0,
                    }}>
                        Check out what our community has been creating. Get inspired and start designing your own custom tee today.
                    </p>
                </div>

                {/* T-shirt grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "24px",
                    maxWidth: "1100px",
                    margin: "0 auto",
                }}>
                    {tshirts.map((tshirt, index) => (
                        <div
                            key={tshirt.id}
                            ref={(el) => (cardRefs.current[index] = el)}
                            data-index={index}
                            style={{
                                position: "relative",
                                borderRadius: "5px",
                                overflow: "hidden",
                                background: "#fff",
                                border: "1px solid #eee",
                                cursor: "pointer",
                                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                                opacity: visibleCards.has(String(index)) ? 1 : 0,
                                transform: visibleCards.has(String(index))
                                    ? "translateY(0)"
                                    : "translateY(40px)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-6px)";
                                e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)";
                                e.currentTarget.style.borderColor = "rgba(220, 0, 0, 0.15)";
                                e.currentTarget.querySelector(".card-overlay").style.opacity = "1";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.borderColor = "#eee";
                                e.currentTarget.querySelector(".card-overlay").style.opacity = "0";
                            }}
                        >
                            {/* Tag */}
                            <div style={{
                                position: "absolute",
                                top: "12px",
                                left: "12px",
                                zIndex: 3,
                                padding: "6px 12px",
                                borderRadius: "4px",
                                background: "#111",
                                fontSize: "11px",
                                fontWeight: 600,
                                letterSpacing: "1.5px",
                                textTransform: "uppercase",
                                color: "#fff",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            }}>
                                {tshirt.tag}
                            </div>

                            {/* Image */}
                            <div style={{
                                width: "100%",
                                aspectRatio: "4 / 5",
                                overflow: "hidden",
                                background: "#f5f5f5",
                            }}>
                                <img
                                    src={tshirt.image}
                                    alt={tshirt.title}
                                    loading="lazy"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = "scale(1.06)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = "scale(1)";
                                    }}
                                />
                            </div>

                            {/* Hover overlay */}
                            <div
                                className="card-overlay"
                                style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: "32px 20px 20px",
                                    background: "linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 60%, transparent 100%)",
                                    opacity: 0,
                                    transition: "opacity 0.4s ease",
                                    zIndex: 2,
                                }}
                            >
                                <h3 style={{
                                    fontSize: "17px",
                                    fontWeight: 700,
                                    margin: "0 0 8px",
                                    letterSpacing: "-0.3px",
                                    color: "#fff",
                                }}>
                                    {tshirt.title}
                                </h3>
                                <Link
                                    to="/shop"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "#ff6666",
                                        textDecoration: "none",
                                        letterSpacing: "0.3px",
                                    }}
                                >
                                    Shop Now →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA below grid */}
                <div style={{
                    textAlign: "center",
                    marginTop: "56px",
                }}>
                    <Link
                        to="/design-studio"
                        id="showcase-cta-design"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "16px 44px",
                            borderRadius: "5px",
                            background: "linear-gradient(135deg, #dc0000, #aa0000)",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "15px",
                            textDecoration: "none",
                            transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: "0 4px 20px rgba(220, 0, 0, 0.25), 0 2px 8px rgba(0,0,0,0.08)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-3px) scale(1.03)";
                            e.currentTarget.style.boxShadow = "0 8px 30px rgba(220, 0, 0, 0.35), 0 4px 12px rgba(0,0,0,0.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0) scale(1)";
                            e.currentTarget.style.boxShadow = "0 4px 20px rgba(220, 0, 0, 0.25), 0 2px 8px rgba(0,0,0,0.08)";
                        }}
                    >
                        Start Your Design Now
                        <span style={{ fontSize: "18px" }}>→</span>
                    </Link>
                </div>
            </section>

            {/* ─── KEYFRAME ANIMATIONS ─── */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes floatOrb {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -20px) scale(1.1); }
                    66% { transform: translate(-20px, 15px) scale(0.95); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.5); }
                }
                @keyframes scrollDot {
                    0%, 100% { opacity: 0.4; transform: translateX(-50%) translateY(0); }
                    50% { opacity: 1; transform: translateX(-50%) translateY(12px); }
                }
                
                .customize-hero-sticky .scroll-frame-loader {
                    background: #fafafa;
                }
                .customize-hero-sticky .scroll-frame-loader-text {
                    color: #111;
                }
                .customize-hero-sticky .scroll-frame-progress-bar {
                    background: rgba(0,0,0,0.1);
                }
                .customize-hero-sticky .scroll-frame-progress-fill {
                    background: #cc0000;
                }
                .customize-hero-sticky .scroll-frame-spinner {
                    border-top: 3px solid #cc0000;
                }
            `}</style>
        </div>
    );
}

export default Customize;

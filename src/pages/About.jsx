import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import gojoImg from "./customize_image/gojo.jpg";
import narutoImg from "./customize_image/naruto.jpg";
import leviImg from "./customize_image/levi.jpg";

const designs = [
    {
        id: 1,
        title: "Gojo — The Honored One",
        tag: "Jujutsu Kaisen",
        color: "Washed Black",
        desc: "Hand-placed kanji typography with sketch art. Vintage washed cotton, drop-shoulder cut.",
        accent: "#1a1a2e",
        textAccent: "#a78bfa",
        image: gojoImg,
    },
    {
        id: 2,
        title: "Uzumaki Naruto",
        tag: "Naruto",
        color: "Jet Black",
        desc: "Bold character art on premium black cotton. Japanese vertical text detailing on the back.",
        accent: "#1a0a00",
        textAccent: "#fbbf24",
        image: narutoImg,
    },
    {
        id: 3,
        title: "Survey Corps — Levi",
        tag: "Attack on Titan",
        color: "Stone Wash",
        desc: "Vintage stone-washed tee with dramatic red & black ink art. The Wings of Freedom crest.",
        accent: "#1a0a0a",
        textAccent: "#f87171",
        image: leviImg,
    },
];

const stats = [
    { value: "500+", label: "Designs Printed" },
    { value: "98%", label: "Happy Customers" },
    { value: "3–5", label: "Days Delivery" },
    { value: "100%", label: "Premium Cotton" },
];

function AboutCard({ design, index }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(60px)",
                transition: `all 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15}s`,
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: "16px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Image */}
            <div style={{
                height: "280px",
                background: `linear-gradient(135deg, ${design.accent} 0%, #111 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
            }}>
                <img
                    src={design.image}
                    alt={design.title}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        display: "block",
                    }}
                />
                <div style={{
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    background: design.textAccent,
                    color: "#000",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    padding: "5px 12px",
                    borderRadius: "4px",
                }}>
                    {design.tag}
                </div>
                <div style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    fontSize: "12px",
                    color: "#fff",
                    fontWeight: 500,
                    textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                }}>
                    {design.color}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: "28px", flex: 1, display: "flex", flexDirection: "column", gap: "12px", background: "#fff" }}>
                <h3 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#111",
                    margin: 0,
                }}>{design.title}</h3>
                <p style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "14px",
                    color: "#777",
                    lineHeight: 1.6,
                    margin: 0,
                    flex: 1,
                }}>{design.desc}</p>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: design.textAccent,
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    marginTop: "8px",
                    cursor: "pointer",
                    transition: "gap 0.2s",
                }}
                    onMouseEnter={e => e.currentTarget.style.gap = "14px"}
                    onMouseLeave={e => e.currentTarget.style.gap = "8px"}
                >
                    View in Shop
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
            </div>
        </div>
    );
}

const heroWords = ["Streetwear", "Built", "for", "Your", "Vision"];

function About() {
    const heroRef = useRef(null);
    const [heroVisible, setHeroVisible] = useState(false);

    useEffect(() => {
        setHeroVisible(true);
    }, []);

    return (
        <div style={{
            background: "#fff",
            minHeight: "100vh",
            fontFamily: "'Outfit', sans-serif",
        }}>
            {/* ── HERO ── */}
            <section style={{
                position: "relative",
                padding: "120px 24px 100px",
                textAlign: "center",
                overflow: "hidden",
                background: "#000000ee",
                borderBottom: "1px solid #1a1a1a",
            }}>
                {/* Background glow orbs */}
                <div style={{
                    position: "absolute",
                    top: "-100px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "700px",
                    height: "700px",
                    background: "radial-gradient(circle, rgba(204,0,0,0.08) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />

                {/* Animation keyframes */}
                <style>{`
                    @keyframes wordUp {
                        from { opacity: 0; transform: translateY(45px) rotate(2deg); }
                        to { opacity: 1; transform: translateY(0) rotate(0deg); }
                    }
                    @keyframes shimmer {
                        0% { background-position: 0% 50%; }
                        100% { background-position: 200% 50%; }
                    }
                `}</style>

                <div ref={heroRef} style={{
                    position: "relative",
                    zIndex: 1,
                    opacity: heroVisible ? 1 : 0,
                    transition: "opacity 0.5s ease",
                }}>


                    <h1 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "clamp(40px, 5vw, 80px)",
                        fontWeight: 800,
                        color: "#fff",
                        lineHeight: 1.05,
                        margin: "0 0 28px",
                        letterSpacing: "-1px",
                    }}>
                        {heroWords.map((word, i) => {
                            const isVision = word === "Vision";
                            const isYour = word === "Your";
                            const special = isVision || isYour;
                            return (
                                <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", marginRight: "0.28em" }}>
                                    <span
                                        style={{
                                            display: "inline-block",
                                            opacity: heroVisible ? 1 : 0,
                                            animation: heroVisible ? `wordUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + i * 0.12}s both` : "none",
                                            ...(special ? {
                                                background: "linear-gradient(90deg, #dc0000, #ff4444, #ff8888, #dc0000)",
                                                backgroundSize: "300% 100%",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                backgroundClip: "text",
                                                animation: heroVisible
                                                    ? `wordUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + i * 0.12}s both, shimmer 4s linear infinite ${1.2 + i * 0.12}s`
                                                    : "none",
                                            } : {}),
                                        }}
                                    >
                                        {word}
                                    </span>
                                </span>
                            );
                        })}
                    </h1>

                    <p style={{
                        fontSize: "clamp(16px, 2vw, 20px)",
                        color: "#666",
                        maxWidth: "620px",
                        margin: "0 auto 48px",
                        lineHeight: 1.7,
                        fontWeight: 400,
                        opacity: heroVisible ? 1 : 0,
                        transform: heroVisible ? "translateY(0)" : "translateY(25px)",
                        transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.95s",
                    }}>
                        We started DropPrint because we believe your passion deserves to be worn.
                        Every tee is premium drop-shoulder cotton — custom printed, just for you.
                    </p>

                    <Link
                        to="/customize"
                        id="about-cta-customize"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "10px",
                            background: "#cc0000",
                            color: "#fff",
                            padding: "16px 36px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: 700,
                            fontSize: "15px",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                            transition: "opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1) 1.1s, transform 0.3s, box-shadow 0.3s",
                            boxShadow: "0 4px 24px rgba(204,0,0,0.35)",
                            opacity: heroVisible ? 1 : 0,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(204,0,0,0.5)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(204,0,0,0.35)"; }}
                    >
                        Start Designing
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                </div>
            </section>

            {/* ── STATS ── */}
            <section style={{
                borderBottom: "1px solid #f0f0f0",
                borderTop: "1px solid #f0f0f0",
                padding: "60px 24px",
                background: "#f9f9f9",
            }}>
                <div style={{
                    maxWidth: "1100px",
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "1px",
                    background: "#e8e8e8",
                    border: "1px solid #e8e8e8",
                    borderRadius: "16px",
                    overflow: "hidden",
                }}>
                    {stats.map((stat, i) => (
                        <div key={i} style={{
                            background: "#fff",
                            padding: "48px 24px",
                            textAlign: "center",
                        }}>
                            <div style={{
                                fontSize: "clamp(32px, 4vw, 48px)",
                                fontWeight: 800,
                                color: "#cc0000",
                                letterSpacing: "-1px",
                                lineHeight: 1,
                                marginBottom: "8px",
                            }}>{stat.value}</div>
                            <div style={{
                                fontSize: "13px",
                                color: "#888",
                                fontWeight: 500,
                                letterSpacing: "1px",
                                textTransform: "uppercase",
                            }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── DESIGN SHOWCASE ── */}
            <section style={{
                padding: "100px 24px",
                maxWidth: "1200px",
                margin: "0 auto",
            }}>
                <div style={{ textAlign: "center", marginBottom: "72px" }}>
                    <span style={{
                        display: "inline-block",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "4px",
                        textTransform: "uppercase",
                        color: "#cc0000",
                        marginBottom: "20px",
                    }}>Featured Designs</span>
                    <h2 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "clamp(28px, 4vw, 52px)",
                        fontWeight: 800,
                        color: "#111",
                        letterSpacing: "-1.5px",
                        margin: "0 0 16px",
                    }}>Designs We're Proud Of</h2>
                    <p style={{
                        fontSize: "16px",
                        color: "#888",
                        maxWidth: "480px",
                        margin: "0 auto",
                        lineHeight: 1.6,
                    }}>Every design is crafted to tell a story. Here's a glimpse of what we've built.</p>
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "24px",
                }}>
                    {designs.map((design, i) => (
                        <AboutCard key={design.id} design={design} index={i} />
                    ))}
                </div>
            </section>

            {/* ── MISSION ── */}
            <section style={{
                background: "#f9f9f9",
                borderTop: "1px solid #f0f0f0",
                borderBottom: "1px solid #f0f0f0",
                padding: "100px 24px",
            }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center" style={{
                    maxWidth: "1100px",
                    margin: "0 auto",
                }}>
                    <div>
                        <span style={{
                            display: "inline-block",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "4px",
                            textTransform: "uppercase",
                            color: "#cc0000",
                            marginBottom: "20px",
                        }}>Our Mission</span>
                        <h2 style={{
                            fontSize: "clamp(28px, 3.5vw, 48px)",
                            fontWeight: 800,
                            color: "#111",
                            letterSpacing: "-1.5px",
                            margin: "0 0 24px",
                            lineHeight: 1.1,
                        }}>Wear Your{" "}
                            <span style={{
                                background: "linear-gradient(135deg, #dc0000, #ff4444)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}>Identity</span>
                        </h2>
                        <p style={{
                            fontSize: "16px",
                            color: "#888",
                            lineHeight: 1.8,
                            margin: "0 0 16px",
                        }}>
                            Streetwear is more than clothing — it's a statement. We print what you love on
                            heavyweight, oversized drop-shoulder tees that look and feel premium.
                        </p>
                        <p style={{
                            fontSize: "16px",
                            color: "#888",
                            lineHeight: 1.8,
                            margin: 0,
                        }}>
                            From anime art to personal photography, your artwork is screen-printed with
                            professional-grade inks that stay bold wash after wash.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {[
                            { icon: "🧵", title: "Drop-Shoulder Cut", desc: "Oversized premium fit that drapes perfectly" },
                            { icon: "🖨️", title: "DTF Printing", desc: "High-resolution prints that last 100+ washes" },
                            { icon: "📦", title: "Fast Shipping", desc: "3–5 days nationwide delivery guaranteed" },
                            { icon: "✏️", title: "Custom Designs", desc: "Upload any artwork — we handle the rest" },
                        ].map((item, i) => (
                            <div key={i} style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "20px",
                                padding: "20px 24px",
                                background: "#fff",
                                border: "1px solid #eee",
                                borderRadius: "12px",
                                transition: "border-color 0.3s, box-shadow 0.3s",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(204,0,0,0.3)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.boxShadow = "none"; }}
                            >
                                <span style={{ fontSize: "24px", flexShrink: 0 }}>{item.icon}</span>
                                <div>
                                    <div style={{ color: "#111", fontWeight: 600, fontSize: "15px", marginBottom: "4px" }}>{item.title}</div>
                                    <div style={{ color: "#888", fontSize: "13px", lineHeight: 1.5 }}>{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section style={{
                padding: "100px 24px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                background: "#f9f9f9",
                borderTop: "1px solid #f0f0f0",
            }}>
                <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(ellipse at 50% 50%, rgba(204,0,0,0.04) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                    <h2 style={{
                        fontSize: "clamp(28px, 4vw, 56px)",
                        fontWeight: 800,
                        color: "#111",
                        letterSpacing: "-2px",
                        margin: "0 0 20px",
                    }}>Ready to Create Yours?</h2>
                    <p style={{ color: "#888", fontSize: "16px", marginBottom: "40px" }}>
                        Upload your design and get a premium custom tee in days.
                    </p>
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                        <Link to="/customize" id="about-footer-cta" style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "10px",
                            background: "#cc0000",
                            color: "#fff",
                            padding: "16px 36px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: 700,
                            fontSize: "15px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            transition: "all 0.3s",
                            boxShadow: "0 4px 24px rgba(204,0,0,0.25)",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                            Start Designing
                        </Link>
                        <Link to="/shop" id="about-footer-shop" style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "10px",
                            background: "#fff",
                            color: "#111",
                            padding: "16px 36px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: "15px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            border: "1px solid #ddd",
                            transition: "all 0.3s",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#aaa"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#ddd"; }}
                        >
                            Browse Collection
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default About;
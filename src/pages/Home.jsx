import { Link } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";
import ScrollFrameAnimation from "../components/ScrollFrameAnimation";
import "../components/ScrollFrameAnimation.css";

const features = [
    {
        step: "01",
        title: "Pick Your Tee",
        desc: "Select your favorite color, size, and drop-shoulder style.",
    },
    {
        step: "02",
        title: "Create Your Design",
        desc: "Upload your own artwork or add custom text in our studio.",
    },
    {
        step: "03",
        title: "We Print & Ship",
        desc: "We check every tee by hand and ship it right to your door.",
    },
];

const whyPoints = [
    { icon: "🧵", title: "Premium Biowash Cotton", desc: "Soft, breathable fabric that gets better with every wash." },
    { icon: "📐", title: "True Oversized Fit", desc: "Drop-shoulder cut designed for that relaxed, street-ready drape." },
    { icon: "🖨️", title: "Vivid, Lasting Prints", desc: "High-resolution DTF prints that stay bold wash after wash." },
];

function useReveal() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.15 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return [ref, visible];
}

function Home() {
    const [vh, setVh] = useState(() => window.innerHeight);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const updateVh = () => setVh(window.innerHeight);
        const handleResize = () => {
            updateVh();
            setIsMobile(window.innerWidth < 640);
        };
        updateVh();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const particles = useMemo(() => {
        return Array.from({ length: 20 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: `${6 + Math.random() * 8}s`,
            delay: `${Math.random() * 5}s`,
            travel: `${100 + Math.random() * 200}px`,
            drift: `${-30 + Math.random() * 60}px`,
        }));
    }, []);

    const [whyRef, whyVisible] = useReveal();
    const [howRef, howVisible] = useReveal();
    const [ctaRef, ctaVisible] = useReveal();

    // ...rest of your component stays exactly the same

    return (
        <div>
            {/* Hero Section with 3D Scroll Animation */}
            <section className="hero-3d-section"
                style={{ minHeight: `${vh * 3}px` }} >

                {/* Ambient glow effects */}
                <div className="hero-3d-glow-left"></div>
                <div className="hero-3d-glow-right"></div>

                {/* Floating particles */}
                <div className="hero-3d-particles">
                    {particles.map((p) => (
                        <div
                            key={p.id}
                            className="particle"
                            style={{
                                left: p.left,
                                top: p.top,
                                "--duration": p.duration,
                                "--delay": p.delay,
                                "--travel": p.travel,
                                "--drift": p.drift,
                            }}
                        />
                    ))}
                </div>

                {/* Sticky container */}
                <div className="hero-3d-sticky"
                    style={{ height: `${vh}px` }} >
                    {/* FULL-SCREEN canvas behind everything */}
                    {!isMobile && <ScrollFrameAnimation />}

                    {/* LEFT: Text content overlay */}
                    <div className="hero-3d-content" >
                        <h1 className="hero-3d-title" >
                            Your Design.<br />
                            Our <span className="highlight">Drop Shoulder.</span><br />
                            Printed Perfectly.
                        </h1>
                        <p className="hero-3d-subtitle" >
                            Custom printed oversized drop-shoulder tees — designed by you,
                            printed by us. Premium biowash cotton, street-ready style.
                        </p>
                        <div className="hero-3d-cta-group">
                            <Link to="/shop" className="hero-3d-cta-primary">
                                Shop Collection
                                <span className="cta-arrow">→</span>
                            </Link>
                            <Link to="/design-studio" className="hero-3d-cta-secondary">
                                Create Your Design
                                <span className="cta-arrow">→</span>
                            </Link>
                        </div>


                    </div>
                </div>

                {/* Bottom fade */}
                <div className="hero-3d-bottom-fade"></div>
            </section>

            <style>{`
                @keyframes homeFadeUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* ── WHY DROP SHOULDER ── */}
            <section
                ref={whyRef}
                style={{
                    background: "#fff",
                    padding: "110px 24px",
                }}
            >
                <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                    <div style={{
                        textAlign: "center",
                        marginBottom: "64px",
                        opacity: whyVisible ? 1 : 0,
                        transform: whyVisible ? "translateY(0)" : "translateY(30px)",
                        transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}>
                        <span style={{
                            display: "inline-block",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "4px",
                            textTransform: "uppercase",
                            color: "#cc0000",
                            marginBottom: "18px",
                        }}>The Difference</span>
                        <h2 style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: "clamp(28px, 4vw, 48px)",
                            fontWeight: 800,
                            color: "#111",
                            letterSpacing: "-1.5px",
                            margin: "0 0 16px",
                        }}>Why Drop Shoulder?</h2>
                        <p style={{
                            fontSize: "16px",
                            color: "#888",
                            maxWidth: "560px",
                            margin: "0 auto",
                            lineHeight: 1.7,
                        }}>
                            Oversized comfort meets street style — built for everyday wear with a relaxed, effortless fit.
                        </p>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                        gap: "24px",
                    }}>
                        {whyPoints.map((p, i) => (
                            <div
                                key={i}
                                style={{
                                    background: "#fafafa",
                                    border: "1px solid #eee",
                                    borderRadius: "16px",
                                    padding: "32px 28px",
                                    opacity: whyVisible ? 1 : 0,
                                    transform: whyVisible ? "translateY(0)" : "translateY(30px)",
                                    transition: `all 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${0.15 + i * 0.12}s`,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(204,0,0,0.3)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                            >
                                <div style={{
                                    width: "52px",
                                    height: "52px",
                                    borderRadius: "12px",
                                    background: "rgba(204,0,0,0.08)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px",
                                    marginBottom: "20px",
                                }}>{p.icon}</div>
                                <h3 style={{
                                    fontFamily: "'Outfit', sans-serif",
                                    fontSize: "18px",
                                    fontWeight: 700,
                                    color: "#111",
                                    margin: "0 0 10px",
                                }}>{p.title}</h3>
                                <p style={{
                                    fontSize: "14px",
                                    color: "#888",
                                    lineHeight: 1.6,
                                    margin: 0,
                                }}>{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section
                ref={howRef}
                className="py-28 px-6 bg-zinc-50 border-t border-b border-zinc-200/50 relative overflow-hidden"
            >
                {/* Background decorative glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div style={{
                        textAlign: "center",
                        marginBottom: "72px",
                        opacity: howVisible ? 1 : 0,
                        transform: howVisible ? "translateY(0)" : "translateY(30px)",
                        transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}>
                        <span style={{
                            display: "inline-block",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "4px",
                            textTransform: "uppercase",
                            color: "#cc0000",
                            marginBottom: "18px",
                        }}>Simple Process</span>
                        <h2 style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: "clamp(28px, 4vw, 48px)",
                            fontWeight: 800,
                            color: "#111",
                            letterSpacing: "-1.5px",
                            margin: "0 0 16px",
                        }}>How It Works</h2>
                        <p style={{
                            fontSize: "16px",
                            color: "#888",
                            maxWidth: "480px",
                            margin: "0 auto",
                            lineHeight: 1.7,
                        }}>From your screen to your door in three simple steps.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Horizontal connecting line visible on desktop */}
                        <div className="hidden md:block absolute top-[98px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-zinc-200 via-red-200 to-zinc-200 pointer-events-none z-0"></div>

                        {features.map((f, i) => (
                            <div
                                key={i}
                                style={{
                                    background: "#fafafa",
                                    border: "1px solid #eee",
                                    borderRadius: "16px",
                                    padding: "32px 28px",
                                    textAlign: "center",
                                    position: "relative",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    opacity: howVisible ? 1 : 0,
                                    transform: howVisible ? "translateY(0)" : "translateY(30px)",
                                    transition: `all 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${0.15 + i * 0.12}s`,
                                    zIndex: 10,
                                    cursor: "default"
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(204,0,0,0.3)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                            >
                                {/* Step number tag */}
                                <div style={{
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    color: "#cc0000",
                                    background: "rgba(204,0,0,0.05)",
                                    border: "1px solid rgba(204,0,0,0.1)",
                                    borderRadius: "9999px",
                                    padding: "4px 12px",
                                    marginBottom: "16px",
                                    letterSpacing: "1px",
                                    textTransform: "uppercase"
                                }}>
                                    Step {f.step}
                                </div>

                                {/* Custom SVG Icons instead of emojis */}
                                <div style={{
                                    width: "52px",
                                    height: "52px",
                                    borderRadius: "12px",
                                    background: "rgba(204,0,0,0.08)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "20px",
                                    color: "#111"
                                }}>
                                    {i === 0 && (
                                        <svg className="w-6 h-6 stroke-[1.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    )}
                                    {i === 1 && (
                                        <svg className="w-6 h-6 stroke-[1.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    )}
                                    {i === 2 && (
                                        <svg className="w-6 h-6 stroke-[1.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    )}
                                </div>

                                <h3 style={{
                                    fontFamily: "'Outfit', sans-serif",
                                    fontSize: "18px",
                                    fontWeight: 700,
                                    color: "#111",
                                    margin: "0 0 10px",
                                }}>
                                    {f.title}
                                </h3>
                                <p style={{
                                    fontSize: "14px",
                                    color: "#888",
                                    lineHeight: 1.6,
                                    margin: 0,
                                }}>
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section
                ref={ctaRef}
                style={{
                    padding: "100px 24px",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    background: "#fff",
                }}
            >
                <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(ellipse at 50% 50%, rgba(204,0,0,0.05) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "relative",
                    zIndex: 1,
                    opacity: ctaVisible ? 1 : 0,
                    transform: ctaVisible ? "translateY(0)" : "translateY(30px)",
                    transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                }}>
                    <h2 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "clamp(28px, 4vw, 52px)",
                        fontWeight: 800,
                        color: "#111",
                        letterSpacing: "-2px",
                        margin: "0 0 18px",
                    }}>Ready to Make It Yours?</h2>
                    <p style={{ color: "#888", fontSize: "16px", marginBottom: "36px" }}>
                        Start designing your own custom drop-shoulder tee today.
                    </p>
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                        <Link to="/design-studio" style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "10px",
                            background: "linear-gradient(135deg, #dc0000, #aa0000)",
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
                            Create Your Design
                        </Link>
                        <Link to="/shop" style={{
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
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.backgroundColor = "linear-gradient(135deg, #dc0000, #aa0000)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.color = "#111"; }}
                        >
                            Browse Collection
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
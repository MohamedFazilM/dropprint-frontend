import { useRef, useState, useEffect } from "react";

const FAQS = [
    {
        q: "What file formats can I upload?",
        a: "PNG, JPG, and PDF are supported. We recommend high-resolution images (minimum 1000x1000px) for the best print quality.",
    },
    {
        q: "Can I see a preview before it's printed?",
        a: "Yes! The Design Studio shows a live preview of your design on the tee before you add it to cart. Note that actual print color may vary slightly from the screen preview.",
    },
    {
        q: "How long does printing & delivery take?",
        a: "Custom printed orders typically take 3-5 business days for printing, plus standard shipping time depending on your location.",
    },
    {
        q: "What's your return/exchange policy for custom prints?",
        a: "Since each tee is printed specifically for you, we don't accept returns or exchanges unless there's a printing defect or quality issue on our end.",
    },
    {
        q: "Do you offer bulk/group order discounts?",
        a: "Yes, for bulk or group orders (events, college groups, etc.), please reach out to us via the Contact page for special pricing.",
    },
    {
        q: "What printing method do you use?",
        a: "We use DTF (Direct to Film) printing for full-color designs, which offers vibrant colors and durability on cotton fabric.",
    },
];

function useReveal() {
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

    return [ref, visible];
}

function FAQCard({ faq, index }) {
    const [ref, visible] = useReveal();
    const num = String(index + 1).padStart(2, "0");

    return (
        <div
            ref={ref}
            style={{
                padding: "32px 28px",
                borderTop: "2px solid #111",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.6s cubic-bezier(0.4,0,0.2,1) ${index * 0.08}s`,
            }}
        >
            <div style={{
                fontSize: "38px",
                fontWeight: 800,
                color: "#cc0000f3",
                letterSpacing: "-1px",
                marginBottom: "20px",
                fontFamily: "'Outfit', sans-serif",
            }}>{num}.</div>
            <h3 style={{
                fontSize: "17px",
                fontWeight: 700,
                color: "#111",
                margin: "0 0 12px",
                lineHeight: 1.4,
                fontFamily: "'Outfit', sans-serif",
            }}>{faq.q}</h3>
            <p style={{
                fontSize: "13.5px",
                color: "#888",
                lineHeight: 1.7,
                margin: 0,
            }}>{faq.a}</p>
        </div>
    );
}

function FAQ() {
    const [heroVisible, setHeroVisible] = useState(false);

    useEffect(() => {
        setHeroVisible(true);
    }, []);

    const total = String(FAQS.length).padStart(2, "0");
    const heroWords = ["FREQUENTLY", "ASKED", "QUESTIONS"];

    return (
        <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "'Outfit', sans-serif", color: "#111" }}>
            <style>{`
                @keyframes faqScaleUp {
                    from { opacity: 0; transform: scale(0.25); }
                    60% { opacity: 1; }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes faqSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>

            {/* ── TOP BAR ── */}
            <div style={{
                maxWidth: "1100px",
                margin: "0 auto",
                padding: "20px 24px 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <span style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    color: "#666",
                }}>(FAQ)</span>
                <span style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: "1px solid #ddd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#666",
                }}>{total}</span>
            </div>
            <div style={{ borderBottom: "1px solid #eee", maxWidth: "1100px", margin: "16px auto 0" }} />

            {/* ── HERO ── */}
            <section style={{
                maxWidth: "1100px",
                margin: "0 auto",
                padding: "56px 24px 70px",
                display: "flex",
                gap: "40px",
                alignItems: "flex-start",
                flexWrap: "wrap",
            }}>
                <div style={{ flex: "1 1 480px" }}>
                    <h1 style={{
                        fontSize: "clamp(34px, 5.2vw, 58px)",
                        fontWeight: 800,
                        letterSpacing: "-2px",
                        lineHeight: 1.05,
                        margin: 0,
                        textTransform: "uppercase",
                    }}>
                        {heroWords.map((word, i) => (
                            <span key={i} style={{ display: "inline-block", marginRight: "0.28em" }}>
                                <span style={{
                                    display: "inline-block",
                                    transformOrigin: "center",
                                    opacity: heroVisible ? 1 : 0,
                                    animation: heroVisible ? `faqScaleUp 0.8s cubic-bezier(0.16,1,0.3,1) ${0.12 + i * 0.15}s both` : "none",
                                }}>{word}</span>
                            </span>
                        ))}
                    </h1>
                </div>

                <div style={{
                    flex: "1 1 300px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "24px",
                    paddingTop: "10px",
                }}>
                    <div style={{
                        flexShrink: 0,
                        width: "44px",
                        height: "44px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: heroVisible ? 1 : 0,
                        transition: "opacity 0.8s ease 0.7s",
                    }}>
                        <svg width="44" height="44" viewBox="0 0 44 44" style={{ animation: "faqSpin 14s linear infinite" }}>
                            <g stroke="#111" strokeWidth="1.4">
                                <line x1="22" y1="2" x2="22" y2="42" />
                                <line x1="2" y1="22" x2="42" y2="22" />
                                <line x1="7" y1="7" x2="37" y2="37" />
                                <line x1="37" y1="7" x2="7" y2="37" />
                                <line x1="22" y1="9" x2="22" y2="35" transform="rotate(22.5 22 22)" />
                                <line x1="9" y1="22" x2="35" y2="22" transform="rotate(22.5 22 22)" />
                            </g>
                        </svg>
                    </div>
                    <p style={{
                        fontSize: "14px",
                        color: "#777",
                        lineHeight: 1.8,
                        margin: 0,
                        opacity: heroVisible ? 1 : 0,
                        transform: heroVisible ? "translateY(0)" : "translateY(15px)",
                        transition: "all 0.7s cubic-bezier(0.4,0,0.2,1) 0.7s",
                    }}>
                        We understand that choosing the perfect custom tee can come with questions.
                        So we've compiled the answers you need before you design, print, and wear it.
                        Your confidence in every order matters to us, and we're here to make
                        your customization journey simple.
                    </p>
                </div>
            </section>

            {/* ── FAQ GRID ── */}
            <section style={{
                maxWidth: "1100px",
                margin: "0 auto",
                padding: "0 24px 100px",
            }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    borderBottom: "2px solid #111",
                }}>
                    {FAQS.map((faq, i) => (
                        <FAQCard key={i} faq={faq} index={i} />
                    ))}
                </div>

                <div style={{
                    marginTop: "56px",
                    textAlign: "center",
                }}>
                    <p style={{ fontSize: "14px", color: "#888", margin: "0 0 16px" }}>
                        Still have questions?
                    </p>
                    <a href="/contact" style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#cc0000",
                        color: "#fff",
                        padding: "13px 30px",
                        borderRadius: "10px",
                        textDecoration: "none",
                        fontWeight: 700,
                        fontSize: "12.5px",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        transition: "transform 0.3s, background 0.3s",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "#bd0303ff"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "#cc0000"; }}
                    >
                        Contact Us
                    </a>
                </div>
            </section>
        </div>
    );
}

export default FAQ;
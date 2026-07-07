import { useRef, useState, useEffect } from "react";

const contactInfo = [
    { icon: "📍", title: "Studio", desc: "Tiruppur, Tamil Nadu, India" },
    { icon: "✉️", title: "Email", desc: "hello@dropprint.in" },
    { icon: "📞", title: "Phone", desc: "+91 99942 68959" },
    { icon: "⏱️", title: "Response Time", desc: "Usually within 24 hours" },
];

const heroWords = ["Let's", "Start", "a", "Conversation"];

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

function Field({ label, ...props }) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ marginBottom: "20px" }}>
            <label style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                color: "#888",
                marginBottom: "8px",
            }}>{label}</label>
            {props.as === "textarea" ? (
                <textarea
                    {...props}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        width: "100%",
                        padding: "14px 16px",
                        borderRadius: "10px",
                        border: `1.5px solid ${focused ? "#cc0000" : "#e5e5e5"}`,
                        outline: "none",
                        fontSize: "14px",
                        fontFamily: "'Outfit', sans-serif",
                        color: "#111",
                        resize: "vertical",
                        boxSizing: "border-box",
                        transition: "border-color 0.25s, box-shadow 0.25s",
                        boxShadow: focused ? "0 0 0 4px rgba(204,0,0,0.08)" : "none",
                        background: "#fafafa",
                    }}
                />
            ) : (
                <input
                    {...props}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        width: "100%",
                        padding: "14px 16px",
                        borderRadius: "10px",
                        border: `1.5px solid ${focused ? "#cc0000" : "#e5e5e5"}`,
                        outline: "none",
                        fontSize: "14px",
                        fontFamily: "'Outfit', sans-serif",
                        color: "#111",
                        boxSizing: "border-box",
                        transition: "border-color 0.25s, box-shadow 0.25s",
                        boxShadow: focused ? "0 0 0 4px rgba(204,0,0,0.08)" : "none",
                        background: "#fafafa",
                    }}
                />
            )}
        </div>
    );
}

function Contact() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [sent, setSent] = useState(false);
    const [formRef, formVisible] = useReveal();
    const [heroVisible, setHeroVisible] = useState(false);

    useEffect(() => {
        setHeroVisible(true);
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        setForm({ name: "", email: "", message: "" });
        setTimeout(() => setSent(false), 3500);
    };

    return (
        <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "'Outfit', sans-serif" }}>
            <style>{`
                @keyframes contactWordUp {
                    from { opacity: 0; transform: translateY(40px) rotate(2deg); }
                    to { opacity: 1; transform: translateY(0) rotate(0deg); }
                }
                @keyframes contactShimmer {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
            `}</style>

            {/* ── HEADER ── */}
            <section style={{
                position: "relative",
                padding: "100px 24px 80px",
                textAlign: "center",
                overflow: "hidden",
                background: "#080808",
                borderBottom: "1px solid #1a1a1a",
            }}>
                <div style={{
                    position: "absolute",
                    top: "-100px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "600px",
                    height: "600px",
                    background: "radial-gradient(circle, rgba(204,0,0,0.08) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />
                <div style={{ position: "relative", zIndex: 1 }}>

                    <h1 style={{
                        fontSize: "clamp(34px, 5vw, 60px)",
                        fontWeight: 800,
                        color: "#fff",
                        letterSpacing: "-2px",
                        margin: "0 0 18px",
                        lineHeight: 1.1,
                    }}>
                        {heroWords.map((word, i) => {
                            const isHighlight = word === "Conversation";
                            return (
                                <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", marginRight: "0.28em" }}>
                                    <span
                                        style={{
                                            display: "inline-block",
                                            opacity: heroVisible ? 1 : 0,
                                            animation: heroVisible
                                                ? `contactWordUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + i * 0.12}s both${isHighlight ? `, contactShimmer 4s linear infinite ${1.2 + i * 0.12}s` : ""}`
                                                : "none",
                                            ...(isHighlight ? {
                                                background: "linear-gradient(90deg, #dc0000, #ff4444, #ff8888, #dc0000)",
                                                backgroundSize: "300% 100%",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                backgroundClip: "text",
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
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "16px",
                        color: "#888",
                        maxWidth: "480px",
                        margin: "0 auto",
                        lineHeight: 1.7,
                        opacity: heroVisible ? 1 : 0,
                        transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                        transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.85s",
                    }}>
                        Questions, custom orders, or just want to say Hi — we'd love to hear from you.
                    </p>
                </div>
            </section>

            {/* ── CONTACT CONTENT ── */}
            <section style={{ padding: "90px 24px", maxWidth: "1100px", margin: "0 auto" }}>
                <div
                    ref={formRef}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.3fr] gap-0"
                    style={{
                        background: "#fff",
                        border: "1px solid #eee",
                        borderRadius: "10px",
                        overflow: "hidden",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.05)",
                        opacity: formVisible ? 1 : 0,
                        transform: formVisible ? "translateY(0)" : "translateY(40px)",
                        transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                >
                    {/* LEFT: info panel */}
                    <div style={{
                        background: "#000000ff",
                        padding: "48px 36px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "32px",
                    }}>
                        <div>
                            <h2 style={{
                                fontSize: "24px",
                                fontWeight: 800,
                                color: "#fff",
                                margin: "0 0 10px",
                                letterSpacing: "-0.5px",
                            }}>Contact Info</h2>
                            <p style={{ fontSize: "13px", color: "#999", lineHeight: 1.6, margin: 0 }}>
                                Reach out directly or fill the form — either way, we're listening.
                            </p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                            {contactInfo.map((c, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                                    <span style={{
                                        width: "38px",
                                        height: "38px",
                                        borderRadius: "10px",
                                        background: "rgba(204,0,0,0.12)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "16px",
                                        flexShrink: 0,
                                    }}>{c.icon}</span>
                                    <div>
                                        <div style={{ color: "#fff", fontSize: "13px", fontWeight: 600, marginBottom: "2px" }}>{c.title}</div>
                                        <div style={{ color: "#999", fontSize: "13px" }}>{c.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: form */}
                    <div style={{ padding: "48px 40px" }}>
                        <form onSubmit={handleSubmit}>
                            <Field
                                label="Your Name"
                                type="text" name="name" placeholder="John Doe"
                                value={form.name} onChange={handleChange}
                                required
                            />
                            <Field
                                label="Your Email"
                                type="email" name="email" placeholder="john@example.com"
                                value={form.email} onChange={handleChange}
                                required
                            />
                            <Field
                                label="Your Message"
                                as="textarea" name="message" placeholder="Tell us what's on your mind..." rows="5"
                                value={form.message} onChange={handleChange}
                                required
                            />
                            <button
                                type="submit"
                                style={{
                                    width: "100%",
                                    background: sent ? "#16a34a" : "#cc0000",
                                    color: "#fff",
                                    padding: "15px",
                                    borderRadius: "10px",
                                    border: "none",
                                    fontWeight: 700,
                                    fontSize: "14px",
                                    letterSpacing: "0.5px",
                                    textTransform: "uppercase",
                                    cursor: "pointer",
                                    transition: "all 0.3s",
                                    boxShadow: sent ? "0 4px 20px rgba(22,163,74,0.3)" : "0 4px 20px rgba(204,0,0,0.3)",
                                }}
                                onMouseEnter={e => { if (!sent) e.currentTarget.style.transform = "translateY(-2px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                            >
                                {sent ? "Message Sent ✓" : "Send Message"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Contact;
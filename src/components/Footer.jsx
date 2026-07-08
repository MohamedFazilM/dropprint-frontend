import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer style={{
            background: "#050505",
            color: "#888",
            fontFamily: "'Outfit', sans-serif",
            padding: "80px 24px 40px",
            borderTop: "1px solid #1a1a1a",
            marginTop: "auto"
        }}>
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "64px",
                marginBottom: "64px"
            }}>
                {/* Brand Section */}
                <div style={{ gridColumn: "1 / -1", '@media (min-width: 768px)': { gridColumn: "span 2" } }}>
                    <Link to="/" style={{ textDecoration: "none" }}>
                        <div style={{ lineHeight: 1, fontFamily: "'Impact', 'Arial Black', sans-serif", display: "inline-block" }}>
                            <div style={{ display: "flex", gap: "4px", alignItems: "baseline" }}>
                                <span style={{ fontSize: "28px", fontWeight: 400, fontStyle: "italic", color: "#fff", letterSpacing: "-1px" }}>
                                    DR<span style={{ color: "#cc0000" }}>O</span>P
                                </span>
                                <span style={{ fontSize: "28px", fontWeight: 300, fontStyle: "italic", color: "#fff", letterSpacing: "-1px" }}>
                                    PRIN<span style={{ color: "#cc0000" }}>T</span>
                                </span>
                            </div>
                            <div style={{ textAlign: "center", fontSize: "10px", fontWeight: 400, letterSpacing: "5px", color: "#666", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                                <span style={{ flex: 1, height: "1px", background: "#333", display: "inline-block" }}></span>
                                CLOTHING
                                <span style={{ flex: 1, height: "1px", background: "#333", display: "inline-block" }}></span>
                            </div>
                        </div>
                    </Link>
                    <p style={{ marginTop: "24px", fontSize: "14px", lineHeight: 1.6, color: "#666", maxWidth: "320px" }}>
                        Premium drop-shoulder tees tailored for your unique expression. Designed by you, crafted by us with unmatched quality.
                    </p>
                </div>

                {/* Links */}
                <div>
                    <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "24px" }}>
                        Explore
                    </h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[
                            { label: "Shop", to: "/shop" },
                            { label: "Customize", to: "/customize" },
                            { label: "About Us", to: "/about" }
                        ].map((link, i) => (
                            <li key={i}>
                                <Link to={link.to} style={{ color: "#888", textDecoration: "none", fontSize: "14px", transition: "color 0.3s" }} onMouseEnter={(e) => e.target.style.color = "#fff"} onMouseLeave={(e) => e.target.style.color = "#888"}>
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "24px" }}>
                        Support
                    </h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[
                            { label: "Contact", to: "/contact" },
                            { label: "Track Order", to: "/track-order" },
                            { label: "FAQ", to: "/faq" }
                        ].map((link, i) => (
                            <li key={i}>
                                <Link to={link.to} style={{ color: "#888", textDecoration: "none", fontSize: "14px", transition: "color 0.3s" }} onMouseEnter={(e) => e.target.style.color = "#fff"} onMouseLeave={(e) => e.target.style.color = "#888"}>
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "24px" }}>
                        Connect
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                        <a href="mailto:support@dropprint.com" style={{ color: "#888", textDecoration: "none", transition: "color 0.3s" }} onMouseEnter={(e) => e.target.style.color = "#fff"} onMouseLeave={(e) => e.target.style.color = "#888"}>support@dropprint.com</a>
                        <span style={{ color: "#888" }}>+91 99942 68999</span>

                        {/* Social Icons */}
                        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                            {/* Facebook */}
                            <a href="#" aria-label="Facebook" style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#111", border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.3s", textDecoration: "none" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#1877F2"; e.currentTarget.style.borderColor = "#1877F2"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#111"; e.currentTarget.style.borderColor = "#222"; }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                            </a>
                            {/* X / Twitter */}
                            <a href="#" aria-label="X" style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#111", border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.3s", textDecoration: "none" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#000"; e.currentTarget.style.borderColor = "#fff"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#111"; e.currentTarget.style.borderColor = "#222"; }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                            {/* Instagram */}
                            <a href="#" aria-label="Instagram" style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#111", border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.3s", textDecoration: "none" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#E1306C"; e.currentTarget.style.borderColor = "#E1306C"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#111"; e.currentTarget.style.borderColor = "#222"; }}>
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none" /></svg>
                            </a>
                            {/* WhatsApp */}
                            <a href="#" aria-label="WhatsApp" style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#111", border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.3s", textDecoration: "none" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#25D366"; e.currentTarget.style.borderColor = "#25D366"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#111"; e.currentTarget.style.borderColor = "#222"; }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M20.52 3.48A11.82 11.82 0 0 0 12.04 0C5.41 0 .04 5.37.04 12c0 2.12.55 4.19 1.61 6.02L0 24l6.15-1.61A11.96 11.96 0 0 0 12.04 24C18.67 24 24 18.63 24 12c0-3.19-1.24-6.19-3.48-8.52zM12.04 21.82c-1.82 0-3.6-.49-5.16-1.41l-.37-.22-3.65.96.98-3.56-.24-.37A9.73 9.73 0 0 1 2.22 12c0-5.42 4.4-9.82 9.82-9.82 2.62 0 5.08 1.02 6.93 2.87A9.74 9.74 0 0 1 21.82 12c0 5.42-4.4 9.82-9.78 9.82zm5.39-7.36c-.29-.14-1.71-.84-1.98-.94-.26-.1-.45-.14-.64.14-.19.29-.74.94-.9 1.13-.17.19-.33.22-.62.07-.29-.14-1.2-.44-2.29-1.41-.85-.75-1.42-1.68-1.59-1.96-.17-.29-.02-.44.13-.58.13-.13.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.55-.88-2.12-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.29-1 1-.97 2.43.02 1.43 1.03 2.81 1.17 3 .14.19 2.02 3.09 4.9 4.33.69.3 1.23.48 1.65.62.69.22 1.31.19 1.8.12.55-.08 1.71-.7 1.95-1.37.24-.67.24-1.24.17-1.37-.07-.12-.26-.19-.55-.33z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{
                borderTop: "1px solid #1a1a1a",
                paddingTop: "32px",
                display: "flex",
                flexWrap: "wrap",
                gap: "24px",
                justifyContent: "space-between",
                alignItems: "center",
                maxWidth: "1200px",
                margin: "0 auto",
                fontSize: "13px",
                color: "#555"
            }}>
                <p style={{ margin: 0 }}>© {new Date().getFullYear()} DropPrint Clothing. All rights reserved.</p>
                <div style={{ display: "flex", gap: "32px" }}>
                    <Link to="/privacy" style={{ color: "#666", textDecoration: "none", transition: "color 0.3s" }} onMouseEnter={(e) => e.target.style.color = "#aaa"} onMouseLeave={(e) => e.target.style.color = "#666"}>Privacy Policy</Link>
                    <Link to="/terms" style={{ color: "#666", textDecoration: "none", transition: "color 0.3s" }} onMouseEnter={(e) => e.target.style.color = "#aaa"} onMouseLeave={(e) => e.target.style.color = "#666"}>Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
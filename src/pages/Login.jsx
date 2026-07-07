import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import shopHero from "./shop_images/shop.png";

function Login() {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/";

    // Track responsive screen width
    useEffect(() => {
        const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Reset all form inputs and message states when switching login/signup mode
    useEffect(() => {
        setEmail("");
        setPassword("");
        setName("");
        setPhone("");
        setAddress("");
        setError(null);
        setSuccessMsg(null);
    }, [isLoginMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            setError("Supabase configuration environment variables are missing.");
            setLoading(false);
            return;
        }

        try {
            if (isLoginMode) {
                // 1. Authenticate using Supabase Auth REST Endpoint
                console.log("[Login] Authenticating user with Supabase Auth...");
                const supabaseLoginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
                    method: "POST",
                    headers: {
                        "apikey": supabaseAnonKey,
                        "Authorization": `Bearer ${supabaseAnonKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });

                if (!supabaseLoginRes.ok) {
                    const errorData = await supabaseLoginRes.json();
                    throw new Error(errorData.error_description || errorData.msg || "Invalid email or password.");
                }

                const supabaseLoginData = await supabaseLoginRes.json();
                const metadata = supabaseLoginData.user?.user_metadata || {};
                console.log("[Login] Supabase Auth successful.");

                // 2. Fetch or sync profile in our local backend database
                let localCustomerData;
                try {
                    const dbRes = await axiosClient.post("/customers/login", { email, password });
                    localCustomerData = dbRes.data;
                } catch (dbErr) {
                    if (dbErr.response?.status === 404) {
                        // User exists in Supabase but not in PostgreSQL database: sync profile
                        console.log("[Login] Customer profile missing in local DB. Syncing now...");
                        const syncRes = await axiosClient.post("/customers/signup", {
                            name: metadata.name || email.split("@")[0],
                            email,
                            phone: metadata.phone || "",
                            address: metadata.address || "",
                            password
                        });
                        localCustomerData = syncRes.data;
                    } else {
                        throw dbErr;
                    }
                }

                // 3. Store customer user session and navigate
                localStorage.setItem("customerUser", JSON.stringify(localCustomerData));
                window.dispatchEvent(new Event("customerLoginUpdate"));
                setSuccessMsg("Welcome back, " + localCustomerData.name + "!");
                setTimeout(() => {
                    navigate(redirectTo);
                }, 1000);
            } else {
                // 1. Register account using Supabase Auth REST Endpoint
                console.log("[Login] Registering user in Supabase Auth...");
                const supabaseSignupRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
                    method: "POST",
                    headers: {
                        "apikey": supabaseAnonKey,
                        "Authorization": `Bearer ${supabaseAnonKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        data: { name, phone, address }
                    })
                });

                if (!supabaseSignupRes.ok) {
                    const errorData = await supabaseSignupRes.json();
                    throw new Error(errorData.msg || errorData.error_description || "Supabase signup failed.");
                }

                const supabaseSignupData = await supabaseSignupRes.json();
                console.log("[Login] Supabase Auth signup successful. Syncing profile to local DB...");

                // 2. Sync profile in our local backend database
                const response = await axiosClient.post("/customers/signup", {
                    name,
                    email,
                    phone,
                    address,
                    password
                });

                const isConfirmed = supabaseSignupData.user?.confirmed_at || supabaseSignupData.session;

                if (!isConfirmed) {
                    setSuccessMsg("Registration successful! A verification email has been sent to " + email + ". Please click the verification link in your email to activate your account before logging in.");
                    // Reset inputs
                    setName("");
                    setEmail("");
                    setPassword("");
                    setPhone("");
                    setAddress("");
                    setIsLoginMode(true); // Switch to login form
                } else {
                    // 3. Store customer user session and navigate if auto-confirmed
                    localStorage.setItem("customerUser", JSON.stringify(response.data));
                    window.dispatchEvent(new Event("customerLoginUpdate"));
                    setSuccessMsg("Registration successful! Welcome, " + response.data.name + "!");
                    setTimeout(() => {
                        navigate(redirectTo);
                    }, 1200);
                }
            }
        } catch (err) {
            console.error("Auth error:", err);
            const msg = err.message || "";
            if (msg.toLowerCase().includes("email not confirmed")) {
                setError("Email not confirmed. Please check your inbox for verification link OR disable 'Confirm email' in your Supabase Auth dashboard (Authentication -> Sign In / Providers -> Email).");
            } else if (msg.toLowerCase().includes("rate limit exceeded")) {
                setError("Email rate limit exceeded. Please wait a few minutes before trying again OR disable 'Confirm email' in your Supabase Auth dashboard (Authentication -> Sign In / Providers -> Email) to bypass verification email limits.");
            } else {
                setError(msg || "An error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            fontFamily: "'Outfit', sans-serif",
            minHeight: "calc(100vh - 68px)",
            display: "flex",
            background: "#fff",
        }}>
            {/* Left Column: Hero Showcase Image (Visible on Large Screens) */}
            {isLargeScreen && (
                <div style={{
                    flex: "0 0 55%",
                    position: "relative",
                    backgroundImage: `url(${shopHero})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: "calc(100vh - 68px)",
                }}>
                    {/* Dark gradient overlay for text legibility */}
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 60%, rgba(0, 0, 0, 0.2) 100%)",
                        zIndex: 1
                    }} />

                    {/* Hero Info Card */}
                    <div style={{
                        position: "absolute",
                        bottom: "60px",
                        left: "60px",
                        right: "60px",
                        color: "#fff",
                        zIndex: 2,
                    }}>
                        <div style={{
                            display: "inline-block",
                            background: "#cc0000",
                            color: "#fff",
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            marginBottom: "16px",
                            boxShadow: "0 4px 12px rgba(204,0,0,0.3)"
                        }}>
                            DropPrint Design Studio
                        </div>
                        <h1 style={{
                            fontSize: "44px",
                            fontWeight: 900,
                            lineHeight: "1.15",
                            letterSpacing: "-0.5px",
                            margin: "0 0 16px 0",
                            textTransform: "uppercase",
                        }}>
                            Create Your Own <span style={{ color: "#cc0000" }}>Custom</span> Masterpiece
                        </h1>
                        <p style={{
                            fontSize: "14px",
                            color: "rgba(255,255,255,0.85)",
                            fontWeight: 500,
                            lineHeight: "1.6",
                            margin: 0,
                            maxWidth: "500px"
                        }}>
                            Upload your stickers, customize print boundaries on front/back sides, and preview details in 3D. We produce and ship premium biowash oversized tees straight to you.
                        </p>
                    </div>
                </div>
            )}

            {/* Right Column: Minimalist Authentication Card */}
            <div style={{
                flex: isLargeScreen ? "0 0 45%" : "1 1 100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: isLargeScreen ? "40px 60px" : "40px 24px",
                height: isLargeScreen ? "calc(100vh - 68px)" : "auto",
                overflowY: "auto",
                background: "#fff"
            }}>
                <div style={{
                    width: "100%",
                    maxWidth: "400px",
                }}>
                    {/* Header Details */}
                    <div style={{ marginBottom: "32px" }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: "30px",
                            fontWeight: 900,
                            color: "#111",
                            letterSpacing: "-0.7px"
                        }}>
                            {isLoginMode ? "Welcome back" : "Create account"}
                        </h2>
                        <p style={{
                            margin: "8px 0 0 0",
                            fontSize: "14px",
                            color: "#71717a",
                            fontWeight: 500
                        }}>
                            {isLoginMode ? "Enter your email and password to sign in" : "Register to start customization & checkout"}
                        </p>
                    </div>

                    {/* Authentication Form */}
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* Status Alerts */}
                        {error && (
                            <div style={{
                                background: "#fdf2f2",
                                border: "1px solid #fbd5d5",
                                color: "#9b1c1c",
                                padding: "12px 16px",
                                borderRadius: "12px",
                                fontSize: "13px",
                                fontWeight: 600,
                                lineHeight: "1.45"
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {successMsg && (
                            <div style={{
                                background: "#f3faf7",
                                border: "1px solid #def7ec",
                                color: "#03543f",
                                padding: "12px 16px",
                                borderRadius: "12px",
                                fontSize: "13px",
                                fontWeight: 600,
                                lineHeight: "1.45"
                            }}>
                                ✅ {successMsg}
                            </div>
                        )}

                        {/* Fields */}
                        {!isLoginMode && (
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Lionel Messi"
                                    className="login-input"
                                />
                            </div>
                        )}

                        <div>
                            <label style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Messi@example.com"
                                className="login-input"
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="login-input"
                            />
                        </div>

                        {!isLoginMode && (
                            <>
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+91 XXXXX XXXXX"
                                        className="login-input"
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>Delivery Address</label>
                                    <textarea
                                        required
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Enter complete shipping address"
                                        rows="3"
                                        className="login-input"
                                        style={{ resize: "none" }}
                                    />
                                </div>
                            </>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="login-btn"
                        >
                            {loading ? "Processing..." : (isLoginMode ? "Login" : "Sign Up")}
                        </button>

                        {/* Toggle login modes */}
                        <div style={{ textAlign: "center", marginTop: "14px" }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLoginMode(!isLoginMode);
                                }}
                                className="login-toggle"
                            >
                                {isLoginMode ? "Don't have an account? Sign Up" : "Already have a profile? Login"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Global style classes for focus/hover states */}
            <style>{`
                .login-input {
                    width: 100%;
                    padding: 12px 16px;
                    font-size: 14px;
                    border-radius: 12px;
                    border: 1.5px solid #e4e4e7;
                    outline: none;
                    transition: all 0.2s ease;
                    font-family: 'Outfit', sans-serif;
                }
                .login-input:focus {
                    border-color: #cc0000;
                    box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.12);
                }
                .login-btn {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #cc0000 0%, #a30000 100%);
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(204,0,0,0.18);
                    margin-top: 10px;
                    transition: all 0.2s ease;
                    font-family: 'Outfit', sans-serif;
                }
                .login-btn:hover {
                    background: linear-gradient(135deg, #e60000 0%, #b30000 100%);
                    box-shadow: 0 6px 18px rgba(204,0,0,0.28);
                    transform: translateY(-1px);
                }
                .login-btn:active {
                    transform: translateY(0);
                }
                .login-btn:disabled {
                    background: #d4d4d8;
                    color: #a1a1aa;
                    cursor: not-allowed;
                    box-shadow: none;
                    transform: none;
                }
                .login-toggle {
                    background: none;
                    border: none;
                    font-size: 13px;
                    color: #cc0000;
                    font-weight: 700;
                    cursor: pointer;
                    transition: color 0.2s ease;
                    font-family: 'Outfit', sans-serif;
                    text-decoration: underline;
                }
                .login-toggle:hover {
                    color: #990000;
                }
            `}</style>
        </div>
    );
}

export default Login;

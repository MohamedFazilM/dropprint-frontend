import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            setError("Supabase configuration environment variables are missing.");
            setLoading(false);
            return;
        }

        try {
            // 1. Authenticate with Supabase Auth REST API
            console.log("[AdminLogin] Authenticating admin via Supabase Auth...");
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
            const token = supabaseLoginData.access_token;
            console.log("[AdminLogin] Supabase Auth successful.");

            // 2. Temporarily set token in localStorage for verification check
            localStorage.setItem("supabaseAccessToken", token);

            // 3. Make test query to backend admin API to confirm privileges
            try {
                await axiosClient.get("/admin/orders");
                // If it succeeds, they are a valid admin!
                localStorage.setItem("isAdmin", "true");
                navigate("/admin");
            } catch (authErr) {
                console.error("[AdminLogin] Backend verification failed:", authErr);
                // Clear credentials
                localStorage.removeItem("supabaseAccessToken");
                localStorage.removeItem("isAdmin");
                
                if (authErr.response && authErr.response.status === 403) {
                    setError("Access Denied: You do not have administrator privileges.");
                } else {
                    setError("Access Denied: Authentication failed.");
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to sign in. Please verify your email and password.");
            localStorage.removeItem("supabaseAccessToken");
            localStorage.removeItem("isAdmin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "'Outfit', sans-serif" }} className="flex items-center justify-center min-h-screen bg-zinc-50 relative overflow-hidden">
            {/* Background grid details */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#cc0000_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#cc0000]/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="bg-white p-8 md:p-10 rounded-3xl border border-zinc-200/50 w-full max-w-sm shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative z-10">
                <div className="text-center mb-8">
                    <span style={{
                        display: "inline-block",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "4px",
                        textTransform: "uppercase",
                        color: "#cc0000",
                        marginBottom: "8px",
                    }}>DROPPRINT HUB</span>
                    <h1 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "28px",
                        fontWeight: 800,
                        color: "#111",
                        letterSpacing: "-1.5px",
                        margin: "0 0 8px",
                    }}>Admin Console</h1>
                    <p style={{
                        fontSize: "13px",
                        color: "#888",
                        margin: 0,
                    }}>Enter your admin credentials to access settings.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Email Address</label>
                        <input
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950 font-bold transition-colors"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Access Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950 font-bold transition-colors"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-xl flex items-center gap-1.5 animate-pulse">
                            <span>⚠</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.99] cursor-pointer shadow-md shadow-zinc-950/10 disabled:opacity-50"
                    >
                        {loading ? "Authenticating..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
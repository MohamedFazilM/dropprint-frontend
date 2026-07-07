import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_PASSWORD = "admin123";

function AdminLogin() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            localStorage.setItem("isAdmin", "true");
            navigate("/admin");
        } else {
            setError("Incorrect admin password. Please try again.");
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
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Access Key</label>
                        <input
                            type="password"
                            placeholder="Enter password"
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
                        className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.99] cursor-pointer shadow-md shadow-zinc-950/10"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
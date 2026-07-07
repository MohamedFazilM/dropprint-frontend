import { Link, useNavigate, useLocation } from "react-router-dom";

function AdminNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("isAdmin");
        navigate("/admin/login");
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav style={{ fontFamily: "'Outfit', sans-serif" }} className="flex items-center justify-between px-8 py-4.5 bg-zinc-950 text-white border-b border-zinc-800 relative z-30">
            <div className="flex items-center gap-2">
                <span style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 900,
                    fontSize: "15px",
                    letterSpacing: "2px",
                    textTransform: "uppercase"
                }}>
                    DropPrint<span className="text-[#cc0000]"> Admin</span>
                </span>
            </div>
            <div className="flex items-center gap-6 text-xs uppercase font-extrabold tracking-wider">
                <Link
                    to="/admin"
                    className={`transition-colors duration-200 ${isActive("/admin") ? "text-[#cc0000]" : "text-zinc-400 hover:text-white"}`}
                >
                    Dashboard
                </Link>
                <Link
                    to="/admin/orders"
                    className={`transition-colors duration-200 ${isActive("/admin/orders") ? "text-[#cc0000]" : "text-zinc-400 hover:text-white"}`}
                >
                    Orders
                </Link>
                <Link
                    to="/admin/products"
                    className={`transition-colors duration-200 ${isActive("/admin/products") ? "text-[#cc0000]" : "text-zinc-400 hover:text-white"}`}
                >
                    Products
                </Link>
                <Link
                    to="/admin/ledger"
                    className={`transition-colors duration-200 ${isActive("/admin/ledger") ? "text-[#cc0000]" : "text-zinc-400 hover:text-white"}`}
                >
                    Ledger
                </Link>
                <button
                    onClick={handleLogout}
                    className="text-zinc-400 hover:text-red-500 transition-colors duration-200 cursor-pointer"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default AdminNavbar;
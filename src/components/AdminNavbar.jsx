import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function AdminNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("isAdmin");
        navigate("/admin/login");
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav style={{ fontFamily: "'Outfit', sans-serif" }} className="bg-zinc-950 text-white border-b border-zinc-800 relative z-30">
            <div className="flex items-center justify-between px-4 sm:px-8 py-4.5">
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

                {/* Hamburger Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden text-zinc-400 hover:text-white focus:outline-none transition-colors p-1 cursor-pointer"
                    aria-label="Toggle Navigation"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                {/* Desktop Nav Items */}
                <div className="hidden md:flex items-center gap-6 text-xs uppercase font-extrabold tracking-wider">
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
            </div>

            {/* Mobile Dropdown Menu */}
            {isOpen && (
                <div className="md:hidden px-4 pb-4.5 flex flex-col gap-4 text-xs uppercase font-extrabold tracking-wider border-t border-zinc-900 pt-4 bg-zinc-950 animate-fade-in">
                    <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className={`transition-colors duration-200 py-1 ${isActive("/admin") ? "text-[#cc0000]" : "text-zinc-400 hover:text-white"}`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/admin/orders"
                        onClick={() => setIsOpen(false)}
                        className={`transition-colors duration-200 py-1 ${isActive("/admin/orders") ? "text-[#cc0000]" : "text-zinc-400 hover:text-white"}`}
                    >
                        Orders
                    </Link>
                    <Link
                        to="/admin/products"
                        onClick={() => setIsOpen(false)}
                        className={`transition-colors duration-200 py-1 ${isActive("/admin/products") ? "text-[#cc0000]" : "text-zinc-400 hover:text-white"}`}
                    >
                        Products
                    </Link>
                    <Link
                        to="/admin/ledger"
                        onClick={() => setIsOpen(false)}
                        className={`transition-colors duration-200 py-1 ${isActive("/admin/ledger") ? "text-[#cc0000]" : "text-zinc-400 hover:text-white"}`}
                    >
                        Ledger
                    </Link>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            handleLogout();
                        }}
                        className="text-left text-zinc-400 hover:text-red-500 transition-colors duration-200 cursor-pointer py-1"
                    >
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}

export default AdminNavbar;
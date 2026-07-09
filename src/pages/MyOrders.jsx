import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function MyOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem("supabaseAccessToken");
            const user = localStorage.getItem("customerUser");
            if (!token || !user) {
                navigate("/login?redirect=/my-orders");
                return;
            }

            try {
                const res = await axiosClient.get("/orders/my-orders");
                setOrders(res.data);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError(err.response?.data?.error || "Failed to load orders. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    // Real-time search filter by product name or order ID
    const filteredOrders = useMemo(() => {
        if (!searchQuery.trim()) return orders;
        const query = searchQuery.toLowerCase().trim();
        return orders.filter((order) => {
            const matchesId = order.id.toLowerCase().includes(query);
            const matchesProduct = order.items?.some((item) =>
                item.product.name.toLowerCase().includes(query)
            );
            return matchesId || matchesProduct;
        });
    }, [orders, searchQuery]);

    const getStatusDotColor = (status) => {
        switch (status?.toLowerCase()) {
            case "placed":
                return "bg-[#2874f0]"; // Flipkart blue
            case "shipped":
                return "bg-[#ff9f00]"; // Flipkart orange
            case "delivered":
                return "bg-[#388e3c]"; // Flipkart green
            case "cancelled":
                return "bg-[#ff6161]"; // Red
            default:
                return "bg-zinc-400";
        }
    };

    const getStatusText = (status, dateStr) => {
        const formattedDate = new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
        switch (status?.toLowerCase()) {
            case "placed":
                return `Ordered on ${formattedDate}`;
            case "shipped":
                return "Shipped - On the Way";
            case "delivered":
                return `Delivered on ${formattedDate}`;
            case "cancelled":
                return "Cancelled";
            default:
                return status || "Placed";
        }
    };

    const getStatusDescription = (status) => {
        switch (status?.toLowerCase()) {
            case "placed":
                return "Your order has been placed and is being prepared.";
            case "shipped":
                return "Your item has been dispatched and is on the way.";
            case "delivered":
                return "Your item has been delivered.";
            case "cancelled":
                return "This order was cancelled.";
            default:
                return "";
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f1f3f6]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <div className="w-10 h-10 border-4 border-[#2874f0] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4">Loading your orders...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f1f3f6] px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <span className="text-3xl mb-2">⚠️</span>
                <h2 className="text-xl font-extrabold text-gray-900 mb-2">Something went wrong</h2>
                <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">{error}</p>
                <button onClick={() => window.location.reload()} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f1f3f6] pb-24 pt-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                
                {/* Search Bar & Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Orders</h1>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">Manage and track your customized clothes</p>
                    </div>
                    
                    {/* Real-time search bar */}
                    <div className="w-full md:w-80 relative">
                        <input
                            type="text"
                            placeholder="Search your orders here..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2.5 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-[#2874f0] focus:ring-0 transition-colors shadow-sm"
                        />
                        <span className="absolute left-3.5 top-3.5 text-gray-400 text-sm">🔍</span>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3.5 top-3.5 text-xs text-gray-400 hover:text-gray-600 font-extrabold"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center shadow-sm">
                        <div className="w-24 h-24 text-gray-200 mb-6">
                            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-950 mb-2">No matching orders</h2>
                        <p className="text-sm text-gray-400 text-center max-w-xs mb-6">
                            {searchQuery ? "We couldn't find any orders matching your search." : "You haven't placed any orders yet."}
                        </p>
                        <Link to="/design-studio" className="bg-[#cc0000] text-white px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider hover:bg-[#b30000] transition-colors">
                            Design a T-Shirt
                        </Link>
                    </div>
                ) : (
                    /* Orders Flat Cards List */
                    <div className="space-y-4">
                        {filteredOrders.map((order) => 
                            order.items?.map((item) => {
                                const hasFront = !!item.design?.front?.fileUrl || (item.design?.printArea !== "Back" && !!item.design?.fileUrl);
                                const hasBack = !!item.design?.back?.fileUrl || (item.design?.printArea === "Back" && !!item.design?.fileUrl);
                                const frontUrl = item.design?.front?.fileUrl || (item.design?.printArea !== "Back" ? item.design?.fileUrl : null);
                                const backUrl = item.design?.back?.fileUrl || (item.design?.printArea === "Back" ? item.design?.fileUrl : null);

                                const showBack = hasBack && !hasFront;
                                const shirtImage = showBack && item.product.imageBack
                                    ? item.product.imageBack
                                    : (item.product.imageMain || "https://placehold.co/400x500/f3f4f6/9ca3af?text=No+Image");

                                return (
                                    <div 
                                        key={item.id} 
                                        className="bg-white border border-gray-200/80 rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                                        onClick={() => navigate(`/track-order?orderId=${order.id}&phone=${order.customer?.phone || ""}`)}
                                    >
                                        
                                        {/* Left: Product Image & Details */}
                                        <div className="flex gap-4 items-center flex-1 w-full">
                                            
                                            {/* Thumbnail Image Stack */}
                                            <div className="relative w-16 h-20 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex items-center justify-center p-1.5 flex-shrink-0">
                                                <img
                                                    src={shirtImage}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => { e.target.src = "https://placehold.co/400x500/f3f4f6/9ca3af?text=No+Image"; }}
                                                />
                                                {showBack ? (
                                                    backUrl && (
                                                        <div className="absolute inset-0 flex items-center justify-center p-2">
                                                            <img src={backUrl} className="w-[45%] h-[45%] object-contain mt-0.5" />
                                                        </div>
                                                    )
                                                ) : (
                                                    frontUrl && (
                                                        <div className="absolute inset-0 flex items-center justify-center p-2">
                                                            <img src={frontUrl} className="w-[45%] h-[45%] object-contain mt-0.5" />
                                                        </div>
                                                    )
                                                )}
                                                {item.design && (
                                                    <span className="absolute bottom-0.5 left-0.5 text-[6px] bg-zinc-950 text-white font-extrabold px-1 py-0.2 rounded uppercase">
                                                        Custom
                                                    </span>
                                                )}
                                            </div>

                                            {/* Description text */}
                                            <div className="space-y-1">
                                                <h4 className="font-extrabold text-gray-900 text-sm md:text-base line-clamp-1 hover:text-[#2874f0] transition-colors">
                                                    {item.product.name}
                                                </h4>
                                                <div className="flex gap-2 flex-wrap items-center text-[11px] font-bold text-gray-400">
                                                    <span className="uppercase">{item.product.color}</span>
                                                    <span>•</span>
                                                    <span>Size: {item.size}</span>
                                                    <span>•</span>
                                                    <span>Qty: {item.qty}</span>
                                                </div>
                                                <p className="text-sm font-extrabold text-gray-950 mt-1 md:hidden">
                                                    ₹{item.price * item.qty}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Middle: Price (for desktop view) */}
                                        <div className="hidden md:block w-32 flex-shrink-0 text-left">
                                            <p className="font-extrabold text-gray-950 text-base">
                                                ₹{item.price * item.qty}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                                ₹{item.price} each
                                            </p>
                                        </div>

                                        {/* Right: Status Tracker Indicator */}
                                        <div className="flex flex-col items-start md:items-end gap-1 w-full md:w-64 flex-shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(order.status)}`}></span>
                                                <span className="font-extrabold text-sm text-gray-800">
                                                    {getStatusText(order.status, order.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 font-semibold md:text-right">
                                                {getStatusDescription(order.status)}
                                            </p>
                                            <div className="flex items-center gap-3 mt-3 w-full md:justify-end text-[10px] font-bold text-gray-400">
                                                <span>ID: #{order.id}</span>
                                                <span>•</span>
                                                <Link 
                                                    to={`/track-order?orderId=${order.id}&phone=${order.customer?.phone || ""}`}
                                                    className="text-[#2874f0] hover:underline flex items-center gap-0.5"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Track Order ➜
                                                </Link>
                                            </div>
                                        </div>

                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyOrders;

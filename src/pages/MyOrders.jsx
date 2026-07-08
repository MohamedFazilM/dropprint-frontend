import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function MyOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4">Loading your orders...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50/50 px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <span className="text-3xl mb-2">⚠️</span>
                <h2 className="text-xl font-extrabold text-gray-900 mb-2">Something went wrong</h2>
                <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">{error}</p>
                <button onClick={() => window.location.reload()} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors">
                    Try Again
                </button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50/50 px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <div className="w-32 h-32 text-gray-200 mb-6">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-2">No Orders Yet</h1>
                <p className="text-gray-500 mb-8 text-center max-w-sm leading-relaxed">
                    You haven't placed any orders yet. Start creating your custom oversized tees now!
                </p>
                <Link to="/design-studio" className="bg-[#cc0000] text-white px-8 py-3.5 rounded-2xl font-bold shadow-[0_4px_18px_rgba(204,0,0,0.2)] hover:bg-[#b30000] transition-all hover:scale-[1.02]">
                    Design a T-Shirt
                </Link>
            </div>
        );
    }

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "placed":
                return "bg-blue-50 text-blue-700 border-blue-100";
            case "shipped":
                return "bg-orange-50 text-orange-700 border-orange-100";
            case "delivered":
                return "bg-green-50 text-green-700 border-green-100";
            case "cancelled":
                return "bg-red-50 text-red-700 border-red-100";
            default:
                return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24 pt-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <div className="max-w-4xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Orders</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Track and manage your order history</p>
                    </div>
                    <Link to="/shop" className="text-sm font-bold text-[#cc0000] hover:text-[#b30000] transition-colors flex items-center gap-1 group">
                        <span className="transition-transform group-hover:-translate-x-0.5">←</span> Continue Shopping
                    </Link>
                </div>

                {/* Orders List */}
                <div className="space-y-8">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-3xl border border-gray-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.015)] overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-50/70 border-b border-gray-100 p-6 flex flex-wrap justify-between items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <div className="flex gap-6 flex-wrap">
                                    <div>
                                        <p className="text-[10px] text-gray-400 mb-1">Order Placed</p>
                                        <p className="text-gray-800 font-extrabold">
                                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 mb-1">Total Price</p>
                                        <p className="text-gray-800 font-extrabold">₹{order.totalPrice}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 mb-1">Order ID</p>
                                        <p className="text-gray-800 font-extrabold">{order.id}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`border px-3 py-1 rounded-full uppercase text-[10px] ${getStatusStyle(order.status)}`}>
                                        {order.status}
                                    </span>
                                    <span className={`border px-3 py-1 rounded-full uppercase text-[10px] ${order.paymentStatus === "paid" ? "bg-green-50 text-green-700 border-green-100" : "bg-yellow-50 text-yellow-700 border-yellow-100"}`}>
                                        Payment: {order.paymentStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6 divide-y divide-gray-100">
                                {order.items?.map((item) => {
                                    const hasFront = !!item.design?.front?.fileUrl || (item.design?.printArea !== "Back" && !!item.design?.fileUrl);
                                    const hasBack = !!item.design?.back?.fileUrl || (item.design?.printArea === "Back" && !!item.design?.fileUrl);
                                    const frontUrl = item.design?.front?.fileUrl || (item.design?.printArea !== "Back" ? item.design?.fileUrl : null);
                                    const backUrl = item.design?.back?.fileUrl || (item.design?.printArea === "Back" ? item.design?.fileUrl : null);

                                    const showBack = hasBack && !hasFront;
                                    const shirtImage = showBack && item.product.imageBack
                                        ? item.product.imageBack
                                        : (item.product.imageMain || "https://placehold.co/400x500/f3f4f6/9ca3af?text=No+Image");

                                    return (
                                        <div key={item.id} className="py-5 flex gap-4 sm:gap-6 items-center first:pt-0 last:pb-0">
                                            {/* Image preview */}
                                            <div className="relative w-16 h-20 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden flex items-center justify-center p-1 flex-shrink-0">
                                                <img
                                                    src={shirtImage}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => { e.target.src = "https://placehold.co/400x500/f3f4f6/9ca3af?text=No+Image"; }}
                                                />
                                                {showBack ? (
                                                    backUrl && (
                                                        <div className="absolute inset-0 flex items-center justify-center p-2.5">
                                                            <img src={backUrl} className="w-[45%] h-[45%] object-contain mt-0.5" />
                                                        </div>
                                                    )
                                                ) : (
                                                    frontUrl && (
                                                        <div className="absolute inset-0 flex items-center justify-center p-2.5">
                                                            <img src={frontUrl} className="w-[45%] h-[45%] object-contain mt-0.5" />
                                                        </div>
                                                    )
                                                )}
                                                {item.design && (
                                                    <span className="absolute bottom-0.5 right-0.5 text-[6px] bg-red-600 text-white font-extrabold px-1 py-0.2 rounded uppercase">
                                                        Custom
                                                    </span>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-grow">
                                                <h4 className="font-extrabold text-gray-900 text-sm line-clamp-1">{item.product.name}</h4>
                                                <div className="flex gap-2 flex-wrap items-center mt-1 text-[11px] font-bold text-gray-400">
                                                    <span className="uppercase">{item.product.color}</span>
                                                    <span>•</span>
                                                    <span>Size: {item.size}</span>
                                                    <span>•</span>
                                                    <span>Qty: {item.qty}</span>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-black text-gray-900 text-sm">₹{item.price * item.qty}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-0.5">₹{item.price} each</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MyOrders;

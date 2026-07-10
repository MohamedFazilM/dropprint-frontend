import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import LedgerHistoryModal from "../../components/LedgerHistoryModal";

const STATUS_OPTIONS = ["placed", "design_approved", "printing", "shipped", "delivered"];

const STATUS_PILLS = {
    placed: "bg-amber-500/10 text-amber-600 border-amber-200/50",
    design_approved: "bg-blue-500/10 text-blue-600 border-blue-200/50",
    printing: "bg-indigo-500/10 text-indigo-700 border-indigo-200/50",
    shipped: "bg-sky-500/10 text-sky-600 border-sky-200/50",
    delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
};

const STATUS_BORDERS = {
    placed: "border-l-amber-500 hover:border-amber-500/80",
    design_approved: "border-l-blue-500 hover:border-blue-500/80",
    printing: "border-l-indigo-500 hover:border-indigo-500/80",
    shipped: "border-l-sky-500 hover:border-sky-500/80",
    delivered: "border-l-emerald-500 hover:border-emerald-500/80",
};

const STATUS_LABELS = {
    placed: "Placed",
    design_approved: "Approved",
    printing: "Printing",
    shipped: "Shipped",
    delivered: "Delivered",
};

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyEntityId, setHistoryEntityId] = useState(null);
    const [activeTab, setActiveTab] = useState("active"); // "active" or "completed"
    const [activePreviewImage, setActivePreviewImage] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = () => {
        axiosClient.get(`/admin/orders?_t=${Date.now()}`)
            .then((res) => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleStatusChange = async (orderId, newStatus) => {
        // Optimistic UI update: instantly update state so change is visible immediately
        setOrders(prevOrders => 
            prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        );

        try {
            await axiosClient.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
            fetchOrders(); // Revert to server state on error
        }
    };

    if (loading) {
        return (
            <div style={{ fontFamily: "'Outfit', sans-serif" }} className="flex justify-center items-center min-h-[50vh]">
                <p className="text-sm font-bold text-zinc-400 animate-pulse uppercase tracking-wider">Loading orders...</p>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Outfit', sans-serif" }} className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <span style={{
                    display: "inline-block",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "4px",
                    textTransform: "uppercase",
                    color: "#cc0000",
                    marginBottom: "8px",
                }}>FULFILLMENT</span>
                <h1 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "clamp(24px, 3.5vw, 36px)",
                    fontWeight: 800,
                    color: "#111",
                    letterSpacing: "-1.5px",
                    margin: "0",
                }}>Orders</h1>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-6 border-b border-zinc-250/20 pb-px">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`pb-4 px-1 text-xs font-black uppercase tracking-wider relative transition-colors cursor-pointer ${activeTab === "active" ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-600"}`}
                >
                    Active Orders ({orders.filter(o => o.status?.toLowerCase() !== "delivered").length})
                    {activeTab === "active" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#cc0000] rounded-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("completed")}
                    className={`pb-4 px-1 text-xs font-black uppercase tracking-wider relative transition-colors cursor-pointer ${activeTab === "completed" ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-600"}`}
                >
                    Completed Orders ({orders.filter(o => o.status?.toLowerCase() === "delivered").length})
                    {activeTab === "completed" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#cc0000] rounded-full"></div>
                    )}
                </button>
            </div>

            <div className="space-y-6">
                {orders.filter((order) => {
                    const isDelivered = order.status?.toLowerCase() === "delivered";
                    return activeTab === "completed" ? isDelivered : !isDelivered;
                }).length === 0 ? (
                    <div className="text-center py-16 bg-white border border-zinc-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">No {activeTab} orders found.</p>
                    </div>
                ) : (
                    orders.filter((order) => {
                        const isDelivered = order.status?.toLowerCase() === "delivered";
                        return activeTab === "completed" ? isDelivered : !isDelivered;
                    }).map((order) => (
                        <div
                            key={order.id}
                            className={`bg-white rounded-xl border border-zinc-200/80 border-l-4 ${STATUS_BORDERS[order.status?.toLowerCase()] || "border-l-zinc-300"} p-6 md:p-8 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.012)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] space-y-6 hover:border-zinc-300/85`}
                        >
                            {/* Header Row */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-zinc-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-zinc-950 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-md">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Order</span>
                                        <span className="text-xs font-black font-mono">#{order.id}</span>
                                    </div>
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ""}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="text-left sm:text-right">
                                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Gross Total</span>
                                        <span className="text-lg font-black bg-gradient-to-r from-zinc-950 to-[#cc0000] bg-clip-text text-transparent">₹{order.totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${STATUS_PILLS[order.status?.toLowerCase()] || "bg-zinc-100 border-zinc-250 text-zinc-600"}`}>
                                        ● {STATUS_LABELS[order.status?.toLowerCase()] || order.status}
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Customer Info */}
                                <div className="md:col-span-4 space-y-2.5">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block">Customer Info</span>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-650 flex-shrink-0">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs font-extrabold text-zinc-900">{order.customer?.name}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-500">
                                            <div className="w-5 h-5 rounded-full bg-zinc-50 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-[11px] font-medium truncate max-w-[200px]" title={order.customer?.email}>{order.customer?.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-500">
                                            <div className="w-5 h-5 rounded-full bg-zinc-50 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            <p className="text-[11px] font-medium">{order.customer?.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="md:col-span-5 space-y-2.5">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block">Shipping Address</span>
                                    <div className="flex gap-2 text-zinc-600 items-start">
                                        <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-650 mt-0.5 flex-shrink-0">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs text-zinc-600 font-medium leading-relaxed max-w-sm">{order.customer?.address || "No address provided"}</p>
                                    </div>
                                </div>

                                {/* Actions / Status Picker */}
                                <div className="md:col-span-3 space-y-2.5">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block">Fulfillment Actions</span>
                                    <div className="flex flex-col gap-2">
                                        <div className="relative">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className="w-full border border-zinc-200 hover:border-zinc-300 rounded-lg px-3.5 py-2.5 text-xs font-bold bg-zinc-50 text-zinc-800 focus:border-zinc-950 focus:bg-white focus:outline-none transition-all cursor-pointer appearance-none shadow-sm"
                                            >
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-zinc-500">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setHistoryEntityId(order.id)}
                                            className="w-full text-center bg-white hover:bg-zinc-50 text-zinc-850 border border-zinc-200 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-98 flex items-center justify-center gap-1.5 hover:border-zinc-300"
                                        >
                                            <svg className="w-3.5 h-3.5 text-zinc-505" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Audit History Log
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div style={{ background: "#fafafa" }} className="rounded-lg border border-zinc-200/50 p-5 space-y-4">
                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Items in this Order</span>
                                <div className="divide-y divide-zinc-200/30">
                                    {order.items?.map((item) => {
                                        const frontDesign = item.design?.front || (item.design?.printArea !== "Back" ? item.design : null);
                                        const backDesign = item.designBack || item.design?.back || (item.design?.printArea === "Back" ? item.design : null);

                                        const frontImage = item.product?.imageMain || "https://placehold.co/400x500/f3f4f6/9ca3af?text=No+Image";
                                        const backImage = item.product?.imageBack || "https://placehold.co/400x500/f3f4f6/9ca3af?text=No+Image";

                                        return (
                                            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                                                <div className="flex items-center gap-4">
                                                    {/* Composite Shirt Thumbnail */}
                                                    <div className="flex gap-2 flex-shrink-0">
                                                        {frontDesign?.fileUrl && (
                                                            <div 
                                                                onClick={() => setActivePreviewImage(frontDesign.fileUrl)}
                                                                className="relative w-14 h-16 bg-zinc-50 border border-zinc-150 rounded-xl overflow-hidden flex items-center justify-center p-1 cursor-zoom-in hover:border-zinc-400 transition-all"
                                                                title="Click to preview design"
                                                            >
                                                                <img
                                                                    src={frontImage}
                                                                    alt="Front aspect"
                                                                    className="w-full h-full object-contain"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center p-2.5">
                                                                    <img
                                                                        src={frontDesign.fileUrl}
                                                                        alt="Front overlay"
                                                                        className="w-[45%] h-[45%] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                                                                    />
                                                                </div>
                                                                <span className="absolute top-0.5 left-0.5 bg-black/60 text-[6px] text-white px-1 py-0.2 rounded font-bold uppercase">Front</span>
                                                            </div>
                                                        )}
                                                        {backDesign?.fileUrl && (
                                                            <div 
                                                                onClick={() => setActivePreviewImage(backDesign.fileUrl)}
                                                                className="relative w-14 h-16 bg-zinc-50 border border-zinc-150 rounded-xl overflow-hidden flex items-center justify-center p-1 cursor-zoom-in hover:border-zinc-400 transition-all"
                                                                title="Click to preview design"
                                                            >
                                                                <img
                                                                    src={backImage}
                                                                    alt="Back aspect"
                                                                    className="w-full h-full object-contain"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center p-2.5">
                                                                    <img
                                                                        src={backDesign.fileUrl}
                                                                        alt="Back overlay"
                                                                        className="w-[45%] h-[45%] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                                                                    />
                                                                </div>
                                                                <span className="absolute top-0.5 left-0.5 bg-black/60 text-[6px] text-white px-1 py-0.2 rounded font-bold uppercase">Back</span>
                                                            </div>
                                                        )}
                                                        {!frontDesign?.fileUrl && !backDesign?.fileUrl && (
                                                            <div 
                                                                onClick={() => setActivePreviewImage(frontImage)}
                                                                className="relative w-14 h-16 bg-zinc-50 border border-zinc-150 rounded-xl overflow-hidden flex items-center justify-center p-1 cursor-zoom-in hover:border-zinc-400 transition-all"
                                                                title="Click to view base mockup"
                                                            >
                                                                <img
                                                                    src={frontImage}
                                                                    alt={item.product?.name || "Tee"}
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Text Info */}
                                                    <div className="space-y-1">
                                                        <span className="font-extrabold text-zinc-950 text-sm block">{item.product?.name || "Custom Tee"}</span>
                                                        <div className="flex flex-wrap gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wide items-center">
                                                            <span>Color: {item.product?.color || "N/A"}</span>
                                                            <span>•</span>
                                                            <span>Size: {item.size}</span>
                                                            <span>•</span>
                                                            <span>Qty: {item.qty}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-2 mt-2">
                                                            {frontDesign?.fileUrl && (
                                                                <div className="flex flex-wrap gap-2 items-center">
                                                                    <span className="bg-red-50 text-[#cc0000] border border-red-150 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                                                                        Front side
                                                                    </span>
                                                                    <button
                                                                        onClick={() => setActivePreviewImage(frontDesign.fileUrl)}
                                                                        className="bg-zinc-900 hover:bg-[#cc0000] text-white border border-zinc-900 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                        </svg>
                                                                        Inspect Design
                                                                    </button>
                                                                    <a
                                                                        href={frontDesign.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 shadow-sm active:scale-95"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                        </svg>
                                                                        Download
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {backDesign?.fileUrl && (
                                                                <div className="flex flex-wrap gap-2 items-center">
                                                                    <span className="bg-red-50 text-[#cc0000] border border-red-150 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                                                                        Back side
                                                                    </span>
                                                                    <button
                                                                        onClick={() => setActivePreviewImage(backDesign.fileUrl)}
                                                                        className="bg-zinc-900 hover:bg-[#cc0000] text-white border border-zinc-900 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                        </svg>
                                                                        Inspect Design
                                                                    </button>
                                                                    <a
                                                                        href={backDesign.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 shadow-sm active:scale-95"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                        </svg>
                                                                        Download
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Subtotal */}
                                                <div className="text-right self-end sm:self-center">
                                                    <span className="text-[10px] text-zinc-450 font-bold block uppercase tracking-wider">Item Price</span>
                                                    <span className="font-black text-zinc-950 text-sm">₹{(item.price * item.qty).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    ))
                )}
            </div>

            {historyEntityId && (
                                                <LedgerHistoryModal entityId={historyEntityId} onClose={() => setHistoryEntityId(null)} />
                                            )}

                                            {activePreviewImage && (
                                                <div 
                                                    onClick={() => setActivePreviewImage(null)}
                                                    className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out transition-all duration-300"
                                                >
                                                    <div 
                                                        className="relative max-w-2xl w-full bg-zinc-900/95 border border-zinc-800 rounded-xl p-6 md:p-8 shadow-2xl overflow-hidden flex flex-col items-center justify-center backdrop-blur-xl animate-[modalScaleUp_0.4s_cubic-bezier(0.16,1,0.3,1)]" 
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        {/* Photoshop transparent grid board styling */}
                                                        <style>{`
                                                            @keyframes modalScaleUp {
                                                                0% { transform: scale(0.95); opacity: 0; }
                                                                100% { transform: scale(1); opacity: 1; }
                                                            }
                                                            .transparent-grid {
                                                                background-color: #121214;
                                                                background-image: 
                                                                    linear-gradient(45deg, #18181b 25%, transparent 25%), 
                                                                    linear-gradient(-45deg, #18181b 25%, transparent 25%), 
                                                                    linear-gradient(45deg, transparent 75%, #18181b 75%), 
                                                                    linear-gradient(-45deg, transparent 75%, #18181b 75%);
                                                                background-size: 20px 20px;
                                                                background-position: 0 0, 0 10px, 10px -10px, 10px 0;
                                                            }
                                                        `}</style>

                                                        {/* Ambient glow detail */}
                                                        <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#cc0000]/10 rounded-full blur-[100px] pointer-events-none"></div>
                                                        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-zinc-800/20 rounded-full blur-[100px] pointer-events-none"></div>

                                                        {/* Modal Header */}
                                                        <div className="w-full flex justify-between items-center mb-6 pb-4 border-b border-zinc-800/80 relative z-10">
                                                            <div>
                                                                <span className="text-[10px] text-[#cc0000] font-black uppercase tracking-widest block mb-0.5">DropPrint Admin</span>
                                                                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Artwork Inspector</h3>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <a 
                                                                    href={activePreviewImage} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="bg-zinc-800 hover:bg-[#cc0000] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 border border-zinc-700/50 shadow-sm active:scale-95 cursor-pointer"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                    </svg>
                                                                    Download File
                                                                </a>
                                                                <button 
                                                                    onClick={() => setActivePreviewImage(null)}
                                                                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg w-8 h-8 flex items-center justify-center transition-all cursor-pointer border border-zinc-700/30"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Image View Frame with transparent board */}
                                                        <div className="w-full transparent-grid rounded-xl p-8 flex items-center justify-center border border-zinc-800/50 relative z-10 min-h-[300px]">
                                                            <img 
                                                                src={activePreviewImage} 
                                                                alt="Custom Graphic Preview" 
                                                                className="max-h-[50vh] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.65)] hover:scale-[1.03] transition-all duration-300 rounded-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

export default AdminOrders;
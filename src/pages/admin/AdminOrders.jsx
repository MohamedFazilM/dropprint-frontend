import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import LedgerHistoryModal from "../../components/LedgerHistoryModal";

const STATUS_OPTIONS = ["placed", "design_approved", "printing", "shipped", "delivered"];

const STATUS_PILLS = {
    placed: "bg-amber-50 text-amber-600 border-amber-100",
    design_approved: "bg-blue-50 text-blue-600 border-blue-100",
    printing: "bg-indigo-50 text-indigo-600 border-indigo-100",
    shipped: "bg-sky-50 text-sky-600 border-sky-100",
    delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
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

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = () => {
        axiosClient.get("/admin/orders")
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
        try {
            await axiosClient.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
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
        <div style={{ fontFamily: "'Outfit', sans-serif" }} className="p-8 max-w-7xl mx-auto space-y-8">
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
                            className="bg-white rounded-xl border border-zinc-200 border-l-4 border-l-zinc-200 hover:border-l-[#cc0000] p-6 md:p-8 transition-all duration-350 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(204,0,0,0.03)] hover:border-[#cc0000]/40 space-y-6"
                        >
                            {/* Header Row */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200/40">
                                <div>
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Order ID</span>
                                    <span className="text-lg font-black text-zinc-950 font-mono">#{order.id}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="text-left sm:text-right">
                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Total Price</span>
                                        <span className="text-base font-black text-[#cc0000]">₹{order.totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_PILLS[order.status?.toLowerCase()] || "bg-zinc-100 border-zinc-200 text-zinc-600"}`}>
                                        {STATUS_LABELS[order.status?.toLowerCase()] || order.status}
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Customer Info */}
                                <div className="md:col-span-4 space-y-1">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block">Customer Info</span>
                                    <p className="text-sm font-black text-zinc-900">{order.customer?.name}</p>
                                    <p className="text-xs text-zinc-500 font-medium">{order.customer?.email}</p>
                                    <p className="text-xs text-zinc-500 font-medium">{order.customer?.phone}</p>
                                </div>

                                {/* Shipping Address */}
                                <div className="md:col-span-5 space-y-1">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block">Shipping Address</span>
                                    <p className="text-xs text-zinc-600 font-medium leading-relaxed max-w-sm">{order.customer?.address}</p>
                                </div>

                                {/* Actions / Status Picker */}
                                <div className="md:col-span-3 space-y-2">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block">Fulfillment Actions</span>
                                    <div className="flex flex-col gap-2">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className="w-full border border-zinc-250 rounded-xl px-3 py-2 text-xs font-bold bg-white text-zinc-800 focus:border-zinc-950 focus:outline-none transition-colors"
                                        >
                                            {STATUS_OPTIONS.map((s) => (
                                                <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => setHistoryEntityId(order.id)}
                                            className="w-full text-center bg-zinc-950 hover:bg-zinc-800 text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                                        >
                                            View History Log
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div style={{ background: "#fafafa" }} className="rounded-xl border border-zinc-200/50 p-5 space-y-4">
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
                                                            <div className="relative w-14 h-16 bg-zinc-50 border border-zinc-150 rounded-xl overflow-hidden flex items-center justify-center p-1">
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
                                                            <div className="relative w-14 h-16 bg-zinc-50 border border-zinc-150 rounded-xl overflow-hidden flex items-center justify-center p-1">
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
                                                            <div className="relative w-14 h-16 bg-zinc-50 border border-zinc-150 rounded-xl overflow-hidden flex items-center justify-center p-1">
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
                                                        <div className="flex flex-col gap-1.5 mt-1.5">
                                                            {frontDesign?.fileUrl && (
                                                                <div className="flex flex-wrap gap-2 items-center">
                                                                    <span className="bg-red-50 text-[#cc0000] border border-red-100 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                                                                        Print Area: Front
                                                                    </span>
                                                                    <a
                                                                        href={frontDesign.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-xs text-blue-600 hover:text-blue-800 font-extrabold underline flex items-center gap-1"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                        </svg>
                                                                        Download Front Artwork
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {backDesign?.fileUrl && (
                                                                <div className="flex flex-wrap gap-2 items-center">
                                                                    <span className="bg-red-50 text-[#cc0000] border border-red-100 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                                                                        Print Area: Back
                                                                    </span>
                                                                    <a
                                                                        href={backDesign.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-xs text-blue-600 hover:text-blue-800 font-extrabold underline flex items-center gap-1"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                        </svg>
                                                                        Download Back Artwork
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
        </div>
    );
}

export default AdminOrders;
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
    const [activeInstructionText, setActiveInstructionText] = useState(null);
    const [activeDetailOrder, setActiveDetailOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = () => {
        axiosClient.get(`/admin/orders?_t=${Date.now()}`)
            .then((res) => {
                setOrders(res.data);
                // Sync detailed order state with latest database fetch if modal is open
                if (activeDetailOrder) {
                    const latestOrder = res.data.find(o => o.id === activeDetailOrder.id);
                    if (latestOrder) setActiveDetailOrder(latestOrder);
                }
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

        if (activeDetailOrder && activeDetailOrder.id === orderId) {
            setActiveDetailOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }

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
        <div style={{ fontFamily: "'Outfit', sans-serif" }} className="p-6 sm:p-10 max-w-7xl mx-auto space-y-10 bg-zinc-50/20 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-zinc-200/60">
                <div>
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.25em] text-[#cc0000] mb-1.5">Fulfillment Command Center</span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight leading-none">
                        Manage Orders
                    </h1>
                </div>

                {/* Micro Stats Display */}
                <div className="flex gap-4">
                    <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold text-lg">📦</div>
                        <div>
                            <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide block">Active</span>
                            <span className="text-lg font-black text-zinc-800">{orders.filter(o => o.status?.toLowerCase() !== "delivered").length}</span>
                        </div>
                    </div>
                    <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-lg">✅</div>
                        <div>
                            <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide block">Completed</span>
                            <span className="text-lg font-black text-zinc-800">{orders.filter(o => o.status?.toLowerCase() === "delivered").length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-8 border-b border-zinc-200 pb-px">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`pb-4 px-1 text-xs font-black uppercase tracking-wider relative transition-all cursor-pointer ${activeTab === "active" ? "text-zinc-950 scale-105" : "text-zinc-400 hover:text-zinc-600"}`}
                >
                    Active Orders
                    {activeTab === "active" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#cc0000] rounded-full animate-pulse"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("completed")}
                    className={`pb-4 px-1 text-xs font-black uppercase tracking-wider relative transition-all cursor-pointer ${activeTab === "completed" ? "text-zinc-950 scale-105" : "text-zinc-400 hover:text-zinc-600"}`}
                >
                    Completed Orders
                    {activeTab === "completed" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#cc0000] rounded-full"></div>
                    )}
                </button>
            </div>

            {/* Orders Table Container */}
            <div className="bg-white rounded-3xl border border-zinc-200/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200/50 text-[10px] text-zinc-400 font-bold uppercase tracking-wider whitespace-nowrap">
                                <th className="p-4 pl-6">Order</th>
                                <th className="p-4">Customer Info</th>
                                <th className="p-4">Shipping Address</th>
                                <th className="p-4">Special Instructions</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Status & Action</th>
                                <th className="p-4">Items & Custom Designs</th>
                                <th className="p-4 pr-6 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200/40 text-xs">
                            {orders.filter((order) => {
                                const isDelivered = order.status?.toLowerCase() === "delivered";
                                return activeTab === "completed" ? isDelivered : !isDelivered;
                            }).map((order) => {
                                // Consolidated instructions
                                const allInstructions = order.items
                                    ?.map(item => item.design?.description || item.designBack?.description || "")
                                    .filter(text => text.trim().length > 0) || [];
                                const uniqueInstructions = [...new Set(allInstructions)];
                                const consolidatedInstructions = uniqueInstructions.join(" | ");

                                return (
                                    <tr key={order.id} className="hover:bg-zinc-50/20 transition-colors align-top">
                                        {/* Order Info */}
                                        <td className="p-4 pl-6 space-y-1.5 whitespace-nowrap">
                                            <div className="bg-zinc-950 text-white px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-sm">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Order</span>
                                                <span className="text-xs font-black font-mono">#{order.id}</span>
                                            </div>
                                            <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider block pl-0.5">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ""}
                                            </span>
                                        </td>

                                        {/* Customer Info */}
                                        <td className="p-4 space-y-1">
                                            <p className="font-bold text-zinc-900 leading-tight">{order.shippingName || order.customer?.name || "N/A"}</p>
                                            <p className="text-[10px] text-zinc-500 font-medium truncate max-w-[140px]" title={order.shippingEmail || order.customer?.email}>{order.shippingEmail || order.customer?.email}</p>
                                            <p className="text-[10px] text-zinc-500 font-bold">{order.shippingPhone || order.customer?.phone || "N/A"}</p>
                                        </td>

                                        {/* Shipping Address */}
                                        <td className="p-4 min-w-[150px] max-w-[200px] whitespace-normal leading-relaxed text-zinc-600 font-medium">
                                            {order.shippingAddress || order.customer?.address || "No address provided"}
                                        </td>

                                        {/* Special Instructions */}
                                        <td className="p-4 min-w-[180px] max-w-[220px]">
                                            {consolidatedInstructions ? (
                                                <div className="bg-rose-50/70 border border-rose-100/80 rounded-xl p-3 space-y-2 shadow-inner">
                                                    <p className="text-[10px] font-black text-zinc-800 leading-normal line-clamp-2">
                                                        "{consolidatedInstructions}"
                                                    </p>
                                                    <button
                                                        onClick={() => setActiveInstructionText(consolidatedInstructions)}
                                                        className="bg-white hover:bg-rose-100 text-[#cc0000] border border-rose-200/50 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm active:scale-95 flex items-center gap-1 w-fit"
                                                    >
                                                        🔍 View
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-400 font-bold">-</span>
                                            )}
                                        </td>

                                        {/* Gross Total */}
                                        <td className="p-4 whitespace-nowrap">
                                            <span className="text-sm font-black text-zinc-950">₹{order.totalPrice.toLocaleString()}</span>
                                        </td>

                                        {/* Fulfillment Status */}
                                        <td className="p-4 space-y-2 min-w-[140px]">
                                            <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm flex items-center gap-1.5 w-fit ${STATUS_PILLS[order.status?.toLowerCase()] || "bg-zinc-100 border-zinc-200 text-zinc-650"}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                                                {STATUS_LABELS[order.status?.toLowerCase()] || order.status}
                                            </div>
                                            <div className="relative">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className="w-full border border-zinc-200 hover:border-zinc-350 rounded-xl px-2.5 py-1.5 text-[10px] font-extrabold bg-zinc-50 text-zinc-800 focus:border-zinc-950 focus:bg-white focus:outline-none transition-all cursor-pointer appearance-none shadow-sm"
                                                >
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-zinc-500">
                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setHistoryEntityId(order.id)}
                                                className="w-full text-center bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 hover:border-zinc-300 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-98 flex items-center justify-center gap-1"
                                            >
                                                <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Audit Log
                                            </button>
                                        </td>

                                        {/* Order Items & Custom Designs */}
                                        <td className="p-4 pr-6">
                                            <div className="space-y-3 min-w-[280px] max-w-[340px]">
                                                {order.items?.map((item) => {
                                                    const frontDesign = item.design?.front || (item.design?.printArea !== "Back" ? item.design : null);
                                                    const backDesign = item.designBack || item.design?.back || (item.design?.printArea === "Back" ? item.design : null);

                                                    const designPosition = item.design?.position || "";
                                                    let selectedColor = item.product?.color || "White";
                                                    if (designPosition.includes("Color: ")) {
                                                        const parts = designPosition.split("Color: ");
                                                        const partAfterColor = parts[parts.length - 1].trim();
                                                        selectedColor = partAfterColor.split(/[|/]/)[0].trim();
                                                    }
                                                    if (!selectedColor || typeof selectedColor !== "string") {
                                                        selectedColor = "White";
                                                    }

                                                    const colorCircles = {
                                                        White: "⚪",
                                                        Black: "⚫",
                                                        Red: "🔴",
                                                        Navy: "🔵",
                                                        Gray: "🔘"
                                                    };
                                                    const colorCircle = colorCircles[selectedColor] || "";

                                                    const filterStyles = {
                                                        Black: "brightness(0.2)",
                                                        Gray: "grayscale(1) brightness(0.7)",
                                                        Red: "sepia(1) saturate(10) hue-rotate(-50deg) brightness(0.6)",
                                                        Navy: "sepia(1) saturate(5) hue-rotate(180deg) brightness(0.4)"
                                                    };
                                                    const imageFilter = filterStyles[selectedColor] || "none";
                                                    const frontImage = item.product?.imageMain || "https://placehold.co/400x500/f3f4f6/9ca3af?text=No+Image";
                                                    const backImage = item.product?.imageBack || "https://placehold.co/400x500/f3f4f6/9ca3af?text=No+Image";

                                                    return (
                                                        <div key={item.id} className="bg-zinc-50 border border-zinc-200/60 p-3 rounded-2xl flex items-center gap-3">
                                                            {/* Tiny aspect shirt overlays */}
                                                            <div className="flex gap-1.5 flex-shrink-0">
                                                                {frontDesign?.fileUrl && (
                                                                    <div
                                                                        onClick={() => setActivePreviewImage(frontDesign.fileUrl)}
                                                                        style={{ backgroundColor: selectedColor.startsWith("#") ? selectedColor : ({ "White": "#ffffff", "Black": "#222222", "Red": "#dc2626", "Navy": "#1e3a8a", "Gray": "#9ca3af" }[selectedColor] || "#ffffff") }}
                                                                        className="relative w-10 h-12 border border-zinc-200/80 rounded-lg overflow-hidden flex items-center justify-center p-0.5 cursor-zoom-in hover:border-zinc-450 transition-all hover:scale-105 shadow-sm"
                                                                        title="Click to preview design"
                                                                    >
                                                                        <img
                                                                            src={frontImage}
                                                                            alt="Front"
                                                                            className="w-full h-full object-contain mix-blend-multiply opacity-90"
                                                                        />
                                                                        <div className="absolute inset-0 flex items-center justify-center p-1 z-20">
                                                                            <img
                                                                                src={frontDesign.fileUrl}
                                                                                alt="Front Overlay"
                                                                                className="w-[45%] h-[45%] object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {(backDesign?.fileUrlBack || backDesign?.fileUrl) && (
                                                                    <div
                                                                        onClick={() => setActivePreviewImage(backDesign.fileUrlBack || backDesign.fileUrl)}
                                                                        style={{ backgroundColor: selectedColor.startsWith("#") ? selectedColor : ({ "White": "#ffffff", "Black": "#222222", "Red": "#dc2626", "Navy": "#1e3a8a", "Gray": "#9ca3af" }[selectedColor] || "#ffffff") }}
                                                                        className="relative w-10 h-12 border border-zinc-200/80 rounded-lg overflow-hidden flex items-center justify-center p-0.5 cursor-zoom-in hover:border-zinc-450 transition-all hover:scale-105 shadow-sm"
                                                                        title="Click to preview design"
                                                                    >
                                                                        <img
                                                                            src={backImage}
                                                                            alt="Back"
                                                                            className="w-full h-full object-contain mix-blend-multiply opacity-90"
                                                                        />
                                                                        <div className="absolute inset-0 flex items-center justify-center p-1 z-20">
                                                                            <img
                                                                                src={backDesign.fileUrlBack || backDesign.fileUrl}
                                                                                alt="Back Overlay"
                                                                                className="w-[45%] h-[45%] object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Metadata Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-zinc-900 truncate text-[11px] leading-snug">{item.product?.name} ({item.size})</h4>
                                                                <p className="text-[9px] text-zinc-500 font-extrabold uppercase mt-0.5 leading-none">
                                                                    Qty: {item.qty} | Color: {selectedColor}
                                                                    {selectedColor.startsWith("#") ? (
                                                                        <span
                                                                            style={{ backgroundColor: selectedColor }}
                                                                            className="inline-block w-2.5 h-2.5 rounded-full border border-zinc-300 ml-1.5 align-middle shadow-sm animate-pulse"
                                                                        />
                                                                    ) : (
                                                                        <span className="ml-1.5 align-middle">
                                                                            {{ "White": "⚪", "Black": "⚫", "Red": "🔴", "Navy": "🔵", "Gray": "🔘" }[selectedColor] || "⚪"}
                                                                        </span>
                                                                    )}
                                                                </p>

                                                                {/* Buttons stack */}
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {frontDesign?.fileUrl && (
                                                                        <div className="flex items-center gap-0.5">
                                                                            <button
                                                                                onClick={() => setActivePreviewImage(frontDesign.fileUrl)}
                                                                                className="bg-zinc-950 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded hover:bg-zinc-800 active:scale-95 transition-all"
                                                                            >
                                                                                Front
                                                                            </button>
                                                                            <a
                                                                                href={frontDesign.fileUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="bg-white border border-zinc-200 text-zinc-700 text-[8px] font-black uppercase px-1.5 py-0.5 rounded hover:bg-zinc-50 active:scale-95 transition-all"
                                                                            >
                                                                                ↓
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                    {(backDesign?.fileUrlBack || backDesign?.fileUrl) && (
                                                                        <div className="flex items-center gap-0.5">
                                                                            <button
                                                                                onClick={() => setActivePreviewImage(backDesign.fileUrlBack || backDesign.fileUrl)}
                                                                                className="bg-zinc-950 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded hover:bg-zinc-800 active:scale-95 transition-all"
                                                                            >
                                                                                Back
                                                                            </button>
                                                                            <a
                                                                                href={backDesign.fileUrlBack || backDesign.fileUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="bg-white border border-zinc-200 text-zinc-700 text-[8px] font-black uppercase px-1.5 py-0.5 rounded hover:bg-zinc-50 active:scale-95 transition-all"
                                                                            >
                                                                                ↓
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </td>

                                        {/* Action Column Details Button */}
                                        <td className="p-4 pr-6 text-center align-middle whitespace-nowrap">
                                            <button
                                                onClick={() => setActiveDetailOrder(order)}
                                                className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm active:scale-95 inline-flex items-center gap-1.5 bg-[#cc0000]/10 text-[#cc0000] border border-[#cc0000]/20 hover:bg-[#cc0000] hover:text-white hover:border-[#cc0000] hover:shadow-md"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {orders.filter((order) => {
                                const isDelivered = order.status?.toLowerCase() === "delivered";
                                return activeTab === "completed" ? isDelivered : !isDelivered;
                            }).length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="text-center py-20 bg-white">
                                            <span className="text-4xl mb-4 block">📭</span>
                                            <p className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest">No {activeTab} orders found</p>
                                            <p className="text-xs text-zinc-400 mt-1">New customer transactions will appear here in real-time</p>
                                        </td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Audit History Modal */}
            {historyEntityId && (
                <LedgerHistoryModal entityId={historyEntityId} onClose={() => setHistoryEntityId(null)} />
            )}

            {/* Image Preview Modal */}
            {activePreviewImage && (
                <div
                    onClick={() => setActivePreviewImage(null)}
                    className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out transition-all duration-300 animate-[fadeIn_0.2s_ease-out]"
                >
                    <div
                        className="relative max-w-2xl w-full bg-zinc-900/95 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden flex flex-col items-center justify-center backdrop-blur-xl animate-[modalScaleUp_0.4s_cubic-bezier(0.16,1,0.3,1)]"
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
                        <div className="w-full transparent-grid rounded-2xl p-8 flex items-center justify-center border border-zinc-800/50 relative z-10 min-h-[300px]">
                            <img
                                src={activePreviewImage}
                                alt="Custom Graphic Preview"
                                className="max-h-[50vh] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.65)] hover:scale-[1.03] transition-all duration-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Special Instructions Popup Modal */}
            {activeInstructionText && (
                <div
                    onClick={() => setActiveInstructionText(null)}
                    className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out animate-[fadeIn_0.2s_ease-out]"
                >
                    <div
                        className="relative max-w-lg w-full bg-white border border-zinc-200 rounded-[32px] p-6 md:p-8 shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl animate-[modalScaleUp_0.4s_cubic-bezier(0.16,1,0.3,1)]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Red Accent strip */}
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-[#cc0000]" />

                        {/* Modal Header */}
                        <div className="w-full flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
                            <div className="flex items-center gap-2.5">
                                <span className="text-2xl">💬</span>
                                <div>
                                    <span className="text-[10px] text-[#cc0000] font-black uppercase tracking-[0.2em] block mb-0.5">Fulfillment Instruction</span>
                                    <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider">Custom Requirements</h3>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveInstructionText(null)}
                                className="bg-zinc-100 hover:bg-zinc-250 text-zinc-650 hover:text-zinc-900 rounded-full w-8 h-8 flex items-center justify-center transition-all cursor-pointer font-extrabold text-xs"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Instruction Content Card */}
                        <div className="bg-[#fff5f5]/80 border border-red-100 rounded-2xl p-6 mb-6 shadow-inner text-center">
                            <p className="text-base font-black text-zinc-900 leading-relaxed italic">
                                "{activeInstructionText}"
                            </p>
                        </div>

                        {/* CTA button */}
                        <button
                            onClick={() => setActiveInstructionText(null)}
                            className="w-full bg-zinc-950 hover:bg-[#cc0000] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md active:scale-[0.98]"
                        >
                            Understood, Close
                        </button>
                    </div>
                </div>
            )}
            {/* Detailed Order Popup Modal */}
            {activeDetailOrder && (() => {
                const order = activeDetailOrder;
                const allInstructions = order.items
                    ?.map(item => item.design?.description || item.designBack?.description || "")
                    .filter(text => text.trim().length > 0) || [];
                const uniqueInstructions = [...new Set(allInstructions)];
                const consolidatedInstructions = uniqueInstructions.join(" | ");

                return (
                    <div
                        onClick={() => setActiveDetailOrder(null)}
                        className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md z-45 flex items-center justify-center p-4 cursor-zoom-out animate-[fadeIn_0.2s_ease-out]"
                    >
                        <div
                            className="relative max-w-4xl w-full bg-white border border-zinc-200 rounded-[32px] p-6 md:p-8 shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl animate-[modalScaleUp_0.4s_cubic-bezier(0.16,1,0.3,1)] max-h-[90vh] cursor-default"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Accent line */}
                            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#cc0000]" />

                            {/* Header */}
                            <div className="w-full flex justify-between items-center mb-6 pb-4 border-b border-zinc-150 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="bg-zinc-950 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-md">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Order Detail</span>
                                        <span className="text-sm font-black font-mono">#{order.id}</span>
                                    </div>
                                    <span className="text-xs text-zinc-450 font-bold bg-zinc-100 px-3 py-1 rounded-lg">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ""}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setActiveDetailOrder(null)}
                                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-650 rounded-full w-9 h-9 flex items-center justify-center transition-all cursor-pointer font-bold text-xs"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body content scrollable */}
                            <div className="overflow-y-auto pr-2 space-y-6 flex-1 scrollbar-thin">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    {/* Left side details */}
                                    <div className="md:col-span-5 space-y-5">
                                        {/* Customer Info */}
                                        <div className="space-y-2">
                                            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest block">Customer Info</span>
                                            <div className="space-y-2.5 bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100 shadow-sm">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                                                        {(order.shippingName || order.customer?.name || "U").charAt(0)}
                                                    </div>
                                                    <p className="text-xs font-black text-zinc-900">{order.shippingName || order.customer?.name || "N/A"}</p>
                                                </div>
                                                <p className="text-xs text-zinc-500 font-bold flex items-center gap-1.5 pl-0.5">
                                                    📧 {order.shippingEmail || order.customer?.email || "N/A"}
                                                </p>
                                                <p className="text-xs text-zinc-650 font-black flex items-center gap-1.5 pl-0.5">
                                                    📞 {order.shippingPhone || order.customer?.phone || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Shipping Destination */}
                                        <div className="space-y-2">
                                            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest block">Shipping Destination</span>
                                            <div className="bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100 text-xs text-zinc-700 font-semibold leading-relaxed shadow-sm">
                                                📍 {order.shippingAddress || order.customer?.address || "No address provided"}
                                            </div>
                                        </div>

                                        {/* Fulfillment Actions */}
                                        <div className="space-y-2">
                                            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest block">Status & Actions</span>
                                            <div className="bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100 space-y-3 shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-zinc-550 font-bold">Fulfillment Status:</span>
                                                    <div className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border shadow-sm flex items-center gap-1.5 ${STATUS_PILLS[order.status?.toLowerCase()] || "bg-zinc-100 border-zinc-200 text-zinc-650"}`}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                                                        {STATUS_LABELS[order.status?.toLowerCase()] || order.status}
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className="w-full border border-zinc-200 hover:border-zinc-350 rounded-xl px-4 py-2.5 text-xs font-extrabold bg-white text-zinc-800 focus:border-zinc-950 focus:outline-none transition-all cursor-pointer appearance-none shadow-sm"
                                                    >
                                                        {STATUS_OPTIONS.map((s) => (
                                                            <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                                                        ))}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-500">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setHistoryEntityId(order.id);
                                                    }}
                                                    className="w-full text-center bg-white hover:bg-zinc-55 text-zinc-850 border border-zinc-200 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-98 flex items-center justify-center gap-1.5"
                                                >
                                                    📜 View Audit History Log
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right side items list */}
                                    <div className="md:col-span-7 space-y-4">
                                        <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest block">Ordered Items & Mockups</span>
                                        <div className="space-y-3">
                                            {order.items?.map((item) => {
                                                const frontDesign = item.design?.front || (item.design?.printArea !== "Back" ? item.design : null);
                                                const backDesign = item.designBack || item.design?.back || (item.design?.printArea === "Back" ? item.design : null);

                                                const designPosition = item.design?.position || "";
                                                let selectedColor = item.product?.color || "White";
                                                if (designPosition.includes("Color: ")) {
                                                    const colorPart = designPosition.split("Color: ")[1];
                                                    if (colorPart) {
                                                        selectedColor = colorPart.split(/[|/]/)[0].trim();
                                                    }
                                                }
                                                if (!selectedColor || typeof selectedColor !== "string") {
                                                    selectedColor = "White";
                                                }

                                                const frontImage = item.product?.imageMain || "https://placehold.co/400x500/f3f4f6/9ca3af?text=No+Image";
                                                const backImage = item.product?.imageBack || "https://placehold.co/400x500/f3f4f6/9ca3af?text=No+Image";

                                                const tintColor = selectedColor.startsWith("#") ? selectedColor : ({ "White": "#ffffff", "Black": "#222222", "Red": "#dc2626", "Navy": "#1e3a8a", "Gray": "#9ca3af" }[selectedColor] || "#ffffff");

                                                return (
                                                    <div key={item.id} className="bg-zinc-50/50 border border-zinc-200/50 p-4 rounded-2xl flex items-start gap-4 shadow-sm">
                                                        {/* Visual Aspect Previews */}
                                                        <div className="flex gap-2 flex-shrink-0">
                                                            {frontDesign?.fileUrl && (
                                                                <div
                                                                    onClick={() => setActivePreviewImage(frontDesign.fileUrl)}
                                                                    style={{ backgroundColor: tintColor }}
                                                                    className="relative w-16 h-20 border border-zinc-200 rounded-xl overflow-hidden flex items-center justify-center p-1 cursor-zoom-in hover:border-zinc-400 shadow-sm"
                                                                    title="Front Aspect Logo"
                                                                >
                                                                    <img src={frontImage} className="w-full h-full object-contain mix-blend-multiply opacity-90" />
                                                                    <div className="absolute inset-0 flex items-center justify-center p-2.5 z-20">
                                                                        <img src={frontDesign.fileUrl} className="w-[45%] h-[45%] object-contain" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {(backDesign?.fileUrlBack || backDesign?.fileUrl) && (
                                                                <div
                                                                    onClick={() => setActivePreviewImage(backDesign.fileUrlBack || backDesign.fileUrl)}
                                                                    style={{ backgroundColor: tintColor }}
                                                                    className="relative w-16 h-20 border border-zinc-200 rounded-xl overflow-hidden flex items-center justify-center p-1 cursor-zoom-in hover:border-zinc-400 shadow-sm"
                                                                    title="Back Aspect Logo"
                                                                >
                                                                    <img src={backImage} className="w-full h-full object-contain mix-blend-multiply opacity-90" />
                                                                    <div className="absolute inset-0 flex items-center justify-center p-2.5 z-20">
                                                                        <img src={backDesign.fileUrlBack || backDesign.fileUrl} className="w-[45%] h-[45%] object-contain" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Meta and details */}
                                                        <div className="flex-1 min-w-0 space-y-1">
                                                            <h4 className="font-extrabold text-zinc-950 text-xs md:text-sm leading-tight">{item.product?.name}</h4>
                                                            <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                                                <span>Size: {item.size}</span>
                                                                <span>•</span>
                                                                <span>Qty: {item.qty}</span>
                                                                <span>•</span>
                                                                <span className="inline-flex items-center gap-1">
                                                                    Color: {selectedColor}
                                                                    {selectedColor.startsWith("#") ? (
                                                                        <span style={{ backgroundColor: selectedColor }} className="w-2.5 h-2.5 rounded-full border border-zinc-300 inline-block" />
                                                                    ) : (
                                                                        <span>{{ "White": "⚪", "Black": "⚫", "Red": "🔴", "Navy": "🔵", "Gray": "🔘" }[selectedColor] || "⚪"}</span>
                                                                    )}
                                                                </span>
                                                            </div>

                                                            {/* Inspect buttons stack */}
                                                            <div className="flex flex-wrap gap-2 pt-2">
                                                                {frontDesign?.fileUrl && (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <button
                                                                            onClick={() => setActivePreviewImage(frontDesign.fileUrl)}
                                                                            className="bg-zinc-900 hover:bg-[#cc0000] text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg transition-all"
                                                                        >
                                                                            Inspect Front
                                                                        </button>
                                                                        <a
                                                                            href={frontDesign.fileUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="bg-white border border-zinc-200 text-zinc-700 text-[8px] font-black uppercase px-2 py-1 rounded-lg transition-all"
                                                                        >
                                                                            Download
                                                                        </a>
                                                                    </div>
                                                                )}
                                                                {(backDesign?.fileUrlBack || backDesign?.fileUrl) && (
                                                                    <div className="flex items-center gap-1.5 font-bold">
                                                                        <button
                                                                            onClick={() => setActivePreviewImage(backDesign.fileUrlBack || backDesign.fileUrl)}
                                                                            className="bg-zinc-900 hover:bg-[#cc0000] text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg transition-all"
                                                                        >
                                                                            Inspect Back
                                                                        </button>
                                                                        <a
                                                                            href={backDesign.fileUrlBack || backDesign.fileUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="bg-white border border-zinc-200 text-zinc-700 text-[8px] font-black uppercase px-2 py-1 rounded-lg transition-all"
                                                                        >
                                                                            Download
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Subtotal */}
                                                        <div className="text-right flex-shrink-0">
                                                            <span className="text-[9px] text-zinc-400 font-bold block uppercase tracking-wider">Subtotal</span>
                                                            <span className="font-extrabold text-zinc-950 text-sm">₹{(item.price * item.qty).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Consolidated instructions */}
                                {consolidatedInstructions && (
                                    <div className="bg-rose-50/70 border border-rose-100/80 rounded-2xl p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-[#cc0000]/10 flex items-center justify-center text-[#cc0000] text-sm font-bold flex-shrink-0">💬</div>
                                        <div>
                                            <span className="text-[9px] text-[#cc0000] font-black uppercase tracking-wider block">Fulfillment Instructions</span>
                                            <p className="text-xs font-black text-zinc-900 leading-normal italic">"{consolidatedInstructions}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="w-full pt-4 mt-4 border-t border-zinc-150 flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
                                <div className="text-center sm:text-left">
                                    <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">Order Gross Total</span>
                                    <span className="text-2xl font-black bg-gradient-to-r from-zinc-950 to-[#cc0000] bg-clip-text text-transparent">₹{order.totalPrice.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={() => setActiveDetailOrder(null)}
                                    className="bg-zinc-950 hover:bg-[#cc0000] text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all duration-200 cursor-pointer active:scale-98 w-full sm:w-auto text-center"
                                >
                                    Done, Close View
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

export default AdminOrders;
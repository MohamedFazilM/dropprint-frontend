import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const ACTION_LABELS = {
    order_placed: "Order Placed",
    status_updated: "Status Updated",
    payment_received: "Payment Received",
    product_created: "Product Created",
    product_updated: "Product Updated",
    customer_created: "Customer Created",
};

function LedgerHistoryModal({ entityId, onClose }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get(`/admin/ledger/${entityId}`)
            .then((res) => {
                setEntries(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [entityId]);

    return (
        <div className="fixed inset-0 bg-zinc-950/45 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-[fadeIn_0.3s_ease-out]">
            <style>{`
                @keyframes fadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                @keyframes modalScaleUp {
                    0% { transform: scale(0.92); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
            <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-zinc-100 relative flex flex-col animate-[modalScaleUp_0.4s_cubic-bezier(0.16,1,0.3,1)]">
                
                {/* Accent line */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 to-zinc-900" />

                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-black text-base text-zinc-900 tracking-tight uppercase">History — #{entityId}</h2>
                    <button 
                        onClick={onClose} 
                        className="absolute top-6 right-6 w-8 h-8 rounded-full border border-zinc-100 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-950 shadow-sm transition-all duration-200 cursor-pointer"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-10 gap-2 text-zinc-500">
                        <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-bold uppercase tracking-wider">Loading history...</span>
                    </div>
                ) : entries.length === 0 ? (
                    <p className="text-xs text-zinc-400 font-bold uppercase py-10 text-center">No ledger history entries found.</p>
                ) : (
                    <div className="space-y-4 overflow-y-auto pr-1">
                        {entries.map((entry) => (
                            <div key={entry.id} className="border-l-2 border-[#cc0000] pl-4 py-1.5 bg-zinc-50/40 rounded-r-xl pr-3 border-y border-r border-zinc-100/50">
                                <div className="flex justify-between items-start">
                                    <span className="font-extrabold text-xs text-zinc-900 uppercase tracking-wide">
                                        {ACTION_LABELS[entry.action] || entry.action}
                                    </span>
                                    {entry.amount != null && (
                                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50">₹{entry.amount}</span>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">{entry.description}</p>
                                <span className="text-[9px] font-bold text-zinc-400 mt-2 block tracking-wide uppercase">
                                    {new Date(entry.createdAt).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LedgerHistoryModal;
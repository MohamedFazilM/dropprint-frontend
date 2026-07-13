import { useEffect, useState, useMemo } from "react";
import axiosClient from "../../api/axiosClient";

const ACTION_LABELS = {
    order_placed: "Order Placed",
    status_updated: "Status Updated",
    payment_received: "Payment Received",
    product_created: "Product Created",
    product_updated: "Product Updated",
    customer_created: "Customer Created",
};

const ENTITY_COLORS = {
    order: "bg-blue-50 text-blue-600 border-blue-100",
    product: "bg-emerald-50 text-emerald-600 border-emerald-100",
    customer: "bg-purple-50 text-purple-600 border-purple-100",
    design: "bg-amber-50 text-amber-600 border-amber-100",
};

function AdminLedger() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("order");
    const [activeAction, setActiveAction] = useState("all");

    // Reset action filter when switching tabs
    useEffect(() => {
        setActiveAction("all");
    }, [activeTab]);

    useEffect(() => {
        axiosClient.get("/admin/ledger")
            .then((res) => {
                setEntries(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const availableActions = useMemo(() => {
        const actions = entries
            .filter(e => e.entityType === activeTab)
            .map(e => e.action);
        return ["all", ...new Set(actions)];
    }, [entries, activeTab]);

    if (loading) {
        return (
            <div style={{ fontFamily: "'Outfit', sans-serif" }} className="flex justify-center items-center min-h-[50vh]">
                <p className="text-sm font-bold text-zinc-400 animate-pulse uppercase tracking-wider">Loading activity logs...</p>
            </div>
        );
    }

    const filtered = entries.filter((entry) => {
        const matchesSearch = entry.entityId.toLowerCase().includes(search.toLowerCase()) ||
                              (entry.description || "").toLowerCase().includes(search.toLowerCase());
        const matchesType = entry.entityType === activeTab;
        const matchesAction = activeAction === "all" || entry.action === activeAction;
        return matchesSearch && matchesType && matchesAction;
    });

    return (
        <div style={{ fontFamily: "'Outfit', sans-serif" }} className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
            <div>
                <span style={{
                    display: "inline-block",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "4px",
                    textTransform: "uppercase",
                    color: "#cc0000",
                    marginBottom: "8px",
                }}>AUDITING</span>
                <h1 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "clamp(24px, 3.5vw, 36px)",
                    fontWeight: 800,
                    color: "#111",
                    letterSpacing: "-1.5px",
                    margin: "0",
                }}>Ledger Logs</h1>
            </div>

            {/* Beautiful Premium Tab Selector */}
            <div className="flex border-b border-zinc-200/60 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
                {[
                    { id: "order", label: "Orders", emoji: "📦" },
                    { id: "product", label: "Products", emoji: "👕" },
                    { id: "customer", label: "Customers", emoji: "👥" }
                ].map(tab => {
                    const count = entries.filter(e => e.entityType === tab.id).length;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer select-none active:scale-[0.98] ${
                                isActive 
                                ? "border-zinc-950 text-zinc-950" 
                                : "border-transparent text-zinc-400 hover:text-zinc-600"
                            }`}
                        >
                            <span className="text-sm">{tab.emoji}</span>
                            <span>{tab.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black transition-all ${
                                isActive ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-500"
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center flex-1 min-w-[280px]">
                    <input
                        type="text"
                        placeholder={`Search by ID or description in ${activeTab}s...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-950 flex-1 min-w-[200px] transition-colors"
                    />
                    
                    {availableActions.length > 1 && (
                        <select
                            value={activeAction}
                            onChange={(e) => setActiveAction(e.target.value)}
                            className="border border-zinc-200 bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:border-zinc-950 transition-colors"
                        >
                            <option value="all">All Actions</option>
                            {availableActions.filter(a => a !== "all").map(act => (
                                <option key={act} value={act}>
                                    {ACTION_LABELS[act] || act}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-3xl border border-zinc-200/50 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.005)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200/50 text-[10px] text-zinc-400 font-bold uppercase tracking-wider whitespace-nowrap">
                                <th className="p-4 pl-6">Entity ID</th>
                                <th className="p-4">Action</th>
                                <th className="p-4">Description</th>
                                {activeTab === "order" && <th className="p-4">Amount</th>}
                                <th className="p-4 pr-6">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200/40 text-xs">
                            {filtered.map((entry) => (
                                <tr key={entry.id} className="hover:bg-zinc-50/20 transition-colors">
                                    <td className="p-4 pl-6 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${ENTITY_COLORS[entry.entityType] || "bg-zinc-50 border-zinc-150 text-zinc-500"}`}>
                                            {entry.entityId}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-zinc-900 whitespace-nowrap">
                                        {ACTION_LABELS[entry.action] || entry.action}
                                    </td>
                                    <td className="p-4 text-zinc-500 font-medium min-w-[240px] max-w-md whitespace-normal leading-relaxed">
                                        {entry.description}
                                    </td>
                                    {activeTab === "order" && (
                                        <td className="p-4 font-black text-zinc-950 whitespace-nowrap">
                                            {entry.amount != null ? `₹${entry.amount.toLocaleString()}` : "-"}
                                        </td>
                                    )}
                                    <td className="p-4 pr-6 text-zinc-400 font-mono text-[10px] whitespace-nowrap">
                                        {new Date(entry.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-sm font-bold text-zinc-400">No matching activity entries found under this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminLedger;
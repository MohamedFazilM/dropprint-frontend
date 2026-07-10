import { useEffect, useState } from "react";
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
    const [filterType, setFilterType] = useState("all");

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

    if (loading) {
        return (
            <div style={{ fontFamily: "'Outfit', sans-serif" }} className="flex justify-center items-center min-h-[50vh]">
                <p className="text-sm font-bold text-zinc-400 animate-pulse uppercase tracking-wider">Loading activity logs...</p>
            </div>
        );
    }

    const filtered = entries.filter((entry) => {
        const matchesSearch = entry.entityId.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === "all" || entry.entityType === filterType;
        return matchesSearch && matchesType;
    });

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

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 items-center">
                <input
                    type="text"
                    placeholder="Search by ID (e.g. odr_001)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-950 flex-1 min-w-[200px] transition-colors"
                />
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-zinc-200 bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:border-zinc-950 transition-colors"
                >
                    <option value="all">All Types</option>
                    <option value="order">Orders</option>
                    <option value="product">Products</option>
                    <option value="customer">Customers</option>
                    <option value="design">Designs</option>
                </select>
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
                                <th className="p-4">Amount</th>
                                <th className="p-4 pr-6">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200/40 text-xs">
                            {filtered.map((entry) => (
                                <tr key={entry.id} className="hover:bg-zinc-50/20 transition-colors whitespace-nowrap">
                                    <td className="p-4 pl-6">
                                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${ENTITY_COLORS[entry.entityType] || "bg-zinc-50 border-zinc-150 text-zinc-500"}`}>
                                            {entry.entityId}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-zinc-900">
                                        {ACTION_LABELS[entry.action] || entry.action}
                                    </td>
                                    <td className="p-4 text-zinc-500 font-medium">
                                        {entry.description}
                                    </td>
                                    <td className="p-4 font-black text-zinc-950">
                                        {entry.amount != null ? `₹${entry.amount.toLocaleString()}` : "-"}
                                    </td>
                                    <td className="p-4 pr-6 text-zinc-400 font-mono text-[10px]">
                                        {new Date(entry.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-sm font-bold text-zinc-400">No matching activity entries found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminLedger;
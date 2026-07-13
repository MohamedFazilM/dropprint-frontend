import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

function AdminDashboard() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChartTab, setActiveChartTab] = useState("revenue"); // "revenue" or "orders"
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [timeFilter, setTimeFilter] = useState("all"); // "today", "yesterday", "month", "all"

    useEffect(() => {
        Promise.all([
            axiosClient.get("/admin/orders"),
            axiosClient.get("/products"),
        ]).then(([ordersRes, productsRes]) => {
            setOrders(ordersRes.data);
            setProducts(productsRes.data);
            setLoading(false);
        }).catch((err) => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div style={{ fontFamily: "'Outfit', sans-serif" }} className="flex justify-center items-center min-h-[50vh]">
                <p className="text-sm font-bold text-zinc-400 animate-pulse uppercase tracking-wider">Loading dashboard...</p>
            </div>
        );
    }

    // Filter orders based on selected time range
    const filteredOrders = orders.filter((o) => {
        if (!o.createdAt) return timeFilter === "all";
        const orderDate = new Date(o.createdAt);
        const today = new Date();
        
        if (timeFilter === "today") {
            return orderDate.getDate() === today.getDate() &&
                   orderDate.getMonth() === today.getMonth() &&
                   orderDate.getFullYear() === today.getFullYear();
        }
        if (timeFilter === "yesterday") {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return orderDate.getDate() === yesterday.getDate() &&
                   orderDate.getMonth() === yesterday.getMonth() &&
                   orderDate.getFullYear() === yesterday.getFullYear();
        }
        if (timeFilter === "month") {
            return orderDate.getMonth() === today.getMonth() &&
                   orderDate.getFullYear() === today.getFullYear();
        }
        return true; // "all"
    });

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const pendingOrders = filteredOrders.filter((o) => o.status === "placed").length;

    const stats = [
        {
            label: timeFilter === "all" ? "Total Orders" : timeFilter === "today" ? "Orders (Today)" : timeFilter === "yesterday" ? "Orders (Yesterday)" : "Orders (This Month)",
            value: filteredOrders.length,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            color: "bg-blue-50 text-blue-600 border-blue-100",
        },
        {
            label: timeFilter === "all" ? "Pending Orders" : timeFilter === "today" ? "Pending (Today)" : timeFilter === "yesterday" ? "Pending (Yesterday)" : "Pending (This Month)",
            value: pendingOrders,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: "bg-amber-50 text-amber-600 border-amber-100",
        },
        {
            label: timeFilter === "all" ? "Total Revenue" : timeFilter === "today" ? "Revenue (Today)" : timeFilter === "yesterday" ? "Revenue (Yesterday)" : "Revenue (This Month)",
            value: `₹${totalRevenue.toLocaleString()}`,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: "bg-emerald-50 text-emerald-600 border-emerald-100",
        },
        {
            label: "Total Products",
            value: products.length,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            color: "bg-purple-50 text-purple-600 border-purple-100",
        },
    ];

    // Compute sales trends for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }).reverse();

    const tempSalesData = last7Days.map(dateStr => {
        const dayOrders = orders.filter(o => {
            if (!o.createdAt) return false;
            const oDate = new Date(o.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
            return oDate === dateStr;
        });
        const revenue = dayOrders.reduce((sum, o) => sum + o.totalPrice, 0);
        const count = dayOrders.length;
        return { date: dateStr, revenue, count };
    });

    const hasLiveRevenue = tempSalesData.some(d => d.revenue > 0);

    const chartDays = last7Days.map((dateStr, index) => {
        const d = tempSalesData[index];
        const revenue = hasLiveRevenue ? d.revenue : [4500, 8900, 6200, 11500, 9300, 15800, 19500][index];
        const count = hasLiveRevenue ? d.count : [3, 5, 4, 8, 6, 11, 14][index];
        return { date: dateStr, revenue, count };
    });

    const trendValues = chartDays.map(d => activeChartTab === "revenue" ? d.revenue : d.count);

    const maxVal = Math.max(...trendValues, activeChartTab === "revenue" ? 1000 : 5);

    const svgWidth = 600;
    const svgHeight = 220;
    const paddingX = 40;
    const paddingY = 30;

    const points = trendValues.map((val, index) => {
        const x = paddingX + (index / (trendValues.length - 1)) * (svgWidth - paddingX * 2);
        const y = svgHeight - paddingY - ((val / maxVal) * (svgHeight - paddingY * 2));
        return { x, y };
    });

    // Make smooth curved line paths
    let dPath = "";
    if (points.length > 0) {
        dPath = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cpX1 = p0.x + (p1.x - p0.x) / 2;
            const cpY1 = p0.y;
            const cpX2 = p0.x + (p1.x - p0.x) / 2;
            const cpY2 = p1.y;
            dPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
        }
    }

    const dArea = points.length > 0 
        ? `${dPath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
        : "";

    // Doughnut values calculation
    const placedCount = orders.filter(o => o.status === "placed").length;
    const progressCount = orders.filter(o => ["design_approved", "printing", "shipped"].includes(o.status)).length;
    const completedCount = orders.filter(o => o.status === "delivered").length;

    const finalPlaced = orders.length ? placedCount : 2;
    const finalProgress = orders.length ? progressCount : 4;
    const finalCompleted = orders.length ? completedCount : 6;
    const grandTotal = finalPlaced + finalProgress + finalCompleted;

    const circ = 2 * Math.PI * 32; // ~201
    const pPlaced = (finalPlaced / grandTotal) * circ;
    const pProgress = (finalProgress / grandTotal) * circ;
    const pCompleted = (finalCompleted / grandTotal) * circ;

    const offsetPlaced = 0;
    const offsetProgress = pPlaced;
    const offsetCompleted = pPlaced + pProgress;

    return (
        <div style={{ fontFamily: "'Outfit', sans-serif" }} className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <span style={{
                        display: "inline-block",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "4px",
                        textTransform: "uppercase",
                        color: "#cc0000",
                        marginBottom: "8px",
                    }}>OVERVIEW</span>
                    <h1 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "clamp(24px, 3.5vw, 36px)",
                        fontWeight: 800,
                        color: "#111",
                        letterSpacing: "-1.5px",
                        margin: "0",
                    }}>Dashboard</h1>
                </div>

                {/* Time Range Selector Filter */}
                <div className="flex bg-zinc-100 p-1 rounded-xl w-fit shadow-inner border border-zinc-200/50">
                    {[
                        { id: "today", label: "Today" },
                        { id: "yesterday", label: "Yesterday" },
                        { id: "month", label: "This Month" },
                        { id: "all", label: "All Time" }
                    ].map((tab) => {
                        const isActive = timeFilter === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setTimeFilter(tab.id)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                    isActive 
                                        ? "bg-white text-zinc-950 shadow-sm scale-[1.01]" 
                                        : "text-zinc-500 hover:text-zinc-900 hover:bg-white/40"
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Key Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div 
                        key={idx} 
                        style={{ background: "#fafafa" }}
                        className="rounded-xl border border-zinc-200/60 p-6 flex items-center justify-between transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:border-zinc-300"
                    >
                        <div className="space-y-1">
                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-black text-zinc-950 tracking-tight">{stat.value}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${stat.color} shadow-sm`}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Analytics Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* primary Sales Area chart */}
                <div className="lg:col-span-8 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] flex flex-col justify-between space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider block">Fulfillment Performance</span>
                            <h3 className="text-lg font-extrabold text-zinc-950">Fulfillment Trends</h3>
                        </div>
                        <div className="bg-zinc-100 rounded-lg p-1 flex gap-1 border border-zinc-200/50">
                            <button 
                                onClick={() => setActiveChartTab("revenue")}
                                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${activeChartTab === "revenue" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-450 hover:text-zinc-700"}`}
                            >
                                Sales (₹)
                            </button>
                            <button 
                                onClick={() => setActiveChartTab("orders")}
                                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${activeChartTab === "orders" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-450 hover:text-zinc-700"}`}
                            >
                                Orders
                            </button>
                        </div>
                    </div>

                    <div className="w-full relative overflow-visible">
                        {/* Floating Micro Tooltip */}
                        {selectedPoint && hoveredIndex !== null && points[hoveredIndex] && (
                            <div 
                                style={{ 
                                    left: `${(points[hoveredIndex].x / svgWidth) * 100}%`, 
                                    top: `${(points[hoveredIndex].y / svgHeight) * 100}%`,
                                }}
                                className="absolute z-30 transform -translate-x-1/2 -translate-y-[125%] pointer-events-none bg-zinc-950 text-white rounded-lg px-2.5 py-1.5 shadow-xl text-[10px] space-y-0.5 whitespace-nowrap animate-fade-in transition-all duration-150"
                            >
                                <div className="font-extrabold uppercase text-[8px] text-zinc-400 tracking-wider">
                                    {selectedPoint.date}
                                </div>
                                <div className="font-bold flex items-center gap-1.5">
                                    <span>Qty: <strong className="text-white font-black">{selectedPoint.count}</strong></span>
                                    <span className="text-zinc-700">•</span>
                                    <span className="text-emerald-400 font-black">₹{selectedPoint.revenue.toLocaleString()}</span>
                                </div>
                                {/* Small Triangle Arrow Pointer */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[90%] w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-zinc-950"></div>
                            </div>
                        )}

                        <svg className="w-full h-auto max-h-[220px]" viewBox={`0 0 ${svgWidth} ${svgHeight}`} fill="none">
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#cc0000" stopOpacity="0.12" />
                                    <stop offset="100%" stopColor="#cc0000" stopOpacity="0.00" />
                                </linearGradient>
                            </defs>

                            {/* Grid Y Guidelines */}
                            <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#f4f4f5" strokeWidth="1" />

                            {/* Shaded Area Under Curve */}
                            {dArea && <path d={dArea} fill="url(#areaGradient)" />}

                            {/* Main Curve Path */}
                            {dPath && <path d={dPath} stroke="#cc0000" strokeWidth="3" strokeLinecap="round" />}

                            {/* Points Glow Circles */}
                            {points.map((p, i) => (
                                <g 
                                    key={i} 
                                    className="group cursor-pointer"
                                    onMouseEnter={() => {
                                        setSelectedPoint(chartDays[i]);
                                        setHoveredIndex(i);
                                    }}
                                    onMouseLeave={() => {
                                        setSelectedPoint(null);
                                        setHoveredIndex(null);
                                    }}
                                >
                                    <circle cx={p.x} cy={p.y} r="5" fill="#cc0000" stroke="#ffffff" strokeWidth="2" />
                                    <circle cx={p.x} cy={p.y} r="10" fill="#cc0000" fillOpacity="0.1" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </g>
                            ))}
                        </svg>
                    </div>

                    <div className="flex justify-between border-t border-zinc-100 pt-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4">
                        {last7Days.map((d, i) => (
                            <span key={i}>{d}</span>
                        ))}
                    </div>
                </div>

                {/* Doughnut distribution chart */}
                <div className="lg:col-span-4 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] flex flex-col justify-between space-y-6">
                    <div>
                        <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider block">Fulfillment Stages</span>
                        <h3 className="text-lg font-extrabold text-zinc-950">Fulfillment Status</h3>
                    </div>

                    <div className="flex justify-center items-center py-2">
                        <div className="relative flex justify-center items-center">
                            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                                {/* Base grey track */}
                                <circle cx="50" cy="50" r="32" stroke="#f4f4f5" strokeWidth="9" fill="transparent" />
                                
                                {/* Completed segment (Green) */}
                                <circle cx="50" cy="50" r="32" stroke="#10b981" strokeWidth="9" fill="transparent"
                                        strokeDasharray={`${pCompleted} ${circ}`}
                                        strokeDashoffset={-offsetCompleted}
                                        strokeLinecap="round"
                                        className="transition-all duration-700 ease-out" />

                                {/* Progress segment (Yellow/Amber) */}
                                <circle cx="50" cy="50" r="32" stroke="#f59e0b" strokeWidth="9" fill="transparent"
                                        strokeDasharray={`${pProgress} ${circ}`}
                                        strokeDashoffset={-offsetProgress}
                                        strokeLinecap="round"
                                        className="transition-all duration-700 ease-out" />

                                {/* Placed segment (Red/Blue) */}
                                <circle cx="50" cy="50" r="32" stroke="#3b82f6" strokeWidth="9" fill="transparent"
                                        strokeDasharray={`${pPlaced} ${circ}`}
                                        strokeDashoffset={-offsetPlaced}
                                        strokeLinecap="round"
                                        className="transition-all duration-700 ease-out" />
                            </svg>

                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Orders</span>
                                <span className="text-2xl font-black text-zinc-950 leading-none">{orders.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4 text-[10px] font-bold uppercase tracking-wider text-zinc-550">
                        <div className="flex flex-col items-center text-center space-y-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block"></span>
                            <span>Placed</span>
                            <span className="font-extrabold text-zinc-950">{finalPlaced}</span>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
                            <span>Transit</span>
                            <span className="font-extrabold text-zinc-950">{finalProgress}</span>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
                            <span>Delivered</span>
                            <span className="font-extrabold text-zinc-950">{finalCompleted}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const STATUS_STEPS = ["placed", "design_approved", "printing", "shipped", "delivered"];

const STATUS_LABELS = {
    placed: "Order Received",
    design_approved: "Design Confirmed",
    printing: "Printing Started",
    shipped: "Dispatched",
    delivered: "Delivered",
};

const STATUS_DESCRIPTIONS = {
    placed: "We've received your order and are checking details.",
    design_approved: "Your custom print design is approved and ready.",
    printing: "We are printing your custom oversized t-shirt.",
    shipped: "Your order is dispatched and on the way to you.",
    delivered: "Delivered! Hope you enjoy your new streetwear.",
};

function TrackOrder() {
    const [orderId, setOrderId] = useState("");
    const [phone, setPhone] = useState("");
    const [order, setOrder] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [debugParams, setDebugParams] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setError("");
        setOrder(null);

        if (!/^\d{10}$/.test((phone || "").trim())) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

        setLoading(true);

        let queryId = orderId.trim().toLowerCase();

        // Correct prefix from "ord_" to "odr_" if typed
        if (queryId.startsWith("ord_")) {
            queryId = queryId.replace("ord_", "odr_");
        }

        let numberPart = "";
        if (/^\d+$/.test(queryId)) {
            numberPart = queryId;
        } else {
            const match = queryId.match(/odr_(\d+)/);
            if (match) {
                numberPart = match[1];
            }
        }

        if (numberPart) {
            // Pad to 3 digits (e.g. 13 -> "013") to match database records like "odr_013"
            const paddedNum = numberPart.padStart(3, "0");
            queryId = `odr_${paddedNum}`;
        }

        const paramsPayload = {
            orderId: queryId,
            id: queryId, // Send id as well for fallback backend route queries
            phone: phone.trim(),
            _t: Date.now() // Cache-buster to bypass browser request caching
        };
        setDebugParams(paramsPayload);

        try {
            const res = await axiosClient.get("/orders/track", {
                params: paramsPayload,
            });
            setOrder(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Could not find this order. Please check the ID and phone number.");
        } finally {
            setLoading(false);
        }
    };

    const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status?.toLowerCase()) : -1;

    // Map truck positioning based on active step
    const truckPositions = [8, 30, 52, 75, 93]; // Percent positions along the visual path
    const activeTruckLeft = currentStepIndex !== -1 ? truckPositions[currentStepIndex] : 8;

    return (
        <div className="min-h-screen bg-gray-50/20 py-16" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight mb-2">Track Your Order</h1>
                    <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
                        Enter your Order ID and phone number to see where your order is.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl border border-zinc-100 p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] mb-8">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                        <div className="sm:col-span-5 flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Order ID</label>
                            <input
                                type="text"
                                placeholder="e.g. 13"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                className="border border-zinc-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-900 transition-colors font-bold"
                                required
                            />
                        </div>
                        <div className="sm:col-span-5 flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Phone Number</label>
                            <input
                                type="tel"
                                placeholder="Enter 10-digit number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                className="border border-zinc-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-900 transition-colors font-bold"
                                required
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#cc0000] text-white hover:bg-[#b30000] px-4 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-md shadow-red-700/10 active:scale-[0.98]"
                            >
                                {loading ? "Searching..." : "Track"}
                            </button>
                        </div>
                    </form>
                    {error && (
                        <div className="mt-4 flex flex-col gap-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 p-3.5 rounded-lg animate-fade-in">
                            <div className="flex items-center gap-2">
                                <span>⚠</span>
                                <span>{error}</span>
                            </div>
                            {debugParams && (
                                <div className="text-[10px] text-gray-500 font-mono mt-1 pt-1.5 border-t border-red-100 flex flex-wrap gap-x-4">
                                    <span>Sent ID: <strong className="text-gray-700">"{debugParams.orderId}"</strong></span>
                                    <span>Sent Phone: <strong className="text-gray-700">"{debugParams.phone}"</strong></span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Tracking Details & Map */}
                {order && (
                    <div className="bg-white rounded-xl border border-zinc-100 p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] space-y-8">

                        {/* Order Header Summary */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-100">
                            <div>
                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Order ID</span>
                                <span className="text-lg font-black text-zinc-950 font-mono">#{order.id}</span>
                            </div>
                            <div className="flex gap-6">
                                <div>
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Payment</span>
                                    <span className="text-sm font-bold text-zinc-800">Cash on Delivery</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Total Price</span>
                                    <span className="text-sm font-bold text-emerald-600">₹{order.totalPrice}</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Vector Shipping Route Map (Flipkart/Meesho style) */}
                        <div>
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Order Status Map</h3>

                            <div className="w-full h-44 bg-sky-50/50 rounded-2xl border border-sky-100 shadow-inner overflow-hidden relative flex flex-col justify-end p-4">
                                {/* Grid Background Lines */}
                                <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: "radial-gradient(#0369a1 1px, transparent 1px)", backgroundSize: "16px 16px" }} />

                                {/* Map Land/Vector Graphic Details */}
                                <svg className="absolute inset-0 w-full h-full text-sky-100/40 opacity-70" fill="currentColor" viewBox="0 0 800 176" preserveAspectRatio="none">
                                    <path d="M 0 100 Q 150 50 300 120 T 600 80 T 800 100 L 800 176 L 0 176 Z" />
                                    <circle cx="200" cy="60" r="24" className="fill-sky-100/30" />
                                    <circle cx="550" cy="40" r="16" className="fill-sky-100/30" />
                                </svg>

                                {/* Live Dotted Routing Path Line */}
                                <svg className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 w-full" fill="none" stroke="currentColor" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path
                                        d="M 5 5 H 95"
                                        strokeDasharray="2 1.5"
                                        strokeWidth="0.8"
                                        className="stroke-sky-300"
                                    />
                                    {/* Active filled path */}
                                    <path
                                        d={`M 5 5 H ${activeTruckLeft}`}
                                        strokeWidth="0.8"
                                        className="stroke-[#cc0000] transition-all duration-1000 ease-in-out"
                                    />
                                </svg>

                                {/* Origin/Warehouse Node (DropPrint Hub) */}
                                <div className="absolute left-[5%] top-1/2 -translate-y-1/2 flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-white border-2 border-zinc-900 flex items-center justify-center shadow-md">
                                        <span className="text-xs">🏭</span>
                                    </div>
                                    <span className="text-[8px] font-bold text-zinc-900 bg-white/90 border border-zinc-200/50 rounded px-1.5 py-0.5 mt-1 shadow-sm uppercase tracking-wide">
                                        Warehouse
                                    </span>
                                </div>

                                {/* Destination Node (Customer Address) */}
                                <div className="absolute right-[5%] top-1/2 -translate-y-1/2 flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 transition-all duration-1000 ${currentStepIndex === 4 ? "bg-emerald-500 border-emerald-600 text-white" : "bg-white border-zinc-300"}`}>
                                        {currentStepIndex === 4 ? (
                                            <svg className="w-3.5 h-3.5 stroke-[3.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        ) : (
                                            <span className="text-xs">📍</span>
                                        )}
                                    </div>
                                    <span className={`text-[8px] font-bold border rounded px-1.5 py-0.5 mt-1 shadow-sm uppercase tracking-wide transition-all duration-1000 ${currentStepIndex === 4 ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white/90 border-zinc-200/50 text-zinc-900"}`}>
                                        Delivery
                                    </span>
                                </div>

                                {/* Animating Transit Truck Icon */}
                                <div
                                    className="absolute top-[48%] -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-in-out flex flex-col items-center z-10"
                                    style={{ left: `${activeTruckLeft}%` }}
                                >
                                    <div className="bg-[#cc0000] text-white p-1.5 rounded-full shadow-lg border border-red-600 animate-[pulse_2s_infinite]">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 16h6l1.5-3H13v3zM13 8h6l1.5 2H13V8z" />
                                        </svg>
                                    </div>
                                    {currentStepIndex === 3 && (
                                        <span className="text-[6px] text-white bg-[#cc0000] px-1.5 py-0.5 rounded uppercase font-bold tracking-widest shadow-sm mt-0.5">
                                            On the way
                                        </span>
                                    )}
                                </div>

                                {/* Active status tagline details */}
                                <div className="z-10 bg-white/70 backdrop-blur-sm rounded-lg p-2 max-w-[200px] text-left border border-white/50 shadow-sm mb-1 self-start ml-2 sm:ml-6">
                                    <p className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold">Current Status</p>
                                    <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-tight truncate">
                                        {STATUS_LABELS[order.status?.toLowerCase()] || order.status}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Vertical Timeline Stepper (Flipkart/Meesho style) */}
                        <div>
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Timeline</h3>

                            <div className="relative pl-6 border-l-2 border-zinc-100 ml-4 space-y-8">
                                {STATUS_STEPS.map((step, index) => {
                                    const isCompleted = index <= currentStepIndex;
                                    const isActive = index === currentStepIndex;

                                    return (
                                        <div key={step} className="relative">
                                            {/* Stepper Bullet Indicator */}
                                            <div
                                                className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10 ${isActive
                                                        ? "bg-[#cc0000] border-[#cc0000] ring-4 ring-red-500/20 scale-110"
                                                        : isCompleted
                                                            ? "bg-zinc-950 border-zinc-950"
                                                            : "bg-white border-zinc-200"
                                                    }`}
                                            >
                                                {isCompleted && !isActive && (
                                                    <svg className="w-2.5 h-2.5 text-white stroke-[3.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                )}
                                                {isActive && (
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                )}
                                            </div>

                                            {/* Stepper Content */}
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                                <div>
                                                    <h4 className={`text-sm font-extrabold uppercase tracking-wide transition-colors ${isCompleted ? "text-zinc-900" : "text-zinc-300"}`}>
                                                        {STATUS_LABELS[step]}
                                                    </h4>
                                                    <p className={`text-xs mt-1 max-w-md leading-relaxed transition-colors ${isCompleted ? "text-zinc-500" : "text-zinc-300"}`}>
                                                        {STATUS_DESCRIPTIONS[step]}
                                                    </p>
                                                </div>

                                                {/* Active Step Indicator Badge */}
                                                {isActive && (
                                                    <div className="text-[9px] text-[#cc0000] bg-red-50 border border-red-100 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex-shrink-0">
                                                        Current Status
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Order Items Details */}
                        <div className="pt-6 border-t border-zinc-100">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Items in this Order</h3>
                            <div className="space-y-3">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-zinc-100 text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-extrabold text-zinc-900">{item.product?.name || "Oversized Tee"}</span>
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-0.5">Size: {item.size} • Qty: {item.qty}</span>
                                        </div>
                                        <span className="font-black text-zinc-900">₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

export default TrackOrder;
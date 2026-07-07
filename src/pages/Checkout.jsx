import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useCartStore from "../store/cartStore";
import axiosClient from "../api/axiosClient";

// Helper function to reconstruct binary File objects from persisted Base64 data URLs
const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

function Checkout() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const isDirect = query.get("direct") === "true";

    const cartItems = useCartStore((state) => state.items);
    const cartGetTotal = useCartStore((state) => state.getTotal);
    const clearCart = useCartStore((state) => state.clearCart);
    const updateDesign = useCartStore((state) => state.updateDesign);

    const directCheckoutItem = useCartStore((state) => state.directCheckoutItem);
    const setDirectCheckoutItem = useCartStore((state) => state.setDirectCheckoutItem);
    const updateDirectCheckoutDesign = useCartStore((state) => state.updateDirectCheckoutDesign);

    const navigate = useNavigate();

    const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

    // Enforce customer login/signup authentication and pre-fill form
    useEffect(() => {
        const storedUser = localStorage.getItem("customerUser");
        if (!storedUser) {
            console.log("[Checkout] Customer is unauthenticated. Redirecting to Login...");
            navigate("/login?redirect=" + encodeURIComponent(location.pathname + location.search));
        } else {
            try {
                const user = JSON.parse(storedUser);
                setForm({
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    address: user.address || ""
                });
            } catch (e) {
                console.error("[Checkout] Failed to parse customer profile:", e);
            }
        }
    }, [navigate, location]);

    const [showSuccess, setShowSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const syncInProgress = useRef(new Set());

    // Conditionally load items and totals based on direct flag (memoized to prevent infinite render loops)
    const items = useMemo(() => {
        try {
            return isDirect ? (directCheckoutItem ? [directCheckoutItem] : []) : cartItems;
        } catch (e) {
            console.error("Memo Items error:", e);
            return [];
        }
    }, [isDirect, directCheckoutItem, cartItems]);

    const getTotal = () => {
        try {
            return isDirect ? (directCheckoutItem ? directCheckoutItem.unitPrice * directCheckoutItem.qty : 0) : cartGetTotal();
        } catch (e) {
            console.error("getTotal error:", e);
            return 0;
        }
    };

    // Diagnostics Mounting Log
    useEffect(() => {
        console.log("[Checkout] Component mounted successfully.");
        console.log(`[Checkout] Mode Detected: ${isDirect ? "Direct Buy Now Flow (?direct=true)" : "Standard Cart Checkout Flow"}`);
        console.log("[Checkout] Received Items data payload:", items);
    }, [items, isDirect]);

    // Asynchronously sync any pending design uploads in the background
    useEffect(() => {
        const pendingItems = items.filter(
            (item) => item.design?.isUploading === true && !syncInProgress.current.has(item.design.id)
        );
        if (pendingItems.length === 0) {
            // Only update syncing state if not actively processing any sync task
            if (syncInProgress.current.size === 0) {
                setSyncing(false);
            }
            return;
        }

        console.log("[Checkout] Found pending background uploads to sync:", pendingItems);
        setSyncing(true);

        const uploadPendingDesigns = async () => {
            for (const item of pendingItems) {
                const designId = item.design.id;
                // Add to sync status registry to block duplicate triggers during state re-evaluations
                syncInProgress.current.add(designId);

                try {
                    // Upload Front Design if pending
                    let finalFrontDesign = null;
                    if (item.design.front) {
                        if (item.design.front.isUploading) {
                            let fileToUpload = item.design.front.localFile;
                            if (!fileToUpload && item.design.front.base64Data) {
                                console.log("[Checkout] Restoring front file from Base64...");
                                fileToUpload = dataURLtoFile(item.design.front.base64Data, "front_sticker.png");
                            }
                            if (fileToUpload) {
                                const formData = new FormData();
                                formData.append("file", fileToUpload);
                                formData.append("printArea", "Front");
                                console.log(`[Checkout] Syncing front file in background...`);
                                const res = await axiosClient.post("/designs/upload", formData, {
                                    headers: { "Content-Type": "multipart/form-data" },
                                });
                                finalFrontDesign = {
                                    id: res.data.id,
                                    fileUrl: res.data.fileUrl,
                                    printArea: "Front"
                                };
                            }
                        } else {
                            finalFrontDesign = item.design.front;
                        }
                    }

                    // Upload Back Design if pending
                    let finalBackDesign = null;
                    if (item.design.back) {
                        if (item.design.back.isUploading) {
                            let fileToUpload = item.design.back.localFile;
                            if (!fileToUpload && item.design.back.base64Data) {
                                console.log("[Checkout] Restoring back file from Base64...");
                                fileToUpload = dataURLtoFile(item.design.back.base64Data, "back_sticker.png");
                            }
                            if (fileToUpload) {
                                const formData = new FormData();
                                formData.append("file", fileToUpload);
                                formData.append("printArea", "Back");
                                console.log(`[Checkout] Syncing back file in background...`);
                                const res = await axiosClient.post("/designs/upload", formData, {
                                    headers: { "Content-Type": "multipart/form-data" },
                                });
                                finalBackDesign = {
                                    id: res.data.id,
                                    fileUrl: res.data.fileUrl,
                                    printArea: "Back"
                                };
                            }
                        } else {
                            finalBackDesign = item.design.back;
                        }
                    }

                    const finalDesign = {
                        id: (finalFrontDesign?.id || finalBackDesign?.id || "sync_done").toString(),
                        fileUrl: finalFrontDesign?.fileUrl || finalBackDesign?.fileUrl || "",
                        printArea: finalFrontDesign && finalBackDesign ? "Front & Back" : (finalFrontDesign ? "Front" : "Back"),
                        front: finalFrontDesign,
                        back: finalBackDesign
                    };

                    if (isDirect) {
                        console.log("[Checkout] Dispatching updateDirectCheckoutDesign with final ID:", finalDesign.id);
                        updateDirectCheckoutDesign(finalDesign);
                    } else {
                        console.log("[Checkout] Dispatching updateDesign with final ID:", finalDesign.id);
                        updateDesign(item.product.id, item.size, item.design.id, finalDesign);
                    }
                } catch (err) {
                    console.error("[Checkout] Failed to sync design in background:", err);
                } finally {
                    syncInProgress.current.delete(designId);
                }
            }
            console.log("[Checkout] All pending uploads background sync finished.");
            if (syncInProgress.current.size === 0) {
                setSyncing(false);
            }
        };

        uploadPendingDesigns();
    }, [items, isDirect, updateDesign, updateDirectCheckoutDesign]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (syncing || placingOrder) return;

        setPlacingOrder(true);

        const payload = {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            items: items.map((item) => {
                const getDesignId = (d) => {
                    if (!d) return null;
                    const id = d.front?.id || (d.printArea !== "Back" ? d.id : null);
                    if (id && (id === "pending" || id.toString().startsWith("pending"))) return null;
                    return id || null;
                };
                const getDesignBackId = (d) => {
                    if (!d) return null;
                    const id = d.back?.id || (d.printArea === "Back" ? d.id : null);
                    if (id && (id === "pending" || id.toString().startsWith("pending"))) return null;
                    return id || null;
                };

                return {
                    productId: item.product.id,
                    size: item.size,
                    qty: item.qty,
                    price: item.unitPrice,
                    designId: getDesignId(item.design),
                    designBackId: getDesignBackId(item.design),
                };
            }),
        };

        try {
            const response = await axiosClient.post("/orders", payload);
            setOrderId(response.data.id);
            setShowSuccess(true);
            if (isDirect) {
                setDirectCheckoutItem(null);
            } else {
                clearCart();
            }
        } catch (error) {
            console.error("Order failed:", error);
            alert("Something went wrong placing your order. Please try again.");
        } finally {
            setPlacingOrder(false);
        }
    };

    // Safe JSX Render Wrapper to catch runtime failures
    try {
        if (items.length === 0 && !showSuccess) {
            return (
                <div style={{ fontFamily: "'Outfit', sans-serif" }} className="text-center mt-20 p-6">
                    <h1 className="text-2xl font-extrabold text-zinc-800 mb-2">No Items in Cart</h1>
                    <p className="text-xs text-zinc-400 font-medium mb-6">Your customization tray is currently empty.</p>
                    <button
                        onClick={() => navigate("/shop")}
                        className="inline-flex items-center justify-center bg-zinc-950 hover:bg-zinc-800 text-white py-3 px-6 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                        Return to Catalog
                    </button>
                </div>
            );
        }

        return (
            <div style={{ fontFamily: "'Outfit', sans-serif" }} className="max-w-2xl mx-auto px-6 py-12 relative">
                <h1 className="text-3xl font-extrabold text-zinc-900 mb-6 tracking-tight">Checkout</h1>

                <div className="border border-zinc-200/50 rounded-lg p-5 mb-6 bg-white shadow-sm">
                    <h2 className="text-sm font-extrabold text-zinc-800 mb-3 uppercase tracking-wider">Order Summary</h2>
                    <div className="space-y-2">
                        {items.map((item) => (
                            <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-xs py-1 border-b border-zinc-100 last:border-0">
                                <span className="text-zinc-600 font-medium">{item.product.name} ({item.size}) x{item.qty}</span>
                                <span className="text-zinc-800 font-bold">₹{item.unitPrice * item.qty}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between font-extrabold mt-4 border-t border-zinc-200 pt-3 text-sm text-zinc-950">
                        <span>Total Cost</span>
                        <span className="text-[#cc0000]">₹{getTotal()}</span>
                    </div>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Full Name</label>
                        <input
                            type="text" name="name" placeholder="Enter your full name"
                            value={form.name} onChange={handleChange}
                            className="w-full border border-zinc-200/60 rounded-lg px-4 py-3 text-sm font-medium focus:border-zinc-900 focus:ring-0 outline-none transition-all" required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Email Address</label>
                        <input
                            type="email" name="email" placeholder="name@example.com"
                            value={form.email} onChange={handleChange}
                            className="w-full border border-zinc-200/60 rounded-lg px-4 py-3 text-sm font-medium focus:border-zinc-900 focus:ring-0 outline-none transition-all" required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Phone Number</label>
                        <input
                            type="tel" name="phone" placeholder="Enter 10-digit number"
                            value={form.phone} onChange={handleChange}
                            className="w-full border border-zinc-200/60 rounded-lg px-4 py-3 text-sm font-medium focus:border-zinc-900 focus:ring-0 outline-none transition-all" required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Delivery Address</label>
                        <textarea
                            name="address" placeholder="Flat/House no., Street, Area, Pin Code" rows="3"
                            value={form.address} onChange={handleChange}
                            className="w-full border border-zinc-200/60 rounded-lg px-4 py-3 text-sm font-medium focus:border-zinc-900 focus:ring-0 outline-none transition-all" required
                        />
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200/50 rounded-lg p-3.5 text-xs text-zinc-500 font-medium">
                        Payment Method: <strong className="text-zinc-800">Cash on Delivery</strong> (online payment coming soon)
                    </div>

                    <button
                        type="submit"
                        disabled={syncing || placingOrder}
                        className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-4 rounded-lg font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-zinc-950/10 active:scale-[0.99] cursor-pointer disabled:opacity-50"
                    >
                        {syncing ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Syncing custom design details...
                            </div>
                        ) : placingOrder ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Placing your order...
                            </div>
                        ) : (
                            "Confirm Order"
                        )}
                    </button>
                </form>

                {/* Minimalist Premium Success Modal */}
                {showSuccess && (
                    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-out]">
                        <style>{`
                            @keyframes fadeIn {
                                0% { opacity: 0; }
                                100% { opacity: 1; }
                            }
                            @keyframes modalScaleUp {
                                0% { transform: scale(0.95) translateY(10px); opacity: 0; }
                                100% { transform: scale(1) translateY(0); opacity: 1; }
                            }
                            @keyframes checkmarkGrow {
                                0% { transform: scale(0.8); opacity: 0; }
                                100% { transform: scale(1); opacity: 1; }
                            }
                        `}</style>
                        <div 
                            className="bg-white/95 border border-zinc-100 p-8 md:p-10 rounded-[32px] max-w-sm w-full shadow-[0_24px_70px_rgba(0,0,0,0.12)] text-center flex flex-col items-center justify-center relative overflow-hidden animate-[modalScaleUp_0.4s_cubic-bezier(0.16,1,0.3,1)]"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            {/* Accent Glow Element */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-zinc-900" />

                            {/* Minimal Elegant Checkmark */}
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5 animate-[checkmarkGrow_0.4s_ease-out]">
                                <svg className="w-6 h-6 text-emerald-600 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-black text-zinc-900 mb-1 tracking-tight uppercase">Order Placed!</h2>
                            <p className="text-[10px] text-zinc-400 font-extrabold tracking-widest uppercase mb-6">Thank you for your purchase</p>

                            {/* Minimal Order Details Container */}
                            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 w-full text-left space-y-3.5 mb-6 text-xs text-zinc-500 font-semibold">
                                <div className="flex justify-between items-center pb-2.5 border-b border-zinc-200/50">
                                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Order ID</span>
                                    <span className="text-zinc-900 font-extrabold font-mono text-sm bg-white border border-zinc-200/40 px-2 py-0.5 rounded shadow-sm">
                                        #{orderId}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Payment Mode</span>
                                    <span className="text-zinc-800 font-bold bg-zinc-200/55 px-2 py-0.5 rounded text-[10px] uppercase">
                                        Cash on Delivery
                                    </span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Ship To</span>
                                    <span className="text-zinc-800 font-bold text-right max-w-[170px] line-clamp-2 leading-tight">
                                        {form.name}, {form.address}
                                    </span>
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-col gap-2.5 w-full">
                                <button
                                    onClick={() => {
                                        setShowSuccess(false);
                                        navigate("/track-order");
                                    }}
                                    className="w-full bg-zinc-900 hover:bg-zinc-850 text-white py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md active:scale-[0.99]"
                                >
                                    Track Order
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSuccess(false);
                                        navigate("/");
                                    }}
                                    className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-[0.99]"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    } catch (err) {
        console.error("Checkout Render Error:", err);
        return (
            <div style={{ fontFamily: "'Outfit', sans-serif" }} className="p-8 text-center bg-red-50 text-red-700 border border-red-200/60 rounded-lg max-w-md mx-auto mt-10 shadow-sm animate-scale-up">
                <h1 className="text-xl font-bold mb-2">Checkout Render Crash</h1>
                <p className="text-sm font-medium mb-4 text-zinc-700">{err.message}</p>
                <pre className="text-[10px] text-left bg-red-100/50 p-4 rounded overflow-auto max-h-40 font-mono leading-relaxed">{err.stack}</pre>
            </div>
        );
    }
}

export default Checkout;
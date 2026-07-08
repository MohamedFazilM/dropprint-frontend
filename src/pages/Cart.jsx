import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useCartStore from "../store/cartStore";

function Cart() {
    const navigate = useNavigate();
    const items = useCartStore((state) => state.items);
    const updateQty = useCartStore((state) => state.updateQty);
    const removeFromCart = useCartStore((state) => state.removeFromCart);
    const getTotal = useCartStore((state) => state.getTotal);
    const getCount = useCartStore((state) => state.getCount);

    // Promo code state
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null); // { code: string, discountPercent: number }
    const [couponError, setCouponError] = useState("");
    const [couponSuccess, setCouponSuccess] = useState("");

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        setCouponError("");
        setCouponSuccess("");

        const codeClean = couponCode.trim().toUpperCase();
        if (!codeClean) {
            setCouponError("Please enter a code");
            return;
        }

        if (codeClean === "DROPPRINT10") {
            setAppliedCoupon({ code: "DROPPRINT10", discountPercent: 10 });
            setCouponSuccess("Code 'DROPPRINT10' applied! 10% off your items.");
            setCouponCode("");
        } else {
            setCouponError("Invalid code. Try 'DROPPRINT10'");
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponSuccess("");
        setCouponError("");
    };

    const subtotal = getTotal();
    const shippingThreshold = 1000;
    const shippingCost = subtotal >= shippingThreshold ? 0 : 99;
    const discountAmount = appliedCoupon ? Math.round(subtotal * (appliedCoupon.discountPercent / 100)) : 0;
    const grandTotal = Math.max(0, subtotal + shippingCost - discountAmount);

    const progressToFreeShipping = Math.min((subtotal / shippingThreshold) * 100, 100);
    const remainingForFreeShipping = shippingThreshold - subtotal;

    if (items.length === 0) {
        return (
            <div className="min-h-[75vh] flex flex-col items-center justify-center px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {/* SVG Empty Cart Graphic */}
                <div className="w-48 h-48 mb-6 text-gray-200 relative animate-bounce" style={{ animationDuration: "3s" }}>
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-2 w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-red-600 text-lg font-bold">!</span>
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Your Cart is Empty</h1>
                <p className="text-gray-500 max-w-sm text-center mb-8 leading-relaxed">
                    Looks like you haven't added any premium oversized drop-shoulder tees yet. Start creating your custom style now!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md">
                    <Link to="/design-studio" className="flex-1 text-center bg-[#cc0000] text-white px-6 py-3.5 rounded-2xl font-bold shadow-[0_4px_18px_rgba(204,0,0,0.2)] hover:bg-[#b30000] transition-all hover:scale-[1.02]">
                        Create Your Design
                    </Link>
                    <Link to="/shop" className="flex-1 text-center border border-gray-200 text-gray-800 bg-white px-6 py-3.5 rounded-2xl font-bold hover:bg-gray-50 transition-all hover:scale-[1.02]">
                        Browse Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {/* Step Navigation Indicators */}
            <div className="bg-white border-b border-gray-100 py-6 mb-8">
                <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="font-extrabold text-lg uppercase tracking-wider text-gray-900">Checkout Flow</span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-6 text-sm font-bold">
                        <span className="text-red-700 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-red-700 text-white flex items-center justify-center text-[10px]">1</span>
                            Cart
                        </span>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-400 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px]">2</span>
                            Shipping
                        </span>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-400 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px]">3</span>
                            Payment
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 tracking-tight flex items-baseline gap-3">
                    Shopping Cart
                    <span className="text-base text-gray-400 font-medium">({getCount()} {getCount() === 1 ? 'item' : 'items'})</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Cart Items List */}
                    <div className="lg:col-span-8 space-y-6">
                        {items.map((item) => {
                            const hasFront = !!item.design?.front?.fileUrl || (item.design?.printArea !== "Back" && !!item.design?.fileUrl);
                            const hasBack = !!item.design?.back?.fileUrl || (item.design?.printArea === "Back" && !!item.design?.fileUrl);
                            
                            const frontUrl = item.design?.front?.fileUrl || (item.design?.printArea !== "Back" ? item.design?.fileUrl : null);
                            const backUrl = item.design?.back?.fileUrl || (item.design?.printArea === "Back" ? item.design?.fileUrl : null);

                            const designId = item.design?.id || null;
                            const uniqueKey = `${item.product.id}-${item.size}-${designId}`;
                            const showBack = hasBack && !hasFront;
                            const shirtImage = showBack && item.product.imageBack
                                ? item.product.imageBack
                                : (item.product.imageMain || "https://placehold.co/400x500/f3f4f6/9ca3af?text=No+Image");

                            return (
                                <div
                                    key={uniqueKey}
                                    className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row gap-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-300 hover:translate-y-[-2px] group"
                                >
                                    {/* Product/Design Preview Mockup */}
                                    <div className="relative w-24 h-28 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden flex items-center justify-center p-1.5 flex-shrink-0 group-hover:scale-102 transition-transform duration-300">
                                        <img
                                            src={shirtImage}
                                            alt={item.product.name}
                                            className="w-full h-full object-contain"
                                            onError={(e) => { e.target.src = "https://placehold.co/400x500/f3f4f6/9ca3af?text=No+Image"; }}
                                        />
                                        {/* Overlay custom print design if it exists */}
                                        {showBack ? (
                                            backUrl && (
                                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                                    <img
                                                        src={backUrl}
                                                        alt="Custom back print overlay"
                                                        className="w-[45%] h-[45%] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] mt-1"
                                                    />
                                                </div>
                                            )
                                        ) : (
                                            frontUrl && (
                                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                                    <img
                                                        src={frontUrl}
                                                        alt="Custom front print overlay"
                                                        className="w-[45%] h-[45%] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] mt-1"
                                                    />
                                                </div>
                                            )
                                        )}
                                        {item.design && (
                                            <span className="absolute bottom-1 right-1 text-[8px] bg-[#cc0000] text-white font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                                                Custom
                                            </span>
                                        )}
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-grow flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start gap-4">
                                                <h3 className="font-extrabold text-gray-900 hover:text-red-700 transition-colors text-lg line-clamp-1">
                                                    <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
                                                </h3>
                                                <p className="font-black text-gray-900 text-lg flex-shrink-0">
                                                    ₹{item.unitPrice * item.qty}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-1.5 text-xs font-bold text-gray-500 items-center">
                                                <span className="uppercase tracking-wider">{item.product.color}</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full border border-gray-200">
                                                    Size: {item.size}
                                                </span>
                                                {item.design && (
                                                    <>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-[#cc0000] bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase tracking-wide text-[10px]">
                                                            Print Area: {item.design.printArea}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions: Quantity Selector & Remove Button */}
                                        <div className="flex justify-between items-center mt-6">
                                            {/* Quantity step counter */}
                                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm h-9">
                                                <button
                                                    onClick={() => updateQty(item.product.id, item.size, item.qty - 1, designId)}
                                                    className="w-9 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 hover:text-black font-semibold transition-colors font-mono"
                                                    aria-label="Decrease quantity"
                                                >
                                                    -
                                                </button>
                                                <span className="w-10 text-center font-bold text-sm text-gray-800">
                                                    {item.qty}
                                                </span>
                                                <button
                                                    onClick={() => updateQty(item.product.id, item.size, item.qty + 1, designId)}
                                                    className="w-9 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 hover:text-black font-semibold transition-colors font-mono"
                                                    aria-label="Increase quantity"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Remove action button */}
                                            <button
                                                onClick={() => removeFromCart(item.product.id, item.size, designId)}
                                                className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#cc0000] transition-colors uppercase tracking-wider group/remove"
                                            >
                                                <svg className="w-4 h-4 text-gray-400 group-hover/remove:text-[#cc0000] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Column: Order Summary Sidebar */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        {/* Summary Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                            <h2 className="text-xl font-extrabold text-gray-900 mb-6">Order Summary</h2>

                            {/* Free Shipping Progress Indicator */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                                    <span>Free Shipping Progress</span>
                                    <span>
                                        {subtotal >= shippingThreshold ? "Qualified!" : `₹${subtotal} / ₹${shippingThreshold}`}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 rounded-full ${subtotal >= shippingThreshold ? "bg-green-500" : "bg-[#cc0000]"}`}
                                        style={{ width: `${progressToFreeShipping}%` }}
                                    />
                                </div>
                                <p className="text-[11px] text-gray-500 mt-2 font-medium">
                                    {subtotal >= shippingThreshold ? (
                                        <span className="text-green-600 font-bold">🎉 Your order qualifies for free delivery!</span>
                                    ) : (
                                        <span>Add <span className="font-bold text-gray-800">₹{remainingForFreeShipping}</span> more to unlock FREE shipping!</span>
                                    )}
                                </p>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-4 text-sm font-semibold text-gray-500">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-gray-900 font-bold">₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Estimated Shipping</span>
                                    <span className={shippingCost === 0 ? "text-green-600 font-bold" : "text-gray-900 font-bold"}>
                                        {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
                                    </span>
                                </div>

                                {appliedCoupon && (
                                    <div className="flex justify-between text-green-600">
                                        <span className="flex items-center gap-1.5">
                                            🏷️ Coupon ({appliedCoupon.code})
                                            <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700 text-xs font-bold font-mono">×</button>
                                        </span>
                                        <span className="font-bold">-₹{discountAmount}</span>
                                    </div>
                                )}

                                <hr className="border-gray-100 my-4" />

                                <div className="flex justify-between text-base font-black text-gray-900">
                                    <span>Total</span>
                                    <span className="text-xl">₹{grandTotal}</span>
                                </div>
                            </div>

                            {/* Promo Code Input */}
                            <form onSubmit={handleApplyCoupon} className="mt-6">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Promo Code (DROPPRINT10)"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="flex-grow border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-600 transition-colors uppercase font-bold"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-gray-900 text-white hover:bg-black px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {couponError && (
                                    <p className="text-xs font-semibold text-red-600 mt-2">{couponError}</p>
                                )}
                                {couponSuccess && (
                                    <p className="text-xs font-semibold text-green-600 mt-2">{couponSuccess}</p>
                                )}
                            </form>

                            {/* Checkout CTA */}
                            <div className="mt-8">
                                <button
                                    onClick={() => {
                                        const user = localStorage.getItem("customerUser");
                                        if (user) {
                                            navigate("/checkout");
                                        } else {
                                            navigate("/login?redirect=/checkout");
                                        }
                                    }}
                                    className="bg-[#cc0000] text-white py-4 px-6 rounded-2xl w-full font-bold flex justify-center items-center gap-2 shadow-[0_6px_20px_rgba(204,0,0,0.18)] hover:bg-[#b30000] hover:shadow-[0_8px_24px_rgba(204,0,0,0.25)] transition-all duration-300 transform hover:-translate-y-0.5 text-center cursor-pointer"
                                >
                                    Proceed to Checkout
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                                <div className="flex items-center justify-center gap-1.5 mt-3 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Secure SSL Checkout
                                </div>
                            </div>
                        </div>

                        {/* Value propositions */}
                        <div className="grid grid-cols-3 gap-3 text-center text-[10px] uppercase tracking-wider font-extrabold text-gray-500 bg-white border border-gray-100 rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-lg">🚚</span>
                                <span>Free Shipping</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 border-x border-gray-100">
                                <span className="text-lg">🔄</span>
                                <span>7-Day Return</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-lg">🛡️</span>
                                <span>Secure checkout</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;
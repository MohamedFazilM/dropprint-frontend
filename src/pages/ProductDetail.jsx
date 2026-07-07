import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import useCartStore from "../store/cartStore";
import useWishlistStore from "../store/wishlistStore";
import ProductCard from "../components/ProductCard";

const SIZES = ["S", "M", "L", "XL", "XXL"];

const SIZE_GUIDE = {
    S:   "Fits 50–60 kg · Chest 38in",
    M:   "Fits 60–75 kg · Chest 40in",
    L:   "Fits 75–90 kg · Chest 42in",
    XL:  "Fits 90–105 kg · Chest 44in",
    XXL: "Fits 105–120 kg · Chest 46in",
};



function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const addToCart = useCartStore((state) => state.addToCart);
    const items = useCartStore((state) => state.items);
    const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
    const isInWishlist = useWishlistStore((state) => state.items.some((item) => item.id === Number(id)));

    const [activeImage, setActiveImage] = useState("front");
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState("M");
    const [quantity, setQuantity] = useState(1);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [showCartSuccess, setShowCartSuccess] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    useEffect(() => {
        if (showCartSuccess) {
            const timer = setTimeout(() => setShowCartSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showCartSuccess]);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        axiosClient.get(`/products/${id}`)
            .then((res) => {
                setProduct(res.data);
                return axiosClient.get("/products");
            })
            .then((res) => {
                const all = res.data;
                const filtered = all.filter(p => String(p.id) !== String(id));
                setSimilarProducts(filtered.sort(() => 0.5 - Math.random()).slice(0, 4));
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return null;
    if (!product) return <p className="text-center mt-10">Product not found.</p>;

    const isInCart = items.some(
        (item) => String(item.product.id) === String(product.id) && item.size === selectedSize && !item.design
    );

    const handleAddToCart = () => {
        addToCart(product, selectedSize, quantity);
        setShowCartSuccess(true);
    };

    const handleBuyNow = () => {
        addToCart(product, selectedSize, quantity);
        navigate(`/checkout?productId=${product.id}&size=${selectedSize}`);
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const originalPrice = Math.round(product.basePrice * 1.4);
    const discountPct = Math.round(((originalPrice - product.basePrice) / originalPrice) * 100);

    return (
        <div className="max-w-6xl mx-auto px-6 py-10" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* ── Left: Image Gallery ── */}
                <div className="flex flex-col gap-4 h-fit sticky top-24 self-start">
                    <div className="w-full bg-gray-50/50 border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex items-center justify-center p-2 relative group">
                        {product.imageBack && (
                            <>
                                <button
                                    onClick={() => setActiveImage(activeImage === "front" ? "back" : "front")}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md z-10 text-gray-800 transition-colors"
                                    aria-label="Previous image"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                </button>
                                <button
                                    onClick={() => setActiveImage(activeImage === "front" ? "back" : "front")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md z-10 text-gray-800 transition-colors"
                                    aria-label="Next image"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </>
                        )}
                        <img
                            src={activeImage === "back" && product.imageBack ? product.imageBack : (product.imageMain || "https://via.placeholder.com/500x600?text=Drop+Shoulder+Tee")}
                            alt={product.name}
                            className="w-full h-[400px] md:h-[600px] rounded-2xl object-contain transition-transform duration-300"
                        />
                    </div>

                    {product.imageBack && (
                        <div className="flex gap-3 overflow-x-auto justify-center pb-2 scrollbar-hide">
                            <button
                                onClick={() => setActiveImage("front")}
                                className={`flex-shrink-0 w-20 h-24 md:w-24 md:h-28 rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeImage === "front" ? "border-black shadow-md" : "border-gray-200 opacity-60 hover:opacity-100"}`}
                            >
                                <img src={product.imageMain || "https://via.placeholder.com/500x600?text=No+Image"} alt="Front" className="w-full h-full object-cover bg-gray-50" />
                            </button>
                            <button
                                onClick={() => setActiveImage("back")}
                                className={`flex-shrink-0 w-20 h-24 md:w-24 md:h-28 rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeImage === "back" ? "border-black shadow-md" : "border-gray-200 opacity-60 hover:opacity-100"}`}
                            >
                                <img src={product.imageBack} alt="Back" className="w-full h-full object-cover bg-gray-50" />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Right: Details ── */}
                <div className="flex flex-col py-4 gap-6">

                    {/* Name + Share */}
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            {product.name}
                        </h1>
                        {/* 7. Share Button */}
                        <button
                            onClick={handleShare}
                            className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition-all cursor-pointer ${linkCopied ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900"}`}
                        >
                            {linkCopied ? (
                                <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                                    Share
                                </>
                            )}
                        </button>
                    </div>

                    {/* Rating Row */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                            <span>4.3</span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="white" stroke="none">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </div>
                        <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map((s) => (
                                <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= 4 ? "#f59e0b" : "#d1d5db"} stroke="none">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-sm text-gray-400 font-medium">2,184 ratings</span>
                    </div>

                    {/* 6. Product Description */}
                    <p className="text-sm text-gray-500 leading-relaxed">
                        {product.description || "Premium oversized drop-shoulder tee crafted for ultimate comfort and bold self-expression. Perfect for custom prints — bring your design to life on this high-quality blank canvas."}
                    </p>

                    {/* Price Row */}
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-black text-gray-900">₹{product.basePrice}</span>
                        <span className="text-xl text-gray-400 line-through mb-1">₹{originalPrice}</span>
                        <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md mb-1 border border-green-100">{discountPct}% OFF</span>
                    </div>

                    {/* 2. Stock Badge */}
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-bold text-green-700">In Stock</span>
                        <span className="text-xs text-gray-400 font-medium">· Only 12 left</span>
                    </div>

                    <hr className="border-gray-100" />



                    {/* Size Selector + 4. Size Info */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-extrabold text-gray-900 uppercase tracking-widest">Select Size</label>
                            <button
                                onClick={() => setShowSizeGuide(true)}
                                className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                                Size Chart
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2.5 mb-3">
                            {SIZES.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`w-13 h-13 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${selectedSize === size
                                        ? "bg-black text-white shadow-lg scale-105 border-transparent"
                                        : "bg-white border-2 border-gray-200 text-gray-600 hover:border-black hover:text-black"
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                        {/* 4. Size Info Row */}
                        <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 font-medium">
                            👕 <span className="font-bold text-gray-700">{selectedSize}:</span> {SIZE_GUIDE[selectedSize]}
                        </p>
                    </div>

                    {/* 3. Quantity Selector */}
                    <div>
                        <p className="text-xs font-extrabold text-gray-900 uppercase tracking-widest mb-3">Quantity</p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="w-9 h-9 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-black hover:text-black transition-all font-bold cursor-pointer"
                            >
                                −
                            </button>
                            <span className="w-8 text-center text-base font-black text-gray-900">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => Math.min(10, q + 1))}
                                className="w-9 h-9 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-black hover:text-black transition-all font-bold cursor-pointer"
                            >
                                +
                            </button>
                            <span className="text-xs text-gray-400 font-medium ml-1">Max 10 per order</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            {isInCart ? (
                                <button
                                    onClick={() => navigate("/cart")}
                                    className="flex-1 bg-black text-white py-4 rounded-xl font-extrabold text-sm tracking-widest uppercase hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                                >
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    Go to Cart
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-white border-2 border-black text-black py-4 rounded-xl font-extrabold text-sm tracking-widest uppercase hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                    Add to Cart
                                </button>
                            )}
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 bg-red-700 text-white py-4 rounded-xl font-extrabold text-sm tracking-widest uppercase hover:bg-red-800 transition-colors shadow-xl shadow-red-700/20 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                Buy it Now
                            </button>
                        </div>

                        {/* 1. Customize CTA */}
                        <Link
                            to={`/customize?productId=${product.id}`}
                            className="w-full bg-gradient-to-r from-zinc-900 to-zinc-700 text-white py-4 rounded-xl font-extrabold text-sm tracking-widest uppercase flex items-center justify-center gap-2 hover:from-zinc-800 hover:to-zinc-600 transition-all shadow-lg group"
                        >
                            <svg className="w-5 h-5 text-yellow-400 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" />
                            </svg>
                            🎨 Customize &amp; Upload Your Design
                        </Link>
                    </div>
                </div>
            </div>

            {/* Similar Products */}
            {similarProducts.length > 0 && (
                <div className="mt-16 border-t border-gray-100 pt-16">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 uppercase tracking-widest mb-10">
                        You May Also Like
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {similarProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            )}

            {/* Size Guide Modal */}
            {showSizeGuide && (
                <div className="fixed inset-0 bg-zinc-950/45 backdrop-blur-md flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-zinc-100 relative flex flex-col">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-zinc-800 to-zinc-950 rounded-t-[24px]" />
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-black text-base text-zinc-900 tracking-tight uppercase">Size Guide</h2>
                            <button
                                onClick={() => setShowSizeGuide(false)}
                                className="absolute top-6 right-6 w-8 h-8 rounded-full border border-zinc-100 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-950 shadow-sm transition-all cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                        <table className="w-full text-xs text-center font-medium text-zinc-600 tracking-wider border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200 text-[10px] text-zinc-400 font-extrabold uppercase">
                                    <th className="py-3 text-left">Size</th>
                                    <th className="py-3">Chest (in)</th>
                                    <th className="py-3">Length (in)</th>
                                    <th className="py-3">Shoulder (in)</th>
                                </tr>
                            </thead>
                            <tbody className="font-mono text-zinc-800">
                                <tr className="border-b border-zinc-100"><td className="py-3 text-left font-sans font-extrabold">S</td><td className="py-3">38</td><td className="py-3">27</td><td className="py-3">21</td></tr>
                                <tr className="border-b border-zinc-100"><td className="py-3 text-left font-sans font-extrabold">M</td><td className="py-3">40</td><td className="py-3">28</td><td className="py-3">22</td></tr>
                                <tr className="border-b border-zinc-100"><td className="py-3 text-left font-sans font-extrabold">L</td><td className="py-3">42</td><td className="py-3">29</td><td className="py-3">23</td></tr>
                                <tr className="border-b border-zinc-100"><td className="py-3 text-left font-sans font-extrabold">XL</td><td className="py-3">44</td><td className="py-3">30</td><td className="py-3">24</td></tr>
                                <tr><td className="py-3 text-left font-sans font-extrabold">XXL</td><td className="py-3">46</td><td className="py-3">31</td><td className="py-3">25</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Cart Success Toast */}
            {showCartSuccess && (
                <div
                    className="fixed bottom-6 right-6 z-50 bg-zinc-950/95 text-white rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.3)] border border-zinc-800 flex items-center justify-between gap-4 max-w-sm w-[320px]"
                    style={{ fontFamily: "'Outfit', sans-serif", animation: "toastSlideIn 0.3s ease-out" }}
                >
                    <style>{`
                        @keyframes toastSlideIn {
                            from { transform: translateY(20px) scale(0.95); opacity: 0; }
                            to { transform: translateY(0) scale(1); opacity: 1; }
                        }
                    `}</style>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-extrabold text-white">Added successfully!</p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{product.name} · {selectedSize} · Qty {quantity}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Link to="/cart" className="text-xs font-black text-red-500 hover:text-red-400 transition-colors uppercase tracking-wider border-b border-red-500">
                            View
                        </Link>
                        <button onClick={() => setShowCartSuccess(false)} className="text-zinc-500 hover:text-zinc-300 text-lg font-bold px-1 cursor-pointer">
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetail;

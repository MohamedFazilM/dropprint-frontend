import { useState } from "react";
import { Link } from "react-router-dom";
import useWishlistStore from "../store/wishlistStore";

function StarRating({ rating }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    width="9"
                    height="9"
                    viewBox="0 0 24 24"
                    fill={star <= Math.round(rating) ? "#f59e0b" : "#d1d5db"}
                    stroke="none"
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </div>
    );
}

function ProductCard({ product }) {
    if (!product) return null;

    const [isHovered, setIsHovered] = useState(false);
    const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
    const isInWishlist = useWishlistStore((state) =>
        state.items.some((item) => item.id === product.id)
    );

    const frontImg = product.imageMain || "https://placehold.co/400x400/f5f5f5/aaaaaa?text=No+Image";
    const backImg = product.imageBack || frontImg;

    const originalPrice = Math.round(product.basePrice * 1.43);
    const discount = Math.round(((originalPrice - product.basePrice) / originalPrice) * 100);
    const rating = 4.3;
    const ratingCount = "2,184";

    return (
        <div
            className="group flex flex-col bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-250 relative"
            style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Discount Badge — top left */}
            <div className="absolute top-2.5 left-2.5 z-20 bg-[#ff6000] text-white text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shadow">
                {discount}% OFF
            </div>

            {/* Wishlist Heart — top right */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(product);
                }}
                className={`absolute top-2.5 right-2.5 z-30 w-8 h-8 flex items-center justify-center rounded-full border shadow-sm transition-all duration-200 cursor-pointer
                    ${isInWishlist
                        ? "bg-red-50 border-red-200 scale-110"
                        : "bg-white border-gray-200 hover:border-red-200 hover:bg-red-50 hover:scale-110"
                    }`}
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
                <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill={isInWishlist ? "#cc0000" : "none"}
                    stroke={isInWishlist ? "#cc0000" : "#aaa"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-colors duration-200"
                >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            </button>

            {/* Product Image */}
            <Link
                to={`/product/${product.id}`}
                className="block relative overflow-hidden bg-gray-50"
                style={{ aspectRatio: "1/1" }}
            >
                <img
                    src={frontImg}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 ease-in-out ${isHovered ? "opacity-0 scale-[1.06]" : "opacity-100 scale-100"}`}
                    onError={(e) => { e.target.src = "https://placehold.co/400x400/f5f5f5/aaaaaa?text=No+Image"; }}
                    loading="lazy"
                />
                <img
                    src={backImg}
                    alt={`${product.name} back`}
                    className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 ease-in-out ${isHovered ? "opacity-100 scale-[1.06]" : "opacity-0 scale-100"}`}
                    onError={(e) => { e.target.src = frontImg; }}
                    loading="lazy"
                />


            </Link>

            {/* Product Info */}
            <Link to={`/product/${product.id}`} className="flex flex-col px-3.5 pt-3 pb-4 gap-2">

                {/* Product Name */}
                <p className="text-[13px] text-gray-800 font-semibold line-clamp-2 leading-snug group-hover:text-[#ff6000] transition-colors duration-200">
                    {product.name}
                </p>

                {/* Rating Row */}
                <div className="flex flex-wrap items-center gap-1.5">
                    <div className="flex items-center gap-1 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-md">
                        <span className="text-[10px] font-bold text-green-700">{rating}</span>
                        <StarRating rating={rating} />
                    </div>
                    <span className="text-[9px] text-gray-400 font-medium">({ratingCount})</span>
                </div>

                {/* Price Row */}
                <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-[15px] font-bold text-gray-900">₹{product.basePrice.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
                    <span className="text-xs font-bold text-green-600">{discount}% off</span>
                </div>


            </Link>
        </div>
    );
}

export default ProductCard;
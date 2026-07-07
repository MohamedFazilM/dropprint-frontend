import { Link } from "react-router-dom";
import useWishlistStore from "../store/wishlistStore";
import ProductCard from "../components/ProductCard";

function Wishlist() {
    const wishlistItems = useWishlistStore((state) => state.items) || [];
    const clearWishlist = () => {
        useWishlistStore.setState({ items: [] });
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-[75vh] flex flex-col items-center justify-center px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {/* Heart Empty State Graphic */}
                <div className="w-48 h-48 mb-6 text-gray-200 relative animate-pulse" style={{ animationDuration: "3s" }}>
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1 w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-[#cc0000] text-lg font-bold">♥</span>
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Your Wishlist is Empty</h1>
                <p className="text-gray-500 max-w-sm text-center mb-8 leading-relaxed">
                    Save your favorite oversized drop-shoulder tees here to customize or buy them later!
                </p>

                <Link to="/shop" className="text-center bg-[#cc0000] text-white px-8 py-3.5 rounded-2xl font-bold shadow-[0_4px_18px_rgba(204,0,0,0.2)] hover:bg-[#b30000] transition-all hover:scale-[1.02] uppercase text-xs tracking-wider">
                    Browse Tees Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20 pt-10" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-4 mb-8">
                    <div>
                        <span className="text-[10px] font-bold text-[#cc0000] uppercase tracking-widest block mb-1">My Favorites</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-baseline gap-3">
                            Wishlist
                            <span className="text-base text-gray-400 font-medium">({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})</span>
                        </h1>
                    </div>
                    {wishlistItems.length > 0 && (
                        <button
                            onClick={clearWishlist}
                            className="text-xs text-gray-400 hover:text-[#cc0000] font-bold uppercase tracking-wider transition-colors cursor-pointer border border-gray-200 bg-white hover:border-red-100 rounded-xl px-4 py-2"
                        >
                            Clear All Items
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {wishlistItems.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Wishlist;

import { useEffect, useState, useMemo } from "react";
import axiosClient from "../api/axiosClient";
import ProductCard from "../components/ProductCard";
import heroImage from "./shop_images/shop.png";

const PRICE_RANGES = [
    { label: "All Prices", min: 0, max: 99999 },
    { label: "Under ₹300", min: 0, max: 300 },
    { label: "₹300 - ₹400", min: 300, max: 400 },
    { label: "₹400 - ₹500", min: 400, max: 500 },
    { label: "Above ₹500", min: 500, max: 99999 }
];

function Shop() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0]);

    useEffect(() => {
        // Try loading from localStorage cache first for instant render
        const cached = localStorage.getItem("cached_products");
        if (cached) {
            try {
                setProducts(JSON.parse(cached));
                setLoading(false);
            } catch (e) {
                // Ignore cache parsing errors
            }
        }

        axiosClient.get("/products")
            .then((response) => {
                const data = response.data.filter(p => p.id !== "1" && p.id !== "2" && p.id !== "3" && p.id !== 1 && p.id !== 2 && p.id !== 3);
                setProducts(data);
                localStorage.setItem("cached_products", JSON.stringify(data));
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching products:", error);
                setLoading(false);
            });
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const price = Number(product.basePrice);
            const matchesPrice = price >= selectedPriceRange.min && price <= selectedPriceRange.max;
            
            // Check category, or fallback to name if category is not explicitly set in DB
            const category = product.category || (product.name?.toLowerCase().includes("women") ? "Women" : (product.name?.toLowerCase().includes("men") ? "Men" : "Other"));
            const matchesCategory = selectedCategory === "All" || category === selectedCategory;

            return matchesPrice && matchesCategory;
        });
    }, [products, selectedCategory, selectedPriceRange]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <p className="text-gray-500 text-lg animate-pulse">Loading products...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Hero Banner */}
            <section className="relative w-full h-[420px] overflow-hidden">
                <style>{`
                    @keyframes fadeSlideUp {
                        0% { opacity: 0; transform: translateY(40px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                    .hero-title-anim {
                        animation: fadeSlideUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                    }
                    .hero-subtitle-anim {
                        animation: fadeSlideUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s forwards;
                        opacity: 0;
                    }
                `}</style>
                <img
                    src={heroImage}
                    alt="New Essential Tees"
                    className="w-full h-full object-cover"
                    fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-10 md:p-16">
                    <h1
                        className="hero-title-anim text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-xl"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
                            New Essential{" "}
                        </span>
                        <span className="text-[#cc0000]">
                            Tees
                        </span>
                    </h1>
                    <p
                        className="hero-subtitle-anim text-gray-200 mt-4 text-base md:text-lg max-w-xl font-medium tracking-wide drop-shadow-md"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Designed by you, crafted by us.
                    </p>
                </div>
            </section>

            {/* Body */}
            <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">
                {/* Sidebar Filter - Desktop Only */}
                <aside className="hidden md:block w-64 shrink-0" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    <div className="md:sticky md:top-12 md:pr-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Filters</h2>
                        </div>

                        {/* Category Filter */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-5">Category</h3>
                            <div className="flex flex-col gap-4">
                                {["All", "Men", "Women"].map((cat) => (
                                    <label key={cat} className="flex items-center cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat}
                                                checked={selectedCategory === cat}
                                                onChange={() => setSelectedCategory(cat)}
                                                className="peer sr-only"
                                            />
                                            <div className="w-5 h-5 border-2 border-gray-300 rounded-sm peer-checked:bg-black peer-checked:border-black transition-all"></div>
                                            <svg className="w-3 h-3 text-white absolute inset-0 m-auto opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                        <span className={`ml-4 text-sm transition-colors ${selectedCategory === cat ? "text-black font-extrabold" : "text-gray-500 font-medium group-hover:text-gray-900"}`}>
                                            {cat}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <hr className="border-gray-200 my-8" />

                        {/* Price Range Filter Checkboxes */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-5">Price Range</h3>
                            <div className="flex flex-col gap-4">
                                {PRICE_RANGES.map((range) => (
                                    <label key={range.label} className="flex items-center cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="priceRange"
                                                checked={selectedPriceRange.label === range.label}
                                                onChange={() => setSelectedPriceRange(range)}
                                                className="peer sr-only"
                                            />
                                            <div className="w-5 h-5 border-2 border-gray-300 rounded-sm peer-checked:bg-black peer-checked:border-black transition-all"></div>
                                            <svg className="w-3 h-3 text-white absolute inset-0 m-auto opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                        <span className={`ml-4 text-sm transition-colors ${selectedPriceRange.label === range.label ? "text-black font-extrabold" : "text-gray-500 font-medium group-hover:text-gray-900"}`}>
                                            {range.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => { setSelectedPriceRange(PRICE_RANGES[0]); setSelectedCategory("All"); }}
                            className="w-full mt-4 py-3 text-xs font-extrabold text-black uppercase tracking-widest border-2 border-black hover:bg-[#cc0000] hover:border-[#cc0000] hover:text-white transition-colors duration-300"
                        >
                            Clear Filters
                        </button>
                    </div>
                </aside>

                {/* Product Grid */}
                <main className="flex-1">
                    {/* Horizontal Filter Bar - Mobile Only */}
                    <div className="md:hidden mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xl font-extrabold text-gray-900">Shop</h2>
                            <span className="text-xs text-gray-500 font-bold">
                                {filteredProducts.length} products
                            </span>
                        </div>
                        
                        {/* Horizontal Categories Scroll */}
                        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-4 px-4">
                            {["All", "Men", "Women"].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`flex-shrink-0 px-4 py-1.5 rounded-md text-xs font-bold transition-all border ${
                                        selectedCategory === cat
                                            ? "bg-black text-white border-black"
                                            : "bg-white text-gray-600 border-gray-200"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
 
                        {/* Horizontal Price Ranges Scroll */}
                        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-4 px-4 mt-2">
                            {PRICE_RANGES.map((range) => (
                                <button
                                    key={range.label}
                                    onClick={() => setSelectedPriceRange(range)}
                                    className={`flex-shrink-0 px-4 py-1.5 rounded-md text-xs font-bold transition-all border ${
                                        selectedPriceRange.label === range.label
                                            ? "bg-black text-white border-black"
                                            : "bg-white text-gray-600 border-gray-200"
                                    }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
 
                        {/* Compact Reset for Mobile */}
                        {(selectedCategory !== "All" || selectedPriceRange.label !== "All Prices") && (
                            <div className="flex justify-end mt-2">
                                <button 
                                    onClick={() => { setSelectedPriceRange(PRICE_RANGES[0]); setSelectedCategory("All"); }}
                                    className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider bg-red-50 px-3 py-1 rounded-md border border-red-100"
                                >
                                    Clear Filters ✕
                                </button>
                            </div>
                        )}
                    </div>
 
                    {/* Desktop Header */}
                    <div className="hidden md:flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Shop</h2>
                        <span className="text-sm text-gray-500">
                            {filteredProducts.length} products
                        </span>
                    </div>
 
                    {filteredProducts.length === 0 ? (
                        <div className="text-center text-gray-400 mt-20 p-8 border-2 border-dashed border-gray-200 rounded-lg">
                            <p className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">No products found</p>
                            <p className="text-xs text-gray-400">Try adjusting your filters or price ranges.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Shop;
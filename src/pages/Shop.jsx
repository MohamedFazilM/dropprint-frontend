import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import ProductCard from "../components/ProductCard";
import heroImage from "./shop_images/shop.png";

function Shop() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [priceRange, setPriceRange] = useState(1000);
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        axiosClient.get("/products")
            .then((response) => {
                console.log(response.data);
                const data = response.data;
                setProducts(data);

                const prices = data
                    .map((p) => Number(p.basePrice))
                    .filter((p) => !isNaN(p));

                if (prices.length > 0) {
                    const highest = Math.max(...prices);
                    setMaxPrice(highest);
                    setPriceRange(highest);
                }

                setLoading(false);
            }
            )
            .catch((error) => {
                console.error("Error fetching products:", error);
                setLoading(false);
            });
    }, []);

    const filteredProducts = products.filter((product) => {
        const matchesPrice = Number(product.basePrice) <= priceRange;
        // Check category, or fallback to name if category is not explicitly set in DB
        const category = product.category || (product.name?.toLowerCase().includes("women") ? "Women" : (product.name?.toLowerCase().includes("men") ? "Men" : "Other"));
        const matchesCategory = selectedCategory === "All" || category === selectedCategory;

        return matchesPrice && matchesCategory;
    });


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
                {/* Sidebar Filter */}
                <aside className="w-full md:w-64 shrink-0" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    <div className="md:sticky md:top-12 md:pr-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Filters</h2>
                        </div>

                        {/* Category Filter */}
                        <div className="mb-10">
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

                        {/* Price Filter */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Max Price</h3>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max={maxPrice || 1000}
                                value={priceRange}
                                onChange={(e) => setPriceRange(Number(e.target.value))}
                                className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-black"
                            />

                            <div className="flex justify-between items-center mt-5">
                                <span className="text-sm font-bold text-gray-400">₹0</span>
                                <span className="text-sm font-bold text-gray-900 px-3 py-1 bg-gray-100 rounded-md">
                                    ₹{priceRange}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => { setPriceRange(maxPrice); setSelectedCategory("All"); }}
                            className="w-full mt-4 py-3 text-xs font-extrabold text-black uppercase tracking-widest border-2 border-black hover:bg-red-700 hover:border-red-700 hover:text-white transition-colors duration-300"
                        >
                            Clear Filters
                        </button>
                    </div>
                </aside>

                {/* Product Grid */}
                <main className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Shop</h2>
                        <span className="text-sm text-gray-500">
                            {filteredProducts.length} products
                        </span>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <p className="text-center text-gray-400 mt-20">
                            No products found in this range.
                        </p>
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
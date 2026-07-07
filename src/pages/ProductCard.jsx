import { useState } from "react";
import { Link } from "react-router-dom";
import useCartStore from "../store/cartStore";

const SIZES = ["S", "M", "L", "XL", "XXL"];

function ProductCard({ product }) {
    const [isHovered, setIsHovered] = useState(false);

    const frontImg = product.imageMain
        || "https://placehold.co/400x500/f3f4f6/9ca3af?text=No+Image";
    const backImg = product.imageBack || frontImg;

    return (
        <div className="flex flex-col group">
            {/* Image Block */}
            <Link
                to={`/product/${product.id}`}
                className="block relative w-full overflow-hidden rounded-xl bg-gray-100"
                style={{ aspectRatio: "3/4" }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Front Image */}
                <img
                    src={frontImg}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? "opacity-0" : "opacity-100"}`}
                    onError={(e) => { e.target.src = "https://placehold.co/400x500/f3f4f6/9ca3af?text=No+Image"; }}
                />

                {/* Back Image */}
                <img
                    src={backImg}
                    alt={`${product.name} back`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}
                    onError={(e) => { e.target.src = frontImg; }}
                />
            </Link>

            {/* Info Block */}
            <Link to={`/product/${product.id}`} className="mt-3 px-1 space-y-0.5">
                <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-red-700 transition-colors">
                    {product.name}
                </h3>
                <p className="text-xs text-gray-400">{product.color} · {product.fabricInfo}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-gray-900">₹{product.basePrice}</span>
                </div>
            </Link>
        </div>
    );
}

export default ProductCard;
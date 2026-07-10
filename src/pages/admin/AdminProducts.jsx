import { useEffect, useState, useRef } from "react";
import axiosClient from "../../api/axiosClient";
import LedgerHistoryModal from "../../components/LedgerHistoryModal";

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        name: "", color: "", basePrice: "", fabricInfo: "",
        gsm: "", imageMain: "", imageBack: "", status: "active",
    });
    const [editingId, setEditingId] = useState(null);
    const [historyEntityId, setHistoryEntityId] = useState(null);
    const [activePreviewImage, setActivePreviewImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successPopup, setSuccessPopup] = useState(null);
    const formRef = useRef(null);

    // File states
    const [frontFile, setFrontFile] = useState(null);
    const [backFile, setBackFile] = useState(null);
    const [frontPreview, setFrontPreview] = useState(null);
    const [backPreview, setBackPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        axiosClient.get("/products")
            .then((res) => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFrontFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFrontFile(file);
            setFrontPreview(URL.createObjectURL(file));
        }
    };

    const handleBackFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBackFile(file);
            setBackPreview(URL.createObjectURL(file));
        }
    };

    const uploadImageIfNeeded = async (file, existingUrl) => {
        if (!file) return existingUrl || "";
        const formData = new FormData();
        formData.append("file", file);
        const res = await axiosClient.post("/admin/products/upload-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data.url;
    };

    const resetForm = () => {
        setForm({
            name: "", color: "", basePrice: "", fabricInfo: "",
            gsm: "", imageMain: "", imageBack: "", status: "active",
        });
        setEditingId(null);
        setFrontFile(null);
        setBackFile(null);
        setFrontPreview(null);
        setBackPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            const imageMain = await uploadImageIfNeeded(frontFile, form.imageMain);
            const imageBack = await uploadImageIfNeeded(backFile, form.imageBack);

            const payload = {
                ...form,
                basePrice: parseFloat(form.basePrice),
                gsm: parseInt(form.gsm) || 0,
                imageMain,
                imageBack,
            };

            if (editingId) {
                await axiosClient.put(`/admin/products/${editingId}`, payload);
            } else {
                await axiosClient.post("/admin/products", payload);
            }

            const successMsg = editingId ? "Product details updated successfully!" : "New product added to catalog successfully!";
            resetForm();
            setIsModalOpen(false);
            fetchProducts();
            setSuccessPopup(successMsg);
        } catch (err) {
            console.error(err);
            alert("Failed to save product");
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (product) => {
        setForm({
            name: product.name,
            color: product.color,
            basePrice: product.basePrice,
            fabricInfo: product.fabricInfo,
            gsm: product.gsm,
            imageMain: product.imageMain || "",
            imageBack: product.imageBack || "",
            status: product.status,
        });
        setFrontPreview(product.imageMain || null);
        setBackPreview(product.imageBack || null);
        setFrontFile(null);
        setBackFile(null);
        setEditingId(product.id);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!editingId) return;
        if (!window.confirm(`Are you sure you want to delete ${form.name || "this product"}?`)) return;

        try {
            const res = await axiosClient.delete(`/admin/products/${editingId}`);
            resetForm();
            setIsModalOpen(false);
            fetchProducts();
            setSuccessPopup(res.data.message || "Product deleted successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to delete product");
        }
    };

    if (loading) {
        return (
            <div style={{ fontFamily: "'Outfit', sans-serif" }} className="flex justify-center items-center min-h-[50vh]">
                <p className="text-sm font-bold text-zinc-400 animate-pulse uppercase tracking-wider">Loading products catalog...</p>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Outfit', sans-serif" }} className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-150/40">
                <div>
                    <span className="text-[10px] font-black text-[#cc0000] uppercase tracking-widest block mb-0.5">Catalog</span>
                    <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">Products</h1>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-zinc-950 hover:bg-[#cc0000] text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md flex items-center gap-2 active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                </button>
            </div>

            {/* Product Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <style>{`
                        @keyframes fadeIn {
                            0% { opacity: 0; }
                            100% { opacity: 1; }
                        }
                        @keyframes modalScaleUp {
                            0% { transform: scale(0.95); opacity: 0; }
                            100% { transform: scale(1); opacity: 1; }
                        }
                    `}</style>
                    <div 
                        className="bg-white border border-zinc-200 rounded-xl p-6 md:p-8 max-w-4xl w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-[modalScaleUp_0.3s_cubic-bezier(0.16,1,0.3,1)]" 
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button 
                            type="button"
                            onClick={() => { resetForm(); setIsModalOpen(false); }}
                            className="absolute top-6 right-6 w-8 h-8 rounded-full border border-zinc-150 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-955 transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                            ✕
                        </button>

                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest pb-3 border-b border-zinc-100">
                            {editingId ? "Edit Product Details" : "Create New Product"}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider block">Product Name</label>
                                    <input name="name" placeholder="e.g. Classic Oversized" value={form.name} onChange={handleChange} className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-950 bg-white" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-zinc-455 uppercase tracking-wider block">Base Color</label>
                                    <input name="color" placeholder="e.g. Off-White" value={form.color} onChange={handleChange} className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-955 bg-white" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-zinc-455 uppercase tracking-wider block">Base Price (INR)</label>
                                    <input name="basePrice" type="number" placeholder="e.g. 499" value={form.basePrice} onChange={handleChange} className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-955 bg-white" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-zinc-455 uppercase tracking-wider block">Fabric Details</label>
                                    <input name="fabricInfo" placeholder="e.g. 100% Combed Cotton" value={form.fabricInfo} onChange={handleChange} className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-955 bg-white" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-zinc-455 uppercase tracking-wider block">GSM Density</label>
                                    <input name="gsm" type="number" placeholder="e.g. 240" value={form.gsm} onChange={handleChange} className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-955 bg-white" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-zinc-455 uppercase tracking-wider block">Catalog Status</label>
                                    <select name="status" value={form.status} onChange={handleChange} className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-zinc-955 bg-white cursor-pointer">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Front Image */}
                                <div className="bg-zinc-50/50 border border-zinc-200/50 rounded-lg p-5 space-y-3 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider block mb-1">Front Layout Mockup</span>
                                        {frontPreview ? (
                                            <img
                                                src={frontPreview}
                                                alt="Front preview"
                                                className="w-full h-44 object-contain rounded-lg mb-3 border border-zinc-100 bg-white"
                                            />
                                        ) : (
                                            <div className="w-full h-44 rounded-lg border-2 border-dashed border-zinc-200 bg-white flex flex-col items-center justify-center text-zinc-400 text-xs font-medium mb-3">
                                                <span>No Preview Selected</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFrontFileChange}
                                            className="text-xs w-full file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-zinc-150 file:text-zinc-700 hover:file:bg-zinc-250 cursor-pointer"
                                        />
                                        <input
                                            name="imageMain"
                                            placeholder="Or enter direct image URL"
                                            value={form.imageMain}
                                            onChange={handleChange}
                                            className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-zinc-955 bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Back Image */}
                                <div className="bg-zinc-50/50 border border-zinc-200/50 rounded-lg p-5 space-y-3 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider block mb-1">Back Layout Mockup</span>
                                        {backPreview ? (
                                            <img
                                                src={backPreview}
                                                alt="Back preview"
                                                className="w-full h-44 object-contain rounded-lg mb-3 border border-zinc-100 bg-white"
                                            />
                                        ) : (
                                            <div className="w-full h-44 rounded-lg border-2 border-dashed border-zinc-200 bg-white flex flex-col items-center justify-center text-zinc-400 text-xs font-medium mb-3">
                                                <span>No Preview Selected</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleBackFileChange}
                                            className="text-xs w-full file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-zinc-150 file:text-zinc-700 hover:file:bg-zinc-250 cursor-pointer"
                                        />
                                        <input
                                            name="imageBack"
                                            placeholder="Or enter direct image URL"
                                            value={form.imageBack}
                                            onChange={handleChange}
                                            className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-zinc-955 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Buttons actions */}
                            <div className="flex justify-between items-center pt-4 border-t border-zinc-150">
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="bg-zinc-950 hover:bg-[#cc0000] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
                                    >
                                        {uploading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => { resetForm(); setIsModalOpen(false); }} 
                                        className="border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-650 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                {editingId && (
                                    <button 
                                        type="button" 
                                        onClick={handleDelete} 
                                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer active:scale-95"
                                    >
                                        Delete Product
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-zinc-200/50 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200/50 text-[10px] text-zinc-400 font-bold uppercase tracking-wider whitespace-nowrap">
                                <th className="p-4 pl-6">Mockups (Front / Back)</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Color</th>
                                <th className="p-4">Base Price</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                                <th className="p-4 pr-6 text-center">History</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200/40 text-xs font-medium">
                            {products.map((p) => (
                                <tr key={p.id} className="hover:bg-zinc-50/20 transition-colors whitespace-nowrap">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-2">
                                            {/* Front Mockup */}
                                            <div className="relative">
                                                {p.imageMain ? (
                                                    <img 
                                                        src={p.imageMain} 
                                                        alt="Front Layout" 
                                                        onClick={() => setActivePreviewImage(p.imageMain)}
                                                        className="w-10 h-10 object-contain rounded-lg border border-zinc-100 bg-zinc-50 hover:border-zinc-400 transition-all cursor-zoom-in relative z-20" 
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-zinc-50 rounded-lg border border-zinc-100 flex items-center justify-center text-[8px] text-zinc-400 font-bold uppercase">
                                                        Front
                                                    </div>
                                                )}
                                            </div>

                                            {/* Back Mockup */}
                                            <div className="relative">
                                                {p.imageBack ? (
                                                    <img 
                                                        src={p.imageBack} 
                                                        alt="Back Layout" 
                                                        onClick={() => setActivePreviewImage(p.imageBack)}
                                                        className="w-10 h-10 object-contain rounded-lg border border-zinc-100 bg-zinc-50 hover:border-zinc-400 transition-all cursor-zoom-in relative z-20" 
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-zinc-50 rounded-lg border border-zinc-100 flex items-center justify-center text-[8px] text-zinc-400 font-bold uppercase">
                                                        Back
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-zinc-900">{p.name}</td>
                                    <td className="p-4 text-zinc-500">{p.color}</td>
                                    <td className="p-4 font-black text-zinc-950">₹{p.basePrice}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${p.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => handleEdit(p)} 
                                            className="text-[#cc0000] hover:underline font-bold transition-colors cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                    <td className="p-4 pr-6 text-center">
                                        <button 
                                            onClick={() => setHistoryEntityId(p.id)} 
                                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                        >
                                            View Audit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {historyEntityId && (
                <LedgerHistoryModal entityId={historyEntityId} onClose={() => setHistoryEntityId(null)} />
            )}

            {activePreviewImage && (
                <div 
                    onClick={() => setActivePreviewImage(null)}
                    className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-zoom-out"
                >
                    <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-3xl p-6 border border-zinc-200/50 shadow-2xl overflow-hidden flex flex-col items-center justify-center animate-scale-up" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setActivePreviewImage(null)}
                            className="absolute top-4 right-4 bg-zinc-100 hover:bg-zinc-250 text-zinc-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                        >
                            ✕
                        </button>
                        <img 
                            src={activePreviewImage} 
                            alt="Mockup Preview" 
                            className="max-w-full max-h-[70vh] object-contain rounded-2xl"
                        />
                    </div>
                </div>
            )}

            {/* Custom Success Dialog Box */}
            {successPopup && (
                <div className="fixed inset-0 bg-zinc-950/45 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
                    <div 
                        className="bg-white border border-zinc-200 rounded-xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4 animate-[modalScaleUp_0.3s_cubic-bezier(0.16,1,0.3,1)]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold border border-emerald-100 shadow-sm animate-bounce">
                            ✓
                        </div>
                        <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Success</h4>
                        <p className="text-xs text-zinc-500 font-bold leading-relaxed">{successPopup}</p>
                        <button
                            onClick={() => setSuccessPopup(null)}
                            className="w-full bg-zinc-950 hover:bg-[#cc0000] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminProducts;
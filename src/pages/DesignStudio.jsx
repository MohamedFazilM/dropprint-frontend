import { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import useImage from "use-image";
import axiosClient from "../api/axiosClient";
import useCartStore from "../store/cartStore";

// Modular 3D Customizer components
import TShirtViewer from "../components/TShirtViewer";

const PRINT_AREAS = ["Front", "Back"];
const BASE_PRICE_ADDON = 99;

// T-shirt background Konva layer
function TShirtBackground({ imageUrl }) {
    const [image] = useImage(imageUrl, "anonymous");
    if (!image) return null;
    return (
        <KonvaImage
            image={image}
            x={0}
            y={0}
            width={400}
            height={500}
            listening={false}
        />
    );
}

function DesignImage({ imageUrl, isSelected, onSelect, shapeProps, onChange }) {
    const [image] = useImage(imageUrl, imageUrl?.startsWith("blob:") ? undefined : "anonymous");
    const shapeRef = useRef();
    const trRef = useRef();

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    let dWidth = 120;
    let dHeight = 120;
    if (image) {
        const aspect = image.width / image.height;
        if (aspect > 1) {
            dWidth = 160;
            dHeight = 160 / aspect;
        } else {
            dHeight = 160;
            dWidth = 160 * aspect;
        }
    }

    return (
        <>
            <KonvaImage
                image={image}
                ref={shapeRef}
                width={dWidth}
                height={dHeight}
                {...shapeProps}
                draggable
                opacity={1.0}
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={(e) => {
                    onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() });
                }}
                onTransformEnd={() => {
                    const node = shapeRef.current;
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        scaleX: node.scaleX(),
                        scaleY: node.scaleY(),
                    });
                }}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (Math.abs(newBox.width) < 15 || Math.abs(newBox.height) < 15) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </>
    );
}

function DesignStudio() {
    const [searchParams] = useSearchParams();
    const productId = searchParams.get("productId");
    const navigate = useNavigate();
    const addToCart = useCartStore((state) => state.addToCart);
    const setDirectCheckoutItem = useCartStore((state) => state.setDirectCheckoutItem);

    const [allProducts, setAllProducts] = useState([
        { id: 1, name: "Base Tee", basePrice: 249, color: "White" },
        { id: 2, name: "Heavyweight Oversized Tee", basePrice: 349, color: "Black" },
        { id: 3, name: "Luxury Streetwear Tee", basePrice: 449, color: "Gray" }
    ]);
    const [product, setProduct] = useState({ id: 1, name: "Base Tee", basePrice: 249, color: "White" });
    const [printArea, setPrintArea] = useState("Front");
    const [frontFile, setFrontFile] = useState(null);
    const [frontPreviewUrl, setFrontPreviewUrl] = useState(null);
    const [frontShapeProps, setFrontShapeProps] = useState({
        x: 130,
        y: 160,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
    });
    const [backFile, setBackFile] = useState(null);
    const [backPreviewUrl, setBackPreviewUrl] = useState(null);
    const [backShapeProps, setBackShapeProps] = useState({
        x: 130,
        y: 160,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
    });
    const [size, setSize] = useState("M");
    const [uploading, setUploading] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [pendingTransitionUrl, setPendingTransitionUrl] = useState(null);
    const [render3D, setRender3D] = useState(true);

    // Calculate customization charge based on uploaded graphics (₹249 per side)
    const priceAddon = (frontFile && backFile) ? (BASE_PRICE_ADDON * 2) : BASE_PRICE_ADDON;

    // Controls
    const [isOrbiting, setIsOrbiting] = useState(false);
    const [rotationY, setRotationY] = useState(0);

    // Rotation Drag interaction references
    const dragStartRef = useRef(null);
    const startFrameRef = useRef(0);
    const [isDragging, setIsDragging] = useState(false);

    // 5 Manual colors: White, Black, Red, Navy, Gray
    const [selectedColor, setSelectedColor] = useState("White");

    // 3D Diagnostics & loading state
    const [modelLoaded, setModelLoaded] = useState(false);
    // Handle transition reactive unmounting of Konva selection safely
    useEffect(() => {
        if (!isSelected && !render3D && pendingTransitionUrl) {
            const url = pendingTransitionUrl;
            console.log("[DesignStudio] 3D Canvas unmounted and selection cleared safely. Navigating to:", url);
            // Delay navigation out of the current React commit tick entirely
            setTimeout(() => {
                navigate(url);
            }, 0);
            setPendingTransitionUrl(null);
        }
    }, [isSelected, render3D, pendingTransitionUrl, navigate]);

    // Intercept clicks to navigate away and unmount 3D canvas safely first
    useEffect(() => {
        const handleGlobalClick = (e) => {
            const anchor = e.target.closest("a");
            if (anchor) {
                const href = anchor.getAttribute("href");
                // If it is a navigation route to another page
                if (href && href.startsWith("/") && !href.startsWith("/design-studio")) {
                    console.log("[DesignStudio] Navigating away. Safely unmounting 3D Canvas first for target:", href);
                    e.preventDefault();
                    e.stopPropagation();

                    // 1. Disable 3D render to trigger clean unmount
                    setRender3D(false);

                    // 2. Execute router transition after 150ms
                    setTimeout(() => {
                        navigate(href);
                    }, 150);
                }
            }
        };

        window.addEventListener("click", handleGlobalClick, true); // Capture phase intercept
        return () => window.removeEventListener("click", handleGlobalClick, true);
    }, [navigate]);

    const [debugInfo, setDebugInfo] = useState({
        status: "Connecting to 3D Canvas...",
        boxSize: "",
        boxCenter: "",
        meshes: []
    });

    const handleDebugInfo = (info) => {
        setDebugInfo(info);
        if (info && info.status && info.status.toLowerCase().includes("successfully")) {
            setModelLoaded(true);
        }
    };

    const [frontDesignImage] = useImage(frontPreviewUrl, frontPreviewUrl?.startsWith("blob:") ? undefined : "anonymous");
    const [backDesignImage] = useImage(backPreviewUrl, backPreviewUrl?.startsWith("blob:") ? undefined : "anonymous");

    // Fetch product details
    useEffect(() => {
        if (productId) {
            axiosClient.get(`/products/${productId}`).then((res) => {
                if (res.data) {
                    setProduct(res.data);
                    if (res.data.color) setSelectedColor(res.data.color);
                }
            }).catch((err) => {
                console.log("[DesignStudio] Could not fetch product by ID, using local template:", err);
            });
        } else {
            // Keep the clean custom blank templates for design studio base selection
            setProduct(allProducts[0]);
            if (allProducts[0].color) setSelectedColor(allProducts[0].color);
        }
    }, [productId]);

    const handleDragStart = (e) => {
        if (!isOrbiting) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        dragStartRef.current = clientX;
        startFrameRef.current = rotationY;
        setIsDragging(true);
    };

    const handleDragMove = (e) => {
        if (!isOrbiting || dragStartRef.current === null) return;
        if (e.cancelable) e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const dx = clientX - dragStartRef.current;
        const sensitivity = 150;
        const angleOffset = (dx / sensitivity) * Math.PI;
        setRotationY(startFrameRef.current + angleOffset);
    };

    const handleDragEnd = () => {
        dragStartRef.current = null;
        setIsDragging(false);
    };

    useEffect(() => {
        if (!isOrbiting) {
            setRotationY(printArea === "Front" ? 0 : Math.PI);
        }
    }, [printArea, isOrbiting]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (printArea === "Front") {
                setFrontFile(file);
                setFrontPreviewUrl(URL.createObjectURL(file));
            } else {
                setBackFile(file);
                setBackPreviewUrl(URL.createObjectURL(file));
            }
            setIsSelected(true);
        }
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;

                    const maxDim = 800;
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert transparent PNG to optimized WebP to shrink file sizes by up to 90%
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const newFilename = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                            const compressedFile = new File([blob], newFilename, {
                                type: "image/webp",
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file);
                        }
                    }, "image/webp", 0.60);
                };
            };
        });
    };

    const handleAddToCart = async (autoRedirect = true, targetPath = "/cart") => {
        if (!frontFile && !backFile) {
            alert("Please upload at least one design (Front or Back) first.");
            return;
        }
        if (!product) {
            alert("No base product selected.");
            return;
        }

        // OPTIMIZATION: Route instantly for Buy Now and run design upload in checkout background
        if (targetPath === "/checkout") {
            console.log("[DesignStudio] Buy Now flow initiated.");
            try {
                let frontBase64 = null;
                let backBase64 = null;

                if (frontFile) {
                    let uploadFile = frontFile;
                    if (frontFile.size > 200 * 1024) {
                        console.log(`[DesignStudio] Compressing front file...`);
                        uploadFile = await compressImage(frontFile);
                    }
                    frontBase64 = await fileToBase64(uploadFile);
                }

                if (backFile) {
                    let uploadFile = backFile;
                    if (backFile.size > 200 * 1024) {
                        console.log(`[DesignStudio] Compressing back file...`);
                        uploadFile = await compressImage(backFile);
                    }
                    backBase64 = await fileToBase64(uploadFile);
                }

                const tempDesignId = "pending_" + Date.now();
                const tempDesign = {
                    id: tempDesignId,
                    fileUrl: frontPreviewUrl || backPreviewUrl || "",
                    printArea: frontFile && backFile ? "Front and Back" : (frontFile ? "Front" : "Back"),
                    isUploading: true,
                    front: frontFile ? {
                        id: "pending_front_" + Date.now(),
                        fileUrl: frontPreviewUrl,
                        printArea: "Front",
                        base64Data: frontBase64,
                        isUploading: true,
                        shapeProps: frontShapeProps
                    } : null,
                    back: backFile ? {
                        id: "pending_back_" + Date.now(),
                        fileUrl: backPreviewUrl,
                        printArea: "Back",
                        base64Data: backBase64,
                        isUploading: true,
                        shapeProps: backShapeProps
                    } : null
                };

                const totalUnitPrice = product.basePrice + priceAddon;
                const customizedProduct = {
                    ...product,
                    color: selectedColor,
                };

                setDirectCheckoutItem({ product: customizedProduct, size, qty: 1, design: tempDesign, unitPrice: totalUnitPrice });

                setIsSelected(false);
                setRender3D(false);
                const user = localStorage.getItem("customerUser");
                if (user) {
                    setPendingTransitionUrl("/checkout?direct=true");
                } else {
                    setPendingTransitionUrl("/login?redirect=/checkout?direct=true");
                }
            } catch (err) {
                console.error("[DesignStudio] Buy Now Click Error:", err);
                alert("Buy Now Error: " + err.message);
            }
            return;
        }

        setUploading(true);
        try {
            let uploadedFront = null;
            let uploadedBack = null;

            const formData = new FormData();
            const calcPrintArea = frontFile && backFile ? "Front and Back" : (frontFile ? "Front" : "Back");
            formData.append("printArea", calcPrintArea);

            let frontText = "";
            let backText = "";
            if (frontFile && frontShapeProps) {
                const x = frontShapeProps.x;
                if (x < 110) frontText = "Left";
                else if (x > 150) frontText = "Right";
                else frontText = "Center";
            }
            if (backFile && backShapeProps) {
                const x = backShapeProps.x;
                if (x < 110) backText = "Left";
                else if (x > 150) backText = "Right";
                else backText = "Center";
            }
            const placement = (frontText && backText) ? `Front: ${frontText}, Back: ${backText}` : (frontText || backText || "Center");
            formData.append("position", placement);

            const primaryProps = (frontFile && frontShapeProps) ? frontShapeProps : ((backFile && backShapeProps) ? backShapeProps : null);
            if (primaryProps) {
                formData.append("positionX", primaryProps.x ?? 130);
                formData.append("positionY", primaryProps.y ?? 160);
                formData.append("scale", primaryProps.scaleX ?? 1);
                formData.append("rotation", primaryProps.rotation ?? 0);
            }

            if (frontFile) {
                let uploadFile = frontFile;
                if (frontFile.size > 200 * 1024) {
                    uploadFile = await compressImage(frontFile);
                }
                formData.append("frontFile", uploadFile);
            }

            if (backFile) {
                let uploadFile = backFile;
                if (backFile.size > 200 * 1024) {
                    uploadFile = await compressImage(backFile);
                }
                formData.append("backFile", uploadFile);
            }

            const res = await axiosClient.post("/designs/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (frontFile) {
                uploadedFront = { id: res.data.id, fileUrl: res.data.fileUrl, printArea: "Front" };
            }
            if (backFile) {
                uploadedBack = { id: res.data.id, fileUrl: res.data.fileUrlBack || res.data.fileUrl, printArea: "Back" };
            }

            const design = {
                id: res.data.id.toString(),
                fileUrl: res.data.fileUrl || "",
                fileUrlBack: res.data.fileUrlBack || "",
                printArea: res.data.printArea,
                front: uploadedFront,
                back: uploadedBack
            };
            const totalUnitPrice = product.basePrice + priceAddon;

            const customizedProduct = {
                ...product,
                color: selectedColor,
            };

            addToCart(customizedProduct, size, 1, design, totalUnitPrice);

            setIsSelected(false);
            setRender3D(false);

            if (autoRedirect) {
                alert("Design added to cart!");
                setPendingTransitionUrl(targetPath);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to upload design. Try again.");
        } finally {
            setUploading(false);
        }
    };

    const getDecalProps = (previewUrl, designImage, shapeProps, side) => {
        if (!previewUrl || !designImage) {
            return { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };
        }

        const dWidth = designImage.width || 1;
        const dHeight = designImage.height || 1;
        const aspect = dHeight > 0 ? dWidth / dHeight : 1;

        let w = 130;
        let h = 130;
        if (aspect > 1) {
            h = 130 / aspect;
        } else {
            w = 130 * aspect;
        }

        const scaleX = shapeProps.scaleX ?? 1;
        const scaleY = shapeProps.scaleY ?? 1;

        const editCenterX = shapeProps.x + (w * scaleX) / 2;
        const editCenterY = shapeProps.y + (h * scaleY) / 2;

        const dx = editCenterX - 200;
        const dy = editCenterY - 215;

        const unitScale = 0.0009;
        const decalX = dx * unitScale;
        const decalY = -dy * unitScale;
        const decalW = w * scaleX * unitScale;
        const decalH = h * scaleY * unitScale;
        const decalRot = -shapeProps.rotation * (Math.PI / 180);

        // Sanitize coordinates to prevent passing NaN to Three.js WebGL uniforms
        if (isNaN(decalX) || isNaN(decalY) || isNaN(decalW) || isNaN(decalH) || isNaN(decalRot)) {
            return { position: [0, 0, 0.15], rotation: [0, 0, 0], scale: [0.1, 0.1, 0.25] };
        }

        return {
            position: side === "Front" ? [decalX, decalY, 0.15] : [-decalX, decalY, -0.15],
            rotation: side === "Front" ? [0, 0, decalRot] : [0, Math.PI, -decalRot],
            scale: [decalW, decalH, 0.25],
        };
    };

    const frontDecalProps = useMemo(() => {
        return getDecalProps(frontPreviewUrl, frontDesignImage, frontShapeProps, "Front");
    }, [frontPreviewUrl, frontDesignImage, frontShapeProps]);

    const backDecalProps = useMemo(() => {
        return getDecalProps(backPreviewUrl, backDesignImage, backShapeProps, "Back");
    }, [backPreviewUrl, backDesignImage, backShapeProps]);

    const totalPrice = product ? product.basePrice + priceAddon : priceAddon;

    return (
        <div style={{ fontFamily: "'Outfit', sans-serif" }} className="bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 min-h-screen py-12 px-4 md:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_0.75px,transparent_0.75px),linear-gradient(to_bottom,#e4e4e7_0.75px,transparent_0.75px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header breadcrumb & info row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-zinc-200 pb-5">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">
                            <span>Shop</span>
                            <span>/</span>
                            <span className="text-zinc-600">3D Customize Hub</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
                            3D Creator Studio
                            <span className="text-xs bg-red-600 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">v2.0</span>
                        </h1>
                    </div>
                    <Link
                        to="/shop"
                        className="text-sm font-bold text-[#cc0000] hover:text-[#aa0000] transition-all flex items-center gap-1.5 hover:-translate-x-1 group"
                    >
                        <span className="transition-transform group-hover:-translate-x-0.5">←</span> Back to Shop Catalog
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: Interactive Canvas + Live Controller HUD (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col items-center">


                        {/* Interactive Main Box Stage */}
                        <div
                            className="relative w-[400px] h-[500px] bg-zinc-100 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-zinc-200/50 flex items-center justify-center select-none"
                            style={{ cursor: isOrbiting ? "grab" : "default" }}
                        >
                            {/* Floating Indicator Badges */}
                            <div className="absolute top-5 left-5 z-20">
                                <span className="bg-zinc-900/90 backdrop-blur-md text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-zinc-800">
                                    {printArea} Aspect
                                </span>
                            </div>

                            <div className="absolute top-5 right-5 z-20 flex gap-2">
                                <span className="bg-red-600/10 backdrop-blur-md text-[#cc0000] border border-red-600/20 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                    {isOrbiting ? "3D Rotation" : "2D Workspace"}
                                </span>
                            </div>

                            {/* ─── TShirtViewer: always rendered as background ─── */}
                            {render3D && (
                                <div className="absolute inset-0 z-0">
                                    <TShirtViewer
                                        color={selectedColor}
                                        frontPreviewUrl={frontPreviewUrl}
                                        frontDecalProps={frontDecalProps}
                                        backPreviewUrl={backPreviewUrl}
                                        backDecalProps={backDecalProps}
                                        isOrbiting={isOrbiting}
                                        rotationY={rotationY}
                                        printArea={printArea}
                                        onDebugInfo={handleDebugInfo}
                                        onLoadingError={(msg) => handleDebugInfo({ status: `Error: ${msg}`, meshes: [] })}
                                    />
                                </div>
                            )}

                            {/* ─── Checkout transition spinner ─── */}
                            {!render3D && (
                                <div className="absolute inset-0 bg-white flex items-center justify-center z-30">
                                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                                        <div className="w-6 h-6 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest">Preparing Checkout...</span>
                                    </div>
                                </div>
                            )}

                            {/* ─── Konva design canvas: 2D Layout Editor only, transparent over 3D model ─── */}
                            {!isOrbiting && (
                                <Stage
                                    width={400}
                                    height={500}
                                    className="absolute inset-0 z-10"
                                    style={{ pointerEvents: "auto" }}
                                    onMouseDown={(e) => {
                                        if (e.target === e.target.getStage()) setIsSelected(false);
                                    }}
                                    onTouchStart={(e) => {
                                        if (e.target === e.target.getStage()) setIsSelected(false);
                                    }}
                                >
                                    <Layer>
                                        {printArea === "Front" ? (
                                            frontPreviewUrl && frontDesignImage && (
                                                <DesignImage
                                                    imageUrl={frontPreviewUrl}
                                                    isSelected={isSelected}
                                                    onSelect={() => setIsSelected(true)}
                                                    shapeProps={frontShapeProps}
                                                    onChange={setFrontShapeProps}
                                                />
                                            )
                                        ) : (
                                            backPreviewUrl && backDesignImage && (
                                                <DesignImage
                                                    imageUrl={backPreviewUrl}
                                                    isSelected={isSelected}
                                                    onSelect={() => setIsSelected(true)}
                                                    shapeProps={backShapeProps}
                                                    onChange={setBackShapeProps}
                                                />
                                            )
                                        )}
                                    </Layer>
                                </Stage>
                            )}
                        </div>

                        {/* Interactive Edit Tools HUD (Quick layout actions) */}
                        {!isOrbiting && (printArea === "Front" ? frontPreviewUrl : backPreviewUrl) && (
                            <div className="flex gap-2 justify-center mt-4 w-full max-w-[400px]">
                                <button
                                    onClick={() => {
                                        if (printArea === "Front") {
                                            setFrontShapeProps({ x: 130, y: 160, scaleX: 1, scaleY: 1, rotation: 0 });
                                        } else {
                                            setBackShapeProps({ x: 130, y: 160, scaleX: 1, scaleY: 1, rotation: 0 });
                                        }
                                    }}
                                    className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[10px] font-bold uppercase transition-all shadow-sm cursor-pointer"
                                >
                                    🎯 Re-Center
                                </button>
                                <button
                                    onClick={() => {
                                        if (printArea === "Front") {
                                            setFrontShapeProps((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
                                        } else {
                                            setBackShapeProps((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
                                        }
                                    }}
                                    className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[10px] font-bold uppercase transition-all shadow-sm cursor-pointer"
                                >
                                    🔄 Rotate 90°
                                </button>
                                <button
                                    onClick={() => {
                                        if (printArea === "Front") {
                                            setFrontPreviewUrl(null);
                                            setFrontFile(null);
                                        } else {
                                            setBackPreviewUrl(null);
                                            setBackFile(null);
                                        }
                                        setIsSelected(false);
                                    }}
                                    className="flex-1 py-2 bg-red-50 text-[#cc0000] border border-red-200/40 hover:bg-red-100 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
                                >
                                    🗑️ Clear
                                </button>
                            </div>
                        )}

                        {/* Orbit Control Info / Range Slider */}
                        {isOrbiting && (
                            <div className="w-full max-w-[400px] mt-4 bg-white border border-zinc-200/50 p-5 rounded-lg shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-zinc-700">Rotate Drag View / Range Slider</span>
                                    </div>
                                    <button
                                        onClick={() => setRotationY(printArea === "Front" ? 0 : Math.PI)}
                                        className="text-[10px] bg-zinc-100 hover:bg-zinc-200 font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                                    >
                                        Reset Position
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="360"
                                        value={Math.round(((rotationY % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI) * (180 / Math.PI))}
                                        onChange={(e) => {
                                            setRotationY(parseInt(e.target.value) * (Math.PI / 180));
                                        }}
                                        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#cc0000]"
                                    />
                                    <div className="flex justify-between text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">
                                        <span>Front</span>
                                        <span>Left</span>
                                        <span>Back</span>
                                        <span>Right</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isOrbiting && (
                            <p className="text-[11px] text-zinc-400 mt-4 leading-relaxed text-center max-w-[320px]">
                                💡 <strong>Layout Mode Active:</strong> Click and drag the design to move. Drag bounds handles to scale or rotate your design artwork on the tee.
                            </p>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Workspace Controls Panel (7 cols) */}
                    <div className="lg:col-span-7 bg-white/75 backdrop-blur-xl p-8 rounded-xl border border-zinc-200/40 shadow-[0_20px_50px_rgba(0,0,0,0.03)] space-y-8">

                        {/* Card Block 1: Choose Apparel Template */}
                        {!productId && allProducts.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider block">01. Select Apparel Base</label>
                                    <span className="text-[10px] text-zinc-400 font-bold bg-zinc-100 px-2 py-0.5 rounded-md">Cotton Fabric</span>
                                </div>
                                <select
                                    value={product?.id || ""}
                                    onChange={(e) => {
                                        const match = allProducts.find((p) => p.id === parseInt(e.target.value));
                                        if (match) {
                                            setProduct(match);
                                            if (match.color) setSelectedColor(match.color);
                                        }
                                    }}
                                    className="w-full p-3 border border-zinc-200/50 rounded-lg font-bold focus:border-[#cc0000] focus:ring-0 outline-none transition-all text-zinc-800 cursor-pointer bg-zinc-50/50 hover:bg-zinc-50 shadow-sm text-sm"
                                >
                                    {allProducts.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — ₹{p.basePrice}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Card Block 2: Design File Upload Workspace */}
                        <div className="space-y-3">
                            <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider block">02. Upload Design Graphic ({printArea})</label>

                            {(printArea === "Front" ? frontPreviewUrl : backPreviewUrl) ? (
                                <div className="border border-zinc-200/50 rounded-lg p-5 flex items-center justify-between bg-zinc-50/50 shadow-sm">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-14 h-14 bg-white rounded-lg border border-zinc-200/50 shadow-sm flex items-center justify-center p-1">
                                            <img src={printArea === "Front" ? frontPreviewUrl : backPreviewUrl} className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-800">Custom {printArea} Graphic Loaded</p>
                                            <p className="text-xs text-zinc-400 font-medium">Ready for print placement</p>
                                        </div>
                                    </div>
                                    <label className="text-xs font-bold text-[#cc0000] hover:text-[#aa0000] bg-white hover:bg-zinc-100 border border-zinc-200/50 px-4 py-2 rounded-lg cursor-pointer transition-all shadow-sm">
                                        Change File
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </label>
                                </div>
                            ) : (
                                <label className="border border-dashed border-zinc-200/60 hover:border-[#cc0000] hover:bg-red-50/5 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all group relative">
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    <span className="text-3xl block group-hover:scale-110 transition-transform duration-200 mb-2">📤</span>
                                    <p className="text-sm font-extrabold text-zinc-800">Upload {printArea} Artwork</p>
                                    <p className="text-[11px] text-zinc-500 mt-1">
                                        Please upload <strong className="text-red-600">transparent PNG (Without background)</strong> only!
                                    </p>
                                </label>
                            )}
                        </div>

                        {/* Card Block 3: Position Placement */}
                        <div className="space-y-3">
                            <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider block">03. Print Area Side</label>
                            <div className="flex gap-3">
                                {PRINT_AREAS.map((area) => {
                                    const isSelected = printArea === area;
                                    return (
                                        <button
                                            key={area}
                                            onClick={() => setPrintArea(area)}
                                            className={`flex-1 py-3 px-6 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer ${isSelected
                                                ? "bg-zinc-900 text-white shadow-md shadow-zinc-950/15"
                                                : "bg-white border border-zinc-200/50 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                                                }`}
                                        >
                                            {area} Print
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Card Block 4: Color swatches (White, Black, Red, Navy, Gray) */}
                        <div className="space-y-3">
                            <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider block">04. Fabric Color Selection</label>
                            <div className="flex items-center gap-4 bg-zinc-50/50 p-4 rounded-lg border border-zinc-200/40 w-fit">
                                {["White", "Black", "Red", "Navy", "Gray"].map((colorName) => {
                                    const bgClass = {
                                        White: "bg-white border-zinc-300",
                                        Black: "bg-zinc-950 border-transparent",
                                        Red: "bg-red-600 border-transparent",
                                        Navy: "bg-blue-900 border-transparent",
                                        Gray: "bg-zinc-400 border-transparent",
                                    }[colorName];
                                    const isCurrent = selectedColor.toLowerCase() === colorName.toLowerCase();
                                    return (
                                        <button
                                            key={colorName}
                                            onClick={() => setSelectedColor(colorName)}
                                            className={`w-9 h-9 rounded-full border cursor-pointer transition-all duration-300 ${bgClass} ${isCurrent
                                                ? "ring-2 ring-red-500 ring-offset-2 scale-110 shadow-sm"
                                                : "hover:scale-105"
                                                }`}
                                            title={colorName}
                                        />
                                    );
                                })}

                                {/* Custom Color Picker Swatch */}
                                {(() => {
                                    const isCustomActive = !["white", "black", "red", "navy", "gray"].includes(selectedColor.toLowerCase());
                                    return (
                                        <div className={`relative w-9 h-9 rounded-full overflow-hidden border border-zinc-200/60 shadow-sm cursor-pointer transition-all duration-300 bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 ${isCustomActive
                                            ? "ring-2 ring-red-500 ring-offset-2 scale-110 shadow-md"
                                            : "hover:scale-105"
                                            }`}>
                                            <input
                                                type="color"
                                                value={selectedColor.startsWith("#") ? selectedColor : "#ffffff"}
                                                onChange={(e) => setSelectedColor(e.target.value)}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                title="Pick Custom Color"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10 text-white font-extrabold text-[9px]">

                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Card Block 5: Apparel Size options */}
                        <div className="space-y-3">
                            <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider block">05. Size Specifications</label>
                            <div className="flex gap-2.5">
                                {["S", "M", "L", "XL", "XXL"].map((s) => {
                                    const isSelected = size === s;
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => setSize(s)}
                                            className={`w-12 h-12 rounded-lg border flex items-center justify-center font-extrabold text-xs transition-all duration-200 cursor-pointer ${isSelected
                                                ? "border-[#cc0000] bg-red-50/15 text-[#cc0000] shadow-sm shadow-red-100"
                                                : "border-zinc-200/50 text-zinc-500 hover:border-zinc-300 hover:text-zinc-800 bg-white"
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Summary breakdown panel */}
                        <div className="bg-zinc-50/80 border border-zinc-200/50 rounded-lg p-5 text-xs space-y-3.5 shadow-sm">
                            <div className="flex justify-between text-zinc-500">
                                <span className="font-medium">Apparel Base Cost</span>
                                <span className="font-bold text-zinc-800">₹{product?.basePrice ?? 0}</span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                                <span className="font-medium">Graphic Customization Add-on</span>
                                <span className="font-bold text-zinc-800">₹{priceAddon}</span>
                            </div>
                            <div className="flex justify-between font-extrabold border-t border-zinc-200 pt-3.5 mt-1 text-sm text-zinc-950">
                                <span>Unit Checkout Cost</span>
                                <span className="text-[#cc0000]">₹{totalPrice}</span>
                            </div>
                        </div>

                        {/* Dual action buttons: Add to Cart & Buy Now */}
                        <div className="flex flex-col sm:flex-row gap-3.5 mt-2">
                            <button
                                onClick={() => handleAddToCart(true, "/cart")}
                                disabled={uploading}
                                className="flex-1 flex items-center justify-center gap-2 border border-zinc-900/80 text-zinc-900 hover:bg-zinc-50 py-4 px-6 rounded-lg font-extrabold uppercase tracking-wider text-[11px] transition-all duration-200 disabled:opacity-50 cursor-pointer"
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        🛒 Add To Cart
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleAddToCart(true, "/checkout")}
                                disabled={uploading}
                                className="flex-1 flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white py-4 px-6 rounded-lg font-extrabold uppercase tracking-wider text-[11px] transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-md shadow-zinc-950/10 active:scale-[0.99]"
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        ⚡ Buy Now
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-center text-[10px] text-zinc-400 font-medium leading-relaxed">
                            💡 Fabric renders represent cotton indices. Ink colors are auto-calibrated to match CMYK print gamut standards.
                        </p>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default DesignStudio;
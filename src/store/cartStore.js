import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            directCheckoutItem: (() => {
                try {
                    const stored = sessionStorage.getItem("dropprint-direct-checkout");
                    return stored ? JSON.parse(stored) : null;
                } catch (e) {
                    console.error("[Zustand Store] Failed to parse sessionStorage direct-checkout:", e);
                    return null;
                }
            })(),

            addToCart: (product, size, qty = 1, design = null, unitPrice = null) => {
                console.log("[Zustand Store] addToCart called:", { product, size, qty, design, unitPrice });
                const items = get().items;
                const designId = design?.id || null;
                const existingIndex = items.findIndex(
                    (item) => item.product.id === product.id && item.size === size && (item.design?.id || null) === designId
                );

                if (existingIndex !== -1 && !design) {
                    const updated = [...items];
                    updated[existingIndex].qty += qty;
                    set({ items: updated });
                } else {
                    set({
                        items: [
                            ...items,
                            { product, size, qty, design, unitPrice: unitPrice ?? product.basePrice },
                        ],
                    });
                }
                console.log("[Zustand Store] New items list:", get().items);
            },

            removeFromCart: (productId, size, designId = null) => {
                console.log("[Zustand Store] removeFromCart called:", { productId, size, designId });
                set({
                    items: get().items.filter(
                        (item) => !(item.product.id === productId && item.size === size && (item.design?.id || null) === designId)
                    ),
                });
                console.log("[Zustand Store] New items list:", get().items);
            },

            updateQty: (productId, size, qty, designId = null) => {
                console.log("[Zustand Store] updateQty called:", { productId, size, qty, designId });
                set({
                    items: get().items.map((item) =>
                        item.product.id === productId && item.size === size && (item.design?.id || null) === designId
                            ? { ...item, qty: Math.max(1, qty) }
                            : item
                    ),
                });
            },

            updateDesign: (productId, size, tempDesignId, finalDesign) => {
                console.log("[Zustand Store] updateDesign called:", { productId, size, tempDesignId, finalDesign });
                set({
                    items: get().items.map((item) =>
                        item.product.id === productId && item.size === size && item.design?.id === tempDesignId
                            ? { ...item, design: finalDesign }
                            : item
                    ),
                });
                console.log("[Zustand Store] Items after design update:", get().items);
            },

            setDirectCheckoutItem: (item) => {
                console.log("[Zustand Store] setDirectCheckoutItem called with item:", item);
                set({ directCheckoutItem: item });
                if (item) {
                    try {
                        sessionStorage.setItem("dropprint-direct-checkout", JSON.stringify(item));
                    } catch (e) {
                        console.error("[Zustand Store] Failed to save to sessionStorage:", e);
                    }
                } else {
                    sessionStorage.removeItem("dropprint-direct-checkout");
                }
                console.log("[Zustand Store] State directCheckoutItem is now:", get().directCheckoutItem);
            },

            updateDirectCheckoutDesign: (finalDesign) => {
                console.log("[Zustand Store] updateDirectCheckoutDesign called:", finalDesign);
                const current = get().directCheckoutItem;
                if (current) {
                    const updated = { ...current, design: finalDesign };
                    set({ directCheckoutItem: updated });
                    try {
                        sessionStorage.setItem("dropprint-direct-checkout", JSON.stringify(updated));
                    } catch (e) {
                        console.error("[Zustand Store] Failed to save to sessionStorage:", e);
                    }
                }
                console.log("[Zustand Store] directCheckoutItem after design update:", get().directCheckoutItem);
            },

            clearCart: () => {
                console.log("[Zustand Store] clearCart called");
                set({ items: [] });
            },

            getTotal: () => get().items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0),

            getCount: () => get().items.reduce((sum, item) => sum + item.qty, 0),
        }),
        {
            name: "dropprint-cart-storage", // local storage key
            partialize: (state) => ({ items: state.items }), // Only persist shopping cart items in localStorage, excluding directCheckoutItem
        }
    )
);

export default useCartStore;
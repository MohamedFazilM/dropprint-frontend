import { create } from "zustand";
import { persist } from "zustand/middleware";

const useWishlistStore = create(
    persist(
        (set, get) => ({
            items: [],

            addToWishlist: (product) => {
                const items = get().items;
                const exists = items.some((item) => item.id === product.id);
                if (!exists) {
                    set({ items: [...items, product] });
                }
            },

            removeFromWishlist: (productId) => {
                set({
                    items: get().items.filter((item) => item.id !== productId),
                });
            },

            toggleWishlist: (product) => {
                const items = get().items;
                const exists = items.some((item) => item.id === product.id);
                if (exists) {
                    set({
                        items: items.filter((item) => item.id !== product.id),
                    });
                } else {
                    set({ items: [...items, product] });
                }
            },

            isInWishlist: (productId) => {
                return get().items.some((item) => item.id === productId);
            },
        }),
        {
            name: "dropprint-wishlist-storage", // local storage key
        }
    )
);

export default useWishlistStore;

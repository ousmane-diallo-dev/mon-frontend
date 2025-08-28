import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  _id: string;
  nom: string;
  prix: number;
  images?: string[];
  quantite: number;
}

export interface CartState {
  items: CartItem[];
}

const loadInitialState = (): CartState => {
  try {
    const raw = localStorage.getItem("cart");
    console.log("🔄 Loading cart from localStorage:", raw);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as CartState;
    if (!Array.isArray(parsed.items)) return { items: [] };
    // Assainir les items (quantités <= 0, prix invalides). Ne filtre pas sur l'ID ici.
    const sanitizedItems = parsed.items.filter(i => i && typeof i.quantite === 'number' && i.quantite > 0 && typeof i.prix === 'number' && i.prix >= 0);
    const removed = parsed.items.length - sanitizedItems.length;
    if (removed > 0) {
      console.warn(`⚠️ ${removed} article(s) invalides retirés du panier (quantité/prix).`);
    }
    console.log("✅ Cart loaded from localStorage:", sanitizedItems);
    return { items: sanitizedItems };
  } catch (error) {
    console.error("❌ Error loading cart from localStorage:", error);
    return { items: [] };
  }
};

const persist = (state: CartState) => {
  try {
    const serialized = JSON.stringify(state);
    console.log("💾 Persisting cart to localStorage:", serialized);
    localStorage.setItem("cart", serialized);
    console.log("✅ Cart persisted successfully");
  } catch (error) {
    console.error("❌ Error persisting cart:", error);
  }
};

const initialState: CartState = loadInitialState();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      console.log("➕ Adding item to cart:", action.payload);
      console.log("➕ Current cart state:", state.items);

      const existing = state.items.find(i => i._id === action.payload._id);
      if (existing) {
        existing.quantite += action.payload.quantite;
        console.log("➕ Updated existing item quantity:", existing.quantite);
      } else {
        state.items.push(action.payload);
        console.log("➕ Added new item to cart");
      }
      
      console.log("➕ Final cart state:", state.items);
      persist(state);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      console.log("🗑️ Removing item from cart:", action.payload);
      state.items = state.items.filter(i => i._id !== action.payload);
      console.log("🗑️ Cart after removal:", state.items);
      persist(state);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ _id: string; quantite: number }>
    ) => {
      console.log("📝 Updating quantity:", action.payload);
      const item = state.items.find(i => i._id === action.payload._id);
      if (item) {
        item.quantite = action.payload.quantite;
        if (item.quantite <= 0) {
          state.items = state.items.filter(i => i._id !== action.payload._id);
          console.log("📝 Item removed due to zero quantity");
        }
        console.log("📝 Quantity updated:", item.quantite);
        persist(state);
      }
    },
    clearCart: (state) => {
      console.log("🧹 Clearing cart");
      state.items = [];
      persist(state);
    }
  }
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) => state.cart.items.reduce((sum, i) => sum + i.quantite, 0);
export const selectCartTotal = (state: { cart: CartState }) => state.cart.items.reduce((sum, i) => sum + i.quantite * i.prix, 0);



import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface FavoriteItem {
  _id: string;
  nom: string;
  prix: number;
  images?: string[];
}

interface FavoritesState {
  items: Record<string, FavoriteItem>;
}

const STORAGE_KEY = "favorites";

const loadFromStorage = (): FavoritesState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: {} };
    return JSON.parse(raw);
  } catch {
    return { items: {} };
  }
};

const saveToStorage = (state: FavoritesState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

const initialState: FavoritesState = loadFromStorage();

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<FavoriteItem>) => {
      const id = action.payload._id;
      if (state.items[id]) {
        delete state.items[id];
      } else {
        state.items[id] = action.payload;
      }
      saveToStorage(state);
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      delete state.items[action.payload];
      saveToStorage(state);
    },
    clearFavorites: (state) => {
      state.items = {};
      saveToStorage(state);
    }
  }
});

export const { toggleFavorite, removeFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;


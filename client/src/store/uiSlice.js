import { createSlice } from '@reduxjs/toolkit';

const LS_KEY = 'salon_kastom_ui_prefs';

function loadPrefs() {
  try {
    const r = localStorage.getItem(LS_KEY);
    if (!r) return undefined;
    return JSON.parse(r);
  } catch {
    return undefined;
  }
}

const saved = loadPrefs();

const defaultPrefs = {
  orderStatus: '',
  orderSort: 'createdAt',
  orderOrder: 'desc',
  orderQuery: '',
  supplyColor: '',
  supplyCategory: '',
  supplySort: 'name',
  supplyOrder: 'asc',
  supplyMinStock: 0,
  supplyMaxPrice: 500,
  favoriteSupplyIds: [],
};

const initialState = {
  snackbar: { open: false, message: '', severity: 'info' },
  prefs: saved && typeof saved === 'object' ? { ...defaultPrefs, ...saved } : defaultPrefs,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showSnackbar(state, action) {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    hideSnackbar(state) {
      state.snackbar.open = false;
    },
    setOrderPrefs(state, action) {
      state.prefs = { ...state.prefs, ...action.payload };
      localStorage.setItem(LS_KEY, JSON.stringify(state.prefs));
    },
    setSupplyPrefs(state, action) {
      state.prefs = { ...state.prefs, ...action.payload };
      localStorage.setItem(LS_KEY, JSON.stringify(state.prefs));
    },
    toggleFavoriteSupply(state, action) {
      const id = action.payload;
      const s = new Set(state.prefs.favoriteSupplyIds);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      state.prefs.favoriteSupplyIds = [...s];
      localStorage.setItem(LS_KEY, JSON.stringify(state.prefs));
    },
    resetAllPrefs() {
      localStorage.removeItem(LS_KEY);
      return {
        ...initialState,
        prefs: { ...defaultPrefs },
      };
    },
  },
});

export const {
  showSnackbar,
  hideSnackbar,
  setOrderPrefs,
  setSupplyPrefs,
  toggleFavoriteSupply,
  resetAllPrefs,
} = uiSlice.actions;

export default uiSlice.reducer;

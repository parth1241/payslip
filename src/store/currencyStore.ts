import { create } from "zustand";
import { fetchXLMPrice } from "@/lib/price";

interface CurrencyState {
  currency: "XLM" | "USDC";
  xlmUsdRate: number;
  lastUpdated: number | null;
  toggleCurrency: () => void;
  refreshRate: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: "XLM",
  xlmUsdRate: 0.11, // fallback default
  lastUpdated: null,
  toggleCurrency: () => {
    set((state) => ({ currency: state.currency === "XLM" ? "USDC" : "XLM" }));
  },
  refreshRate: async () => {
    const rate = await fetchXLMPrice();
    set({ xlmUsdRate: rate, lastUpdated: Date.now() });
  },
}));

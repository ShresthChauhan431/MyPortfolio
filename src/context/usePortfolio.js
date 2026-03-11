import { useContext } from "react";
import PortfolioContext from "./portfolioContextValue.js";

/**
 * Convenience hook — throws if used outside PortfolioProvider.
 */
export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error("usePortfolio must be used within a <PortfolioProvider>");
  }
  return ctx;
}

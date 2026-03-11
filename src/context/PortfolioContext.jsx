import { useState } from "react";
import PortfolioContext from "./portfolioContextValue.js";
import defaultData from "../data/portfolio.json";

export function PortfolioProvider({ children }) {
  const [data] = useState(defaultData);

  const value = {
    data,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

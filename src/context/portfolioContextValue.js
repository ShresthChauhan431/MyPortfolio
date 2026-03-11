import { createContext } from "react";

const PORTFOLIO_STORAGE_KEY = "portfolio_data";

const PortfolioContext = createContext(null);

export { PORTFOLIO_STORAGE_KEY };
export default PortfolioContext;

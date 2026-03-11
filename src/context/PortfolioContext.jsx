import { useState, useEffect, useCallback } from "react";
import PortfolioContext, {
  PORTFOLIO_STORAGE_KEY,
} from "./portfolioContextValue.js";
import defaultData from "../data/portfolio.json";

/**
 * Deep-set a value at a dot-separated path inside an object.
 * e.g. setNestedValue(obj, "social.github", "https://…")
 * Returns a shallow-cloned tree (immutable-friendly).
 */
function setNestedValue(obj, path, value) {
  const keys = Array.isArray(path) ? path : path.split(".");
  if (keys.length === 0) return value;

  const [head, ...rest] = keys;

  // If the current level is an array and the key is numeric, clone as array
  const isArrayIndex = Array.isArray(obj) && /^\d+$/.test(head);
  const clone = isArrayIndex ? [...obj] : { ...obj };

  clone[isArrayIndex ? Number(head) : head] =
    rest.length === 0 ? value : setNestedValue(clone[head] ?? {}, rest, value);

  return clone;
}

/**
 * Read persisted portfolio data from localStorage synchronously.
 * Falls back to the bundled portfolio.json when nothing is stored or on parse error.
 */
function loadInitialData() {
  try {
    const stored = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Corrupted storage — fall back to the JSON file
  }
  return defaultData;
}

export function PortfolioProvider({ children }) {
  const [data, setData] = useState(loadInitialData);
  const [isEditMode, setIsEditMode] = useState(false);

  // --------------- Persist every change ---------------
  useEffect(() => {
    if (data) {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  // --------------- Public helpers ---------------
  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  /**
   * Update any nested field by its dot-path.
   *   updateField("name", "Jane Doe")
   *   updateField("social.github", "https://github.com/jane")
   *   updateField("skills.0.level", 95)
   */
  const updateField = useCallback((path, value) => {
    setData((prev) => {
      if (!prev) return prev;
      return setNestedValue(prev, path, value);
    });
  }, []);

  /**
   * Reset localStorage and revert to the original portfolio.json data.
   */
  const resetData = useCallback(() => {
    localStorage.removeItem(PORTFOLIO_STORAGE_KEY);
    setData(defaultData);
  }, []);

  const value = {
    data,
    isEditMode,
    toggleEditMode,
    updateField,
    resetData,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

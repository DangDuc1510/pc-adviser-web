import { useState, useEffect, useCallback, useRef } from "react";
import { SearchApi } from "@/apis/search";

const DEBOUNCE_DELAY = 300;
const MIN_KEYWORD_LENGTH = 2;
const SEARCH_HISTORY_KEY = "search_history";
const MAX_HISTORY_ITEMS = 10;

// Trending keywords based on popular categories, brands, and products
const TRENDING_KEYWORDS = [
  "cpu",
  "vga",
  "ram",
  "mainboard",
  "ssd",
  "psu",
  "case",
  "cooling",
  "monitor",
  "keyboard",
  "mouse",
  "intel",
  "amd",
  "asus",
  "msi",
  "corsair",
  "rtx 4090",
  "rtx 4080",
  "ryzen 7",
  "core i7",
  "ddr5",
  "nvme",
];

export const useSearchPopup = (isOpen = false, searchValue = "") => {
  const [results, setResults] = useState({
    products: [],
    suggestKeywords: [],
    categories: [],
    brands: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const debounceTimerRef = useRef(null);

  // Reset state when popup closes
  useEffect(() => {
    if (!isOpen) {
      setResults({
        products: [],
        suggestKeywords: [],
        categories: [],
        brands: [],
      });
      setError(null);
      setLoading(false);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    }
  }, [isOpen]);

  // Load search history from localStorage
  const loadHistory = useCallback(() => {
    if (typeof window !== "undefined") {
      const history = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        try {
          setSearchHistory(JSON.parse(history));
        } catch (e) {
          console.error("Failed to parse search history", e);
        }
      }
    }
  }, []);

  // Load history on mount and when popup opens
  useEffect(() => {
    loadHistory();
  }, [loadHistory, isOpen]);

  // Save search history to localStorage
  const saveToHistory = useCallback((keyword) => {
    if (!keyword || keyword.trim().length < MIN_KEYWORD_LENGTH) return;

    const trimmedKeyword = keyword.trim();
    setSearchHistory((prev) => {
      const updated = [
        trimmedKeyword,
        ...prev.filter((item) => item !== trimmedKeyword),
      ].slice(0, MAX_HISTORY_ITEMS);

      if (typeof window !== "undefined") {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      }

      return updated;
    });
  }, []);

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    }
  }, []);

  // Fetch search results
  const fetchSearch = useCallback(async (searchKeyword) => {
    if (!searchKeyword || searchKeyword.trim().length < MIN_KEYWORD_LENGTH) {
      setResults({
        products: [],
        suggestKeywords: [],
        categories: [],
        brands: [],
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await SearchApi.searchProducts(searchKeyword.trim(), {
        limit: 10,
      });

      setResults({
        products: Array.isArray(response.products) ? response.products : [],
        suggestKeywords: Array.isArray(response.suggest_keywords) 
          ? response.suggest_keywords 
          : [],
        categories: Array.isArray(response.categories)
          ? response.categories
          : [],
        brands: Array.isArray(response.brands) ? response.brands : [],
      });
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Có lỗi xảy ra khi tìm kiếm");
      setResults({
        products: [],
        suggestKeywords: [],
        categories: [],
        brands: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    (value) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        fetchSearch(value);
      }, DEBOUNCE_DELAY);
    },
    [fetchSearch]
  );

  // Watch searchValue changes and trigger search
  useEffect(() => {
    if (searchValue && searchValue.trim().length >= MIN_KEYWORD_LENGTH) {
      debouncedSearch(searchValue);
      } else {
      setResults({
        products: [],
        suggestKeywords: [],
        categories: [],
        brands: [],
      });
        setLoading(false);
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      }
  }, [searchValue, debouncedSearch]);

  // Get display data based on state
  const getDisplayData = useCallback(() => {
    // If keyword is empty or too short, show history/trending
    if (!searchValue || searchValue.trim().length < MIN_KEYWORD_LENGTH) {
      return {
        showHistory: true,
        history: searchHistory,
        trending: TRENDING_KEYWORDS,
        products: [],
        suggestKeywords: [],
        categories: [],
        brands: [],
      };
    }

    // If loading, show loading state
    if (loading) {
      return {
        showHistory: false,
        history: [],
        trending: [],
        products: [],
        suggestKeywords: [],
        categories: [],
        brands: [],
        loading: true,
      };
    }

    // If error, show error state
    if (error) {
      return {
        showHistory: false,
        history: [],
        trending: [],
        products: [],
        suggestKeywords: [],
        categories: [],
        brands: [],
        error: true,
      };
    }

    // Show results
    return {
      showHistory: false,
      history: [],
      trending: [],
      products: results.products,
      suggestKeywords: results.suggestKeywords,
      categories: results.categories,
      brands: results.brands,
    };
  }, [searchValue, loading, error, results, searchHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    displayData: getDisplayData(),
    loading,
    error,
    saveToHistory,
    clearHistory,
  };
};

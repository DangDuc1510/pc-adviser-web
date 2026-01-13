"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ClockCircleOutlined,
  TagOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { useSearchPopup } from "@/hooks/useSearchPopup";
import { trackSearch } from "@/services/behaviorTracking";

const SearchPopup = ({
  open,
  onClose,
  searchValue,
  setSearchValue,
  onSearch,
}) => {
  const router = useRouter();
  const dropdownRef = useRef(null);
  const { displayData, loading, error, saveToHistory, clearHistory } =
    useSearchPopup(open, searchValue);

  // Calculate total results count
  const getTotalResultsCount = () => {
    if (!displayData || displayData.showHistory) return 0;
    return (
      (displayData.products?.length || 0) +
      (displayData.categories?.length || 0) +
      (displayData.brands?.length || 0) +
      (displayData.suggestKeywords?.length || 0)
    );
  };

  // Handle product click
  const handleProductClick = (product) => {
    if (searchValue) {
      saveToHistory(searchValue);
      trackSearch(searchValue, getTotalResultsCount());
    }
    onClose();
    router.push(`/san-pham/${product.slug || product.id}`);
  };

  // Handle category click
  const handleCategoryClick = (category) => {
    if (searchValue) {
      saveToHistory(searchValue);
      trackSearch(searchValue, getTotalResultsCount());
    }
    onClose();
    router.push(`/san-pham?categoryId=${category.id}`);
  };

  // Handle brand click
  const handleBrandClick = (brand) => {
    if (searchValue) {
      saveToHistory(searchValue);
      trackSearch(searchValue, getTotalResultsCount());
    }
    onClose();
    router.push(`/san-pham?brandId=${brand.id}`);
  };

  // Handle keyword suggestion click
  const handleKeywordClick = (suggestedKeyword) => {
    setSearchValue(suggestedKeyword);
    saveToHistory(suggestedKeyword);
  };

  // Handle history item click
  const handleHistoryClick = (historyKeyword) => {
    setSearchValue(historyKeyword);
    saveToHistory(historyKeyword);
  };

  // Handle clear history
  const handleClearHistory = () => {
    clearHistory();
  };

  // Handle Enter key
  const handleEnter = (e) => {
    if (e.key === "Enter" && searchValue?.trim()) {
      saveToHistory(searchValue.trim());
      trackSearch(searchValue.trim(), getTotalResultsCount());
      onClose();
      router.push(`/tim-kiem?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  // Hide scrollbar
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      div[data-search-dropdown]::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      ref={dropdownRef}
      data-search-dropdown
      className="absolute top-full left-1/2 -translate-x-1/2  w-full min-w-[800px] bg-white shadow-lg border border-gray-200 rounded-b-lg mt-1 z-[1001]"
      style={{
        maxHeight: "500px",
        overflowY: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      onKeyDown={handleEnter}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="!px-6 !py-4 !pb-6 !gap-4">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-8 text-center text-gray-500">
            <p className="text-red-500">{error}</p>
            <p className="text-sm mt-2">Vui lòng thử lại với từ khóa khác</p>
          </div>
        )}

        {/* History/Trending State */}
        {displayData.showHistory && !loading && !error && (
          <div className="!space-y-6">
            {/* Search History */}
            {displayData.history.length > 0 && (
              <div>
                <div className="flex items-center justify-between !mb-3">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    LỊCH SỬ TÌM KIẾM
                  </h3>
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Xóa lịch sử
                  </button>
                </div>
                <div className="!space-y-1">
                  {displayData.history.slice(0, 3).map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleHistoryClick(item)}
                      className="!px-3 !py-2 hover:bg-gray-50 cursor-pointer rounded flex items-center gap-2 group"
                    >
                      <ClockCircleOutlined className="text-gray-400 text-sm" />
                      <span className="text-gray-700 text-sm flex-1">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Keywords */}
            {displayData.trending.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide !mb-3">
                  TỪ KHÓA PHỔ BIẾN
                </h3>
                <div className="flex flex-wrap !gap-2">
                  {displayData.trending.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleKeywordClick(item)}
                      className="!px-3 !py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        {!displayData.showHistory && !loading && !error && (
          <div className="!space-y-6">
            {/* Categories */}
            {displayData.categories && displayData.categories.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide !mb-3">
                  DANH MỤC ({displayData.categories.length})
                </h3>
                <div className="!space-y-2">
                  {displayData.categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className="!px-3 !py-2 hover:bg-gray-50 cursor-pointer rounded-lg border border-transparent hover:border-gray-200 transition-all flex items-center gap-3"
                    >
                      <TagOutlined className="text-gray-400 text-base" />
                      <span className="text-sm font-medium text-gray-900 flex-1">
                        {category.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brands */}
            {displayData.brands && displayData.brands.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide !mb-3">
                  THƯƠNG HIỆU ({displayData.brands.length})
                </h3>
                <div className="!space-y-2">
                  {displayData.brands.map((brand) => (
                    <div
                      key={brand.id}
                      onClick={() => handleBrandClick(brand)}
                      className="!px-3 !py-2 hover:bg-gray-50 cursor-pointer rounded-lg border border-transparent hover:border-gray-200 transition-all flex items-center gap-3"
                    >
                      <ShopOutlined className="text-gray-400 text-base" />
                      <span className="text-sm font-medium text-gray-900 flex-1">
                        {brand.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Keywords */}
            {displayData.suggestKeywords.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide !mb-3">
                  TỪ KHÓA GỢI Ý
                </h3>
                <div className="flex flex-wrap !gap-2">
                  {displayData.suggestKeywords.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleKeywordClick(item)}
                      className="!px-3 !py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {displayData.products.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide !mb-3">
                  SẢN PHẨM GỢI Ý ({displayData.products.length})
                </h3>
                <div className="!space-y-2">
                  {displayData.products.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="!px-3 !py-2 hover:bg-gray-50 cursor-pointer rounded-lg border border-transparent hover:border-gray-200 transition-all flex items-center gap-3"
                    >
                      {/* Product Image */}
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name || "Product"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        {product.brand && (
                          <p className="text-xs text-gray-500">
                            {product.brand}
                          </p>
                        )}
                        {product.price && (
                          <p className="text-sm font-semibold text-red-600 mt-1">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(product.price)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchValue?.trim().length >= 2 &&
              displayData.products.length === 0 &&
              displayData.categories.length === 0 &&
              displayData.brands.length === 0 &&
              displayData.suggestKeywords.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  <p>Không tìm thấy kết quả</p>
                  <p className="text-sm mt-2">
                    Thử với từ khóa khác hoặc xem sản phẩm gợi ý
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPopup;

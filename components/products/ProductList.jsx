"use client";

import { memo, useMemo, useCallback } from "react";
import { Row, Col, Select, Pagination, Typography } from "antd";
import ProductCard from "@/components/products/ProductCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import { PRODUCT_SORT_OPTIONS } from "@/config/orderConstants";

const { Text } = Typography;

// Memoize ProductCard to prevent unnecessary re-renders
const MemoizedProductCard = memo(ProductCard);

function ProductList({
  products = [],
  loading = false,
  pagination = {},
  sortBy = "newest",
  onSortChange,
  onChangePage,
  onChangePageSize,
  onClearFilters,
}) {
  // Memoize results count text
  const resultsText = useMemo(() => {
    if (loading) return "Đang tải...";
    return `Hiển thị ${products.length} / ${pagination.total || 0} sản phẩm`;
  }, [loading, products.length, pagination.total]);

  // Memoize pagination handler
  const handlePageSizeChange = useCallback(
    (current, size) => {
      onChangePageSize(size);
    },
    [onChangePageSize]
  );

  // Memoize pagination total text
  const paginationTotalText = useCallback(
    (total) => `Tổng ${total} sản phẩm`,
    []
  );

  return (
    <div>
      {/* Sort and Results Count */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <Text type="secondary">{resultsText}</Text>
        <Select
          value={sortBy}
          onChange={onSortChange}
          style={{ width: 200 }}
          options={PRODUCT_SORT_OPTIONS}
          optionRender={(option) => (
            <span className={option.value === sortBy ? "text-white" : ""}>
              {option.label}
            </span>
          )}
        />
      </div>

      {/* Products Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <EmptyState
          title="Không tìm thấy sản phẩm"
          description="Thử thay đổi bộ lọc hoặc tìm kiếm khác"
          actionText="Xóa bộ lọc"
          onAction={onClearFilters}
        />
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {products.map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={6} key={product._id}>
                <MemoizedProductCard product={product} />
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 48,
              }}
            >
              <Pagination
                current={pagination.page}
                total={pagination.total}
                pageSize={pagination.limit}
                onChange={onChangePage}
                onShowSizeChange={handlePageSizeChange}
                showSizeChanger
                showTotal={paginationTotalText}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default memo(ProductList);

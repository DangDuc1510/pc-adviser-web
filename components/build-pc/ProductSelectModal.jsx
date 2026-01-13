"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Modal,
  Form,
  Row,
  Col,
  Card,
  Select,
  Input,
  Button,
  Typography,
  Space,
  Tag,
  Checkbox,
  Slider,
  Pagination,
  Spin,
  Empty,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  CheckOutlined,
  StarOutlined,
  FireOutlined,
  AppstoreOutlined,
  BgColorsOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { ProductsApi, CategoriesApi } from "@/apis/products";
import { api } from "@/apis/axios";
import APIConfig from "@/apis/config";
import SubFilterSection from "@/components/products/SubFilterSection";
import ProductCard from "@/components/products/ProductCard";
import { formatPrice } from "@/utils/format";
import { debounce } from "@/utils/helpers";
import { trackSearch, trackEvent, trackClick } from "@/services/behaviorTracking";

const { Text, Title } = Typography;
const { Search } = Input;

const ProductSelectModal = ({
  open,
  onClose,
  componentType,
  onSelect,
  selectedProductId = null,
}) => {
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const debouncedApplyFiltersRef = useRef(null);

  // Get categoryId from componentType (category level 0)
  const categoryId = componentType?.categoryId;

  // Get filter options for the componentType category
  const { data: filterOptionsData, isLoading: loadingFilterOptions } = useQuery(
    {
      queryKey: ["allFilterOptions", categoryId],
      queryFn: async () => {
        const response = await ProductsApi.getAllFilterOptions(categoryId);
        return response.success
          ? response.data
          : {
              categories: [],
              brands: [],
              useCases: [],
              colors: [],
              statuses: [],
              priceRanges: [],
              categoryFilters: { filters: [] },
            };
      },
      enabled: !!categoryId && open,
      placeholderData: (previousData) => previousData,
    }
  );

  const brands = filterOptionsData?.brands || [];
  const useCasesOptions = filterOptionsData?.useCases || [];
  const colorsOptions = filterOptionsData?.colors || [];
  const priceRangesOptions = filterOptionsData?.priceRanges || [];
  const subFilters = filterOptionsData?.categoryFilters?.filters || [];

  // Build query params
  const formValues = Form.useWatch([], form);
  const searchQuery = formValues?.search || "";
  const selectedBrands = formValues?.brandId || [];
  const selectedUseCases = formValues?.useCases || [];
  const selectedColors = formValues?.colors || [];
  const isFeatured = formValues?.isFeatured === true ? true : undefined;
  const isOnSale = formValues?.isOnSale === true ? true : undefined;
  // Parse priceRange from JSON string if it's a string
  const selectedPriceRange = formValues?.priceRange
    ? typeof formValues.priceRange === "string"
      ? JSON.parse(formValues.priceRange)
      : formValues.priceRange
    : undefined;

  const queryParams = useMemo(() => {
    const filters = {
      categoryId: categoryId || undefined,
      brandId: selectedBrands.length > 0 ? selectedBrands.join(",") : undefined,
      useCases:
        selectedUseCases.length > 0 ? selectedUseCases.join(",") : undefined,
      colors: selectedColors.length > 0 ? selectedColors.join(",") : undefined,
      isFeatured: isFeatured !== undefined ? String(isFeatured) : undefined,
      isOnSale: isOnSale !== undefined ? String(isOnSale) : undefined,
      minPrice: selectedPriceRange?.min || undefined,
      maxPrice: selectedPriceRange?.max || undefined,
      search: searchQuery.trim() || undefined,
    };

    // Add sub-filter values (specs.*)
    subFilters.forEach((filter) => {
      const filterValue = formValues?.[filter.key];
      if (
        filterValue !== undefined &&
        filterValue !== null &&
        filterValue !== ""
      ) {
        if (
          filter.type === "range" &&
          Array.isArray(filterValue) &&
          filterValue.length === 2
        ) {
          const fieldName = filter.key.replace("specs.", "");
          filters[`specs.${fieldName}_min`] = filterValue[0];
          filters[`specs.${fieldName}_max`] = filterValue[1];
        } else if (Array.isArray(filterValue) && filterValue.length > 0) {
          filters[filter.key] = filterValue.join(",");
        } else if (!Array.isArray(filterValue)) {
          filters[filter.key] = String(filterValue);
        }
      }
    });

    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );

    return {
      page,
      limit,
      ...cleanedFilters,
    };
  }, [
    page,
    limit,
    categoryId,
    selectedBrands,
    selectedUseCases,
    selectedColors,
    isFeatured,
    isOnSale,
    selectedPriceRange,
    searchQuery,
    subFilters,
    formValues,
  ]);

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ["products", "modal", queryParams],
    queryFn: async () => {
      const response = await ProductsApi.getAll(queryParams);
      return response;
    },
    select: (data) => {
      return {
        products: data.products || data,
        pagination: data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
        },
      };
    },
    enabled: open,
    keepPreviousData: true,
  });

  const products = data?.products || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  };

  // Track filter changes
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    // Skip tracking on first render or when modal is closed
    if (isFirstRenderRef.current || !open) {
      isFirstRenderRef.current = false;
      return;
    }

    // Only track if there are active filters
    const hasFilters =
      selectedBrands.length > 0 ||
      selectedUseCases.length > 0 ||
      selectedColors.length > 0 ||
      isFeatured !== undefined ||
      isOnSale !== undefined ||
      searchQuery.trim() !== "" ||
      selectedPriceRange !== undefined;

    if (hasFilters && !isLoading && products.length >= 0) {
      trackEvent({
        eventType: "click",
        entityType: "page",
        entityId: "build-pc-modal",
        metadata: {
          action: "apply_filters",
          filters: {
            brandId: selectedBrands.length > 0 ? selectedBrands : null,
            useCases: selectedUseCases.length > 0 ? selectedUseCases : null,
            colors: selectedColors.length > 0 ? selectedColors : null,
            priceRange: selectedPriceRange || null,
            isFeatured: isFeatured || null,
            isOnSale: isOnSale || null,
            search: searchQuery.trim() || null,
          },
          resultsCount: products.length,
          context: "build-pc-modal",
          componentType: componentType?.label,
        },
      });
    }
  }, [
    selectedBrands,
    selectedUseCases,
    selectedColors,
    isFeatured,
    isOnSale,
    searchQuery,
    selectedPriceRange,
    products.length,
    isLoading,
    open,
    componentType?.label,
  ]);

  // Apply filters - reset page to 1
  const applyFilters = useCallback(() => {
    setPage(1);
  }, []);

  // Create debounced version of applyFilters
  useEffect(() => {
    debouncedApplyFiltersRef.current = debounce(() => {
      applyFilters();
    }, 500);

    return () => {
      if (debouncedApplyFiltersRef.current) {
        debouncedApplyFiltersRef.current.cancel?.();
      }
    };
  }, [applyFilters]);

  // Handle form values change with debounce
  const handleValuesChange = useCallback((changedValues, allValues) => {
    if (debouncedApplyFiltersRef.current) {
      debouncedApplyFiltersRef.current();
    }
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    const subFilterFields = subFilters.reduce((acc, filter) => {
      acc[filter.key] = undefined;
      return acc;
    }, {});

    form.setFieldsValue({
      brandId: [],
      useCases: [],
      colors: [],
      isFeatured: undefined,
      isOnSale: undefined,
      priceRange: undefined,
      search: "",
      ...subFilterFields,
    });
    setPage(1);
  }, [form, subFilters]);

  // Handle product select
  const handleSelectProduct = useCallback(
    (product) => {
      if (product?._id) {
        trackClick("product", product._id, {
          productName: product.name,
          componentType: componentType?.label,
          context: "build-pc-modal",
          action: "select_for_build",
        });
      }
      if (onSelect) {
        onSelect(product);
        onClose();
      }
    },
    [onSelect, onClose, componentType?.label]
  );

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.resetFields();
      setPage(1);
    }
  }, [open, form]);

  const brandOptions = useMemo(
    () =>
      brands.map((brand) => (
        <Select.Option key={brand._id} value={brand._id}>
          {brand.name}
        </Select.Option>
      )),
    [brands]
  );

  const useCaseOptions = useMemo(
    () =>
      useCasesOptions.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          {option.label}
        </Select.Option>
      )),
    [useCasesOptions]
  );

  const colorOptions = useMemo(
    () =>
      colorsOptions.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          {option.label}
        </Select.Option>
      )),
    [colorsOptions]
  );

  const priceRangeOptions = useMemo(
    () =>
      priceRangesOptions.map((range) => (
        <Select.Option
          key={`${range.min}-${range.max || "max"}`}
          value={JSON.stringify(range)}
          label={range.label}
        >
          {range.label}
        </Select.Option>
      )),
    [priceRangesOptions]
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={`Chọn ${componentType?.label || "linh kiện"}`}
      width={1200}
      footer={null}
      style={{ top: 20 }}
    >
      <Form form={form} onValuesChange={handleValuesChange}>
        {/* Search and Filters */}
        <Card
          style={{
            marginBottom: 16,
            borderRadius: 8,
          }}
        >
          {/* Search and Quick Filters Row */}
          <Row gutter={[16, 16]} align="middle">
            {/* Search */}
            <Col xs={24} sm={24} md={16}>
              <Form.Item name="search" noStyle>
                <Search
                  placeholder="Tìm kiếm sản phẩm..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={(value) => {
                    if (debouncedApplyFiltersRef.current) {
                      debouncedApplyFiltersRef.current.cancel?.();
                    }
                    if (value?.trim()) {
                      trackSearch(value.trim(), products.length, {
                        context: "build-pc-modal",
                        componentType: componentType?.label,
                      });
                    }
                    applyFilters();
                  }}
                />
              </Form.Item>
            </Col>

            {/* Boolean Filters */}
            <Col
              xs={24}
              sm={24}
              md={8}
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Space align="end" size="middle" wrap>
                <Form.Item name="isFeatured" valuePropName="checked" noStyle>
                  <Checkbox
                    onChange={(e) => {
                      form.setFieldValue(
                        "isFeatured",
                        e.target.checked || undefined
                      );
                    }}
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <StarOutlined
                      style={{ marginRight: 6, color: "#faad14" }}
                    />
                    Nổi bật
                  </Checkbox>
                </Form.Item>
                <Form.Item name="isOnSale" valuePropName="checked" noStyle>
                  <Checkbox
                    onChange={(e) => {
                      form.setFieldValue(
                        "isOnSale",
                        e.target.checked || undefined
                      );
                    }}
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <FireOutlined
                      style={{ marginRight: 6, color: "#ff4d4f" }}
                    />
                    Đang giảm giá
                  </Checkbox>
                </Form.Item>
              </Space>
            </Col>
          </Row>

          {/* Advanced Filters Row */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {/* Use Cases */}
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: 13, color: "#666" }}>
                  <AppstoreOutlined style={{ marginRight: 6 }} />
                  Mục đích sử dụng
                </Text>
              </div>
              <Form.Item name="useCases" noStyle>
                <Select
                  mode="multiple"
                  placeholder="Chọn mục đích sử dụng"
                  style={{ width: "100%" }}
                  loading={loadingFilterOptions}
                  maxTagCount="responsive"
                  allowClear
                  showSearch
                  filterOption={(input, option) => {
                    const text = option?.children || option?.label || "";
                    return String(text)
                      .toLowerCase()
                      .includes(input.toLowerCase());
                  }}
                >
                  {useCaseOptions}
                </Select>
              </Form.Item>
            </Col>

            {/* Colors */}
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: 13, color: "#666" }}>
                  <BgColorsOutlined style={{ marginRight: 6 }} />
                  Màu sắc
                </Text>
              </div>
              <Form.Item name="colors" noStyle>
                <Select
                  mode="multiple"
                  placeholder="Chọn màu sắc"
                  style={{ width: "100%" }}
                  loading={loadingFilterOptions}
                  maxTagCount="responsive"
                  allowClear
                  showSearch
                  filterOption={(input, option) => {
                    const text = option?.children || option?.label || "";
                    return String(text)
                      .toLowerCase()
                      .includes(input.toLowerCase());
                  }}
                >
                  {colorOptions}
                </Select>
              </Form.Item>
            </Col>

            {/* Price Range */}
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: 13, color: "#666" }}>
                  <DollarOutlined style={{ marginRight: 6 }} />
                  Khoảng giá
                </Text>
              </div>
              <Form.Item name="priceRange" noStyle>
                <Select
                  placeholder="Chọn khoảng giá"
                  style={{ width: "100%" }}
                  loading={loadingFilterOptions}
                  allowClear
                  showSearch
                  filterOption={(input, option) => {
                    const text = option?.children || option?.label || "";
                    return String(text)
                      .toLowerCase()
                      .includes(input.toLowerCase());
                  }}
                  value={
                    selectedPriceRange
                      ? JSON.stringify(selectedPriceRange)
                      : undefined
                  }
                  onChange={(value) => {
                    form.setFieldValue(
                      "priceRange",
                      value ? JSON.parse(value) : undefined
                    );
                  }}
                >
                  {priceRangeOptions}
                </Select>
              </Form.Item>
            </Col>

            {/* Brand */}
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: 13, color: "#666" }}>
                  Thương hiệu
                </Text>
              </div>
              <Form.Item name="brandId" noStyle>
                <Select
                  mode="multiple"
                  placeholder="Chọn thương hiệu"
                  style={{ width: "100%" }}
                  loading={loadingFilterOptions}
                  maxTagCount="responsive"
                  allowClear
                  showSearch
                  filterOption={(input, option) => {
                    const text = option?.children || option?.label || "";
                    return String(text)
                      .toLowerCase()
                      .includes(input.toLowerCase());
                  }}
                >
                  {brandOptions}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Sub-Filters Section */}
          {subFilters.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <SubFilterSection
                form={form}
                filters={subFilters}
                loading={loadingFilterOptions}
              />
            </div>
          )}

          {/* Clear Filters Button */}
          {(selectedBrands.length > 0 ||
            selectedUseCases.length > 0 ||
            selectedColors.length > 0 ||
            isFeatured !== undefined ||
            isOnSale !== undefined ||
            selectedPriceRange ||
            searchQuery) && (
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Button
                type="text"
                danger
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </Card>

        {/* Products List */}
        <Spin spinning={isLoading}>
          {products.length > 0 ? (
            <>
              <Row gutter={[16, 16]}>
                {products.map((product) => {
                  const isSelected = selectedProductId === product._id;
                  return (
                    <Col xs={24} sm={12} md={8} key={product._id}>
                      <div
                        style={{
                          position: "relative",
                          cursor: "pointer",
                        }}
                        onClick={() => handleSelectProduct(product)}
                      >
                        {isSelected && (
                          <div
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              zIndex: 2,
                            }}
                          >
                            <Tag
                              color="blue"
                              icon={<CheckOutlined />}
                              style={{ fontSize: 12 }}
                            >
                              Đã chọn
                            </Tag>
                          </div>
                        )}
                        <div
                          style={{
                            border: isSelected
                              ? "2px solid #1890ff"
                              : "1px solid #E0E0E0",
                            borderRadius: 8,
                            overflow: "hidden",
                            transition: "all 0.3s",
                          }}
                        >
                          <ProductCard
                            product={product}
                            disableNavigation={true}
                            onCardClick={() => handleSelectProduct(product)}
                          />
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div style={{ marginTop: 24, textAlign: "center" }}>
                  <Pagination
                    current={page}
                    total={pagination.total}
                    pageSize={limit}
                    onChange={setPage}
                    showSizeChanger={false}
                    showTotal={(total) => `Tổng ${total} sản phẩm`}
                  />
                </div>
              )}
            </>
          ) : (
            <Empty
              description="Không tìm thấy sản phẩm nào"
              style={{ padding: "40px 0" }}
            />
          )}
        </Spin>
      </Form>
    </Modal>
  );
};

export default ProductSelectModal;

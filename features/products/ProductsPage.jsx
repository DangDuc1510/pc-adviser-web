"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Form,
  Row,
  Col,
  Card,
  Select,
  Slider,
  Typography,
  Space,
  Input,
  Tag,
  Checkbox,
  Button,
  Divider,
  Badge,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  UpOutlined,
  DownOutlined,
  CloseOutlined,
  AppstoreOutlined,
  StarOutlined,
  FireOutlined,
  BgColorsOutlined,
  TagOutlined,
  DollarOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import ProductList from "@/components/products/ProductList";
import SubFilterSection from "@/components/products/SubFilterSection";
import { ProductsApi } from "@/apis/products";
import { DEFAULT_PAGE_SIZE } from "@/config/orderConstants";
import { debounce } from "@/utils/helpers";
import { formatPrice } from "@/utils/format";
import { trackEvent, trackSearch } from "@/services/behaviorTracking";

const { Text, Title } = Typography;
const { Search } = Input;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const isMountedRef = useRef(false);
  const debouncedApplyFiltersRef = useRef(null);
  const debouncedSearchRef = useRef(null);
  const urlCategoryIdRef = useRef(null);

  // Local state for search input (for debouncing)
  const [searchInputValue, setSearchInputValue] = useState("");

  // Get form values
  const formValues = Form.useWatch([], form);

  // Read categoryId from URL params and apply to form
  useEffect(() => {
    const categoryIdFromUrl = searchParams.get("categoryId");

    // Only update if URL param is different from current form value
    if (categoryIdFromUrl && categoryIdFromUrl !== urlCategoryIdRef.current) {
      urlCategoryIdRef.current = categoryIdFromUrl;
      form.setFieldValue("categoryId", categoryIdFromUrl);
      setPage(1);

      // Cancel any pending debounced filters
      if (debouncedApplyFiltersRef.current) {
        debouncedApplyFiltersRef.current.cancel?.();
      }
    } else if (!categoryIdFromUrl && urlCategoryIdRef.current) {
      // URL param was removed, clear the filter
      urlCategoryIdRef.current = null;
      form.setFieldValue("categoryId", undefined);
      setPage(1);
    }
  }, [searchParams, form]);

  // Pagination and sort states (not in form)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState("newest");

  // Store category name to avoid flickering when data is loading
  const [selectedCategoryName, setSelectedCategoryName] = useState(undefined);

  // UI state for filter collapse
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  // Extract filter values from form
  const selectedCategory = formValues?.categoryId || undefined;
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
  const searchQuery = formValues?.search || "";

  // Fetch all filter options in one API call
  const selectedCategoryId = selectedCategory || null;
  const { data: filterOptionsData, isLoading: loadingFilterOptions } = useQuery(
    {
      queryKey: ["allFilterOptions", selectedCategoryId],
      queryFn: async () => {
        const response = await ProductsApi.getAllFilterOptions(
          selectedCategoryId
        );
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
      placeholderData: (previousData) => previousData,
    }
  );

  const categories = filterOptionsData?.categories || [];
  const brands = filterOptionsData?.brands || [];
  const useCasesOptions = filterOptionsData?.useCases || [];
  const colorsOptions = filterOptionsData?.colors || [];
  const priceRangesOptions = filterOptionsData?.priceRanges || [];
  const subFilters = filterOptionsData?.categoryFilters?.filters || [];

  // Update category name when categories data is loaded or category changes
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const category = categories.find((c) => c._id === selectedCategory);
      if (category?.name) {
        setSelectedCategoryName(category.name);
      }
    } else if (!selectedCategory) {
      setSelectedCategoryName(undefined);
    }
  }, [selectedCategory, categories]);

  // Loading states (all use same loading state)
  const loadingCategories = loadingFilterOptions;
  const loadingBrands = loadingFilterOptions;
  const loadingUseCases = loadingFilterOptions;
  const loadingColors = loadingFilterOptions;
  const loadingPriceRanges = loadingFilterOptions;
  const loadingCategoryFilters = loadingFilterOptions;

  // Build query params for products API - depends directly on form values
  const queryParams = useMemo(() => {
    const filters = {
      categoryId: selectedCategory || undefined,
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
          // For range type, send min and max separately
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

    // Remove undefined values
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );

    return {
      page,
      limit,
      sort: sortBy,
      ...cleanedFilters,
    };
  }, [
    page,
    limit,
    sortBy,
    selectedCategory,
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
    queryKey: ["products", queryParams],
    queryFn: async () => {
      const response = await ProductsApi.getAll(queryParams);
      return response;
    },
    select: (data) => {
      return {
        products: data.products || data,
        pagination: data.pagination || {
          page: 1,
          limit: DEFAULT_PAGE_SIZE,
          total: 0,
          totalPages: 0,
        },
      };
    },
    keepPreviousData: true,
  });

  const products = data?.products || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  };

  // Track search when search query changes and products are loaded
  const prevSearchQueryRef = useRef(searchQuery);
  useEffect(() => {
    // Track search if query changed and we have results
    if (
      searchQuery &&
      searchQuery.trim() &&
      searchQuery !== prevSearchQueryRef.current &&
      !isLoading &&
      products.length >= 0
    ) {
      trackSearch(searchQuery.trim(), products.length);
      prevSearchQueryRef.current = searchQuery;
    } else if (searchQuery !== prevSearchQueryRef.current) {
      prevSearchQueryRef.current = searchQuery;
    }
  }, [searchQuery, products.length, isLoading]);

  // Track filter changes
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    // Skip tracking on first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    // Only track if there are active filters
    const hasFilters =
      selectedCategory ||
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
        entityId:
          typeof window !== "undefined"
            ? window.location.pathname
            : "/san-pham",
        metadata: {
          action: "apply_filters",
          filters: {
            categoryId: selectedCategory || null,
            brandId: selectedBrands.length > 0 ? selectedBrands : null,
            useCases: selectedUseCases.length > 0 ? selectedUseCases : null,
            colors: selectedColors.length > 0 ? selectedColors : null,
            priceRange: selectedPriceRange || null,
            isFeatured: isFeatured || null,
            isOnSale: isOnSale || null,
            search: searchQuery.trim() || null,
          },
          resultsCount: products.length,
          context: "products-page",
        },
      });
    }
  }, [
    selectedCategory,
    selectedBrands,
    selectedUseCases,
    selectedColors,
    isFeatured,
    isOnSale,
    searchQuery,
    selectedPriceRange,
    products.length,
    isLoading,
  ]);

  // Apply filters - reset page to 1
  const applyFilters = useCallback(() => {
    setPage(1);
  }, []);

  // Create debounced version of applyFilters
  useEffect(() => {
    debouncedApplyFiltersRef.current = debounce(() => {
      applyFilters();
    }, 1000);

    return () => {
      if (debouncedApplyFiltersRef.current) {
        debouncedApplyFiltersRef.current.cancel?.();
      }
    };
  }, [applyFilters]);

  // Create debounced version for search input (1 second)
  // This will update form value after debounce, which triggers API call
  useEffect(() => {
    let timeoutId = null;

    const debouncedFn = (value) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        form.setFieldValue("search", value);
        setPage(1);
      }, 1000);
    };

    debouncedFn.cancel = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    debouncedSearchRef.current = debouncedFn;

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [form]);

  // Sync searchInputValue with form value when form is reset or cleared externally
  useEffect(() => {
    const currentFormSearch = formValues?.search || "";
    // Only sync if form value changed externally (not from our input)
    if (currentFormSearch !== searchInputValue) {
      setSearchInputValue(currentFormSearch);
    }
  }, [formValues?.search]);

  // Handle form values change with debounce
  const handleValuesChange = useCallback((changedValues, allValues) => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    // Check if there are active filters
    const hasActiveFilters =
      allValues.categoryId ||
      (allValues.brandId?.length || 0) > 0 ||
      (allValues.useCases?.length || 0) > 0 ||
      (allValues.colors?.length || 0) > 0 ||
      allValues.isFeatured !== undefined ||
      allValues.isOnSale !== undefined ||
      (allValues.search?.trim() || "").length > 0 ||
      allValues.priceRange !== undefined;

    if (hasActiveFilters && debouncedApplyFiltersRef.current) {
      debouncedApplyFiltersRef.current();
    }
  }, []);

  // Handlers for filter removal - apply immediately
  const handleRemoveCategory = useCallback(() => {
    form.setFieldValue("categoryId", undefined);
    setSelectedCategoryName(undefined);
    if (debouncedApplyFiltersRef.current) {
      debouncedApplyFiltersRef.current.cancel?.();
    }
    setPage(1);
  }, [form]);

  const handleRemoveBrand = useCallback(() => {
    form.setFieldValue("brandId", []);
    if (debouncedApplyFiltersRef.current) {
      debouncedApplyFiltersRef.current.cancel?.();
    }
    setPage(1);
  }, [form]);

  const handleRemoveUseCase = useCallback(() => {
    form.setFieldValue("useCases", []);
    if (debouncedApplyFiltersRef.current) {
      debouncedApplyFiltersRef.current.cancel?.();
    }
    setPage(1);
  }, [form]);

  const handleRemoveColor = useCallback(() => {
    form.setFieldValue("colors", []);
    if (debouncedApplyFiltersRef.current) {
      debouncedApplyFiltersRef.current.cancel?.();
    }
    setPage(1);
  }, [form]);

  const handleRemoveFeatured = useCallback(() => {
    form.setFieldValue("isFeatured", undefined);
    if (debouncedApplyFiltersRef.current) {
      debouncedApplyFiltersRef.current.cancel?.();
    }
    setPage(1);
  }, [form]);

  const handleRemoveOnSale = useCallback(() => {
    form.setFieldValue("isOnSale", undefined);
    if (debouncedApplyFiltersRef.current) {
      debouncedApplyFiltersRef.current.cancel?.();
    }
    setPage(1);
  }, [form]);

  const handleRemoveSearch = useCallback(() => {
    form.setFieldValue("search", "");
    if (debouncedApplyFiltersRef.current) {
      debouncedApplyFiltersRef.current.cancel?.();
    }
    setPage(1);
  }, [form]);

  const handleRemovePriceRange = useCallback(() => {
    form.setFieldValue("priceRange", undefined);
    if (debouncedApplyFiltersRef.current) {
      debouncedApplyFiltersRef.current.cancel?.();
    }
    setPage(1);
  }, [form]);

  const handleClearFilters = useCallback(() => {
    // Clear all sub-filters
    const subFilterFields = subFilters.reduce((acc, filter) => {
      acc[filter.key] = filter.type === "range" ? undefined : undefined;
      return acc;
    }, {});

    form.setFieldsValue({
      categoryId: undefined,
      brandId: [],
      useCases: [],
      colors: [],
      isFeatured: undefined,
      isOnSale: undefined,
      search: "",
      priceRange: undefined,
      ...subFilterFields,
    });

    setSelectedCategoryName(undefined);
    setSortBy("newest");
    setPage(1);
    setLimit(DEFAULT_PAGE_SIZE);

    if (debouncedApplyFiltersRef.current) {
      debouncedApplyFiltersRef.current.cancel?.();
    }
  }, [form, subFilters]);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
    setPage(1);
  }, []);

  const changePage = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const changePageSize = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  // Memoize computed values
  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategory ||
      selectedBrands.length > 0 ||
      selectedUseCases.length > 0 ||
      selectedColors.length > 0 ||
      isFeatured !== undefined ||
      isOnSale !== undefined ||
      searchQuery.trim() !== "" ||
      selectedPriceRange !== undefined
    );
  }, [
    selectedCategory,
    selectedBrands,
    selectedUseCases,
    selectedColors,
    isFeatured,
    isOnSale,
    searchQuery,
    selectedPriceRange,
  ]);

  // Auto-expand filter when active filters are applied
  useEffect(() => {
    if (hasActiveFilters && !isFilterExpanded) {
      setIsFilterExpanded(true);
    }
  }, [hasActiveFilters, isFilterExpanded]);

  // Memoize select options
  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => (
        <Select.Option key={cat._id} value={cat._id}>
          {cat.name}
        </Select.Option>
      )),
    [categories]
  );

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
    <div className="container min-h-screen !py-[32px]">
      {/* Filter Section */}
      <Form form={form} onValuesChange={handleValuesChange}>
        <div className="pt-[64px]">
          <Card
            style={{
              marginBottom: 24,
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              border: "1px solid #f0f0f0",
              transition: "all 0.3s ease",
            }}
            className="filter-card"
          >
            {/* Hidden form field to store search value */}
            <Form.Item name="search" noStyle hidden>
              <Input type="hidden" />
            </Form.Item>

            {/* Filter Header with Collapse Toggle */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: "1px solid #f0f0f0",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                  minWidth: 200,
                }}
              >
                <FilterOutlined style={{ fontSize: 20, color: "#000" }} />
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    fontSize: "clamp(14px, 2vw, 16px)",
                  }}
                >
                  Bộ lọc sản phẩm
                </Title>
                {hasActiveFilters && (
                  <Badge
                    count={[
                      selectedCategory ? 1 : 0,
                      selectedBrands.length,
                      selectedUseCases.length,
                      selectedColors.length,
                      isFeatured ? 1 : 0,
                      isOnSale ? 1 : 0,
                      searchQuery.trim() ? 1 : 0,
                      selectedPriceRange ? 1 : 0,
                    ].reduce((a, b) => a + b, 0)}
                    style={{ backgroundColor: "#000" }}
                  />
                )}
              </div>
              <Button
                type="text"
                icon={isFilterExpanded ? <UpOutlined /> : <DownOutlined />}
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 14,
                }}
              >
                <span className="hide-mobile">
                  {isFilterExpanded ? "Thu gọn" : "Mở rộng"}
                </span>
              </Button>
            </div>

            {/* Search and Quick Filters Row */}
            <Row gutter={[16, 16]} align="middle">
              {/* Search */}
              <Col xs={24} sm={24} md={16}>
                <Search
                  placeholder="Tìm kiếm sản phẩm..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  className="w-full"
                  value={searchInputValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchInputValue(value);
                    if (debouncedSearchRef.current) {
                      debouncedSearchRef.current(value);
                    }
                  }}
                  onSearch={(value) => {
                    if (debouncedSearchRef.current) {
                      debouncedSearchRef.current.cancel?.();
                    }
                    setSearchInputValue(value);
                    form.setFieldValue("search", value);
                    setPage(1);
                    // Track search event
                    if (value && value.trim()) {
                      trackSearch(value.trim(), 0);
                    }
                  }}
                  onClear={() => {
                    if (debouncedSearchRef.current) {
                      debouncedSearchRef.current.cancel?.();
                    }
                    setSearchInputValue("");
                    form.setFieldValue("search", "");
                    setPage(1);
                  }}
                  style={{
                    borderRadius: 8,
                  }}
                />
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
                <Space
                  align="end"
                  size="middle"
                  wrap
                  style={{
                    width: "100%",
                    justifyContent: "flex-end",
                  }}
                  className="mobile-justify-start"
                >
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

            {/* Expandable Filter Content */}
            <div
              className="filter-collapse"
              style={{
                maxHeight: isFilterExpanded ? "2000px" : "0",
                overflow: "hidden",
                transition:
                  "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: isFilterExpanded ? 1 : 0,
              }}
            >
              <div style={{ paddingTop: 20 }}>
                {/* Advanced Filters Row */}
                <Row gutter={[16, 16]}>
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
                        loading={loadingUseCases}
                        maxTagCount="responsive"
                        allowClear
                        showSearch
                        size="large"
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
                        loading={loadingColors}
                        maxTagCount="responsive"
                        allowClear
                        showSearch
                        size="large"
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
                  <Col xs={24} sm={12} md={12}>
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
                        loading={loadingPriceRanges}
                        allowClear
                        showSearch
                        size="large"
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
                </Row>

                {/* Categories and Brands Row */}
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  {/* Categories Filter */}
                  <Col xs={24} sm={12} md={12}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 13, color: "#666" }}>
                        <TagOutlined style={{ marginRight: 6 }} />
                        Danh mục
                      </Text>
                    </div>
                    <Form.Item name="categoryId" noStyle>
                      <Select
                        placeholder="Chọn danh mục"
                        style={{ width: "100%" }}
                        loading={loadingCategories}
                        allowClear
                        showSearch
                        size="large"
                        filterOption={(input, option) => {
                          const text = option?.children || option?.label || "";
                          return String(text)
                            .toLowerCase()
                            .includes(input.toLowerCase());
                        }}
                        onChange={(value) => {
                          if (value) {
                            const category = categories.find(
                              (c) => c._id === value
                            );
                            if (category?.name) {
                              setSelectedCategoryName(category.name);
                            }
                          } else {
                            setSelectedCategoryName(undefined);
                          }
                          form.setFieldValue("categoryId", value);
                        }}
                      >
                        {categoryOptions}
                      </Select>
                    </Form.Item>
                  </Col>

                  {/* Brands Filter */}
                  <Col xs={24} sm={12} md={12}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 13, color: "#666" }}>
                        <TagOutlined style={{ marginRight: 6 }} />
                        Thương hiệu
                      </Text>
                    </div>
                    <Form.Item name="brandId" noStyle>
                      <Select
                        mode="multiple"
                        placeholder="Chọn thương hiệu"
                        style={{ width: "100%" }}
                        loading={loadingBrands}
                        maxTagCount="responsive"
                        allowClear
                        showSearch
                        size="large"
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

                {/* Sub-Filters Section - Dynamic based on selected category */}
                {subFilters.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <SubFilterSection
                      form={form}
                      filters={subFilters}
                      loading={loadingCategoryFilters}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters Tags */}
            {hasActiveFilters && (
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 20,
                  borderTop: "2px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <Text
                    strong
                    style={{
                      fontSize: 14,
                      color: "#000",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Bộ lọc đang áp dụng:
                  </Text>
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<ClearOutlined />}
                    onClick={handleClearFilters}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span className="hide-mobile">Xóa tất cả</span>
                    <span className="hide-desktop">Xóa</span>
                  </Button>
                </div>
                <Space wrap size={[8, 8]}>
                  {selectedCategory && selectedCategoryName && (
                    <Tag
                      closable
                      onClose={handleRemoveCategory}
                      color="default"
                      style={{
                        cursor: "pointer",
                        padding: "4px 12px",
                        borderRadius: 6,
                        fontSize: 13,
                        border: "1px solid #d9d9d9",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#000";
                        e.currentTarget.style.color = "#000";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d9d9d9";
                        e.currentTarget.style.color = "inherit";
                      }}
                    >
                      <TagOutlined style={{ marginRight: 4 }} />
                      Danh mục: {selectedCategoryName}
                    </Tag>
                  )}
                  {selectedBrands.length > 0 && (
                    <Tag
                      closable
                      onClose={handleRemoveBrand}
                      color="default"
                      style={{
                        cursor: "pointer",
                        padding: "4px 12px",
                        borderRadius: 6,
                        fontSize: 13,
                        border: "1px solid #d9d9d9",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#000";
                        e.currentTarget.style.color = "#000";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d9d9d9";
                        e.currentTarget.style.color = "inherit";
                      }}
                    >
                      <TagOutlined style={{ marginRight: 4 }} />
                      Thương hiệu ({selectedBrands.length})
                    </Tag>
                  )}
                  {selectedUseCases.length > 0 && (
                    <Tag
                      closable
                      onClose={handleRemoveUseCase}
                      color="default"
                      style={{
                        cursor: "pointer",
                        padding: "4px 12px",
                        borderRadius: 6,
                        fontSize: 13,
                        border: "1px solid #d9d9d9",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#000";
                        e.currentTarget.style.color = "#000";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d9d9d9";
                        e.currentTarget.style.color = "inherit";
                      }}
                    >
                      <AppstoreOutlined style={{ marginRight: 4 }} />
                      Mục đích ({selectedUseCases.length})
                    </Tag>
                  )}
                  {selectedColors.length > 0 && (
                    <Tag
                      closable
                      onClose={handleRemoveColor}
                      color="default"
                      style={{
                        cursor: "pointer",
                        padding: "4px 12px",
                        borderRadius: 6,
                        fontSize: 13,
                        border: "1px solid #d9d9d9",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#000";
                        e.currentTarget.style.color = "#000";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d9d9d9";
                        e.currentTarget.style.color = "inherit";
                      }}
                    >
                      <BgColorsOutlined style={{ marginRight: 4 }} />
                      Màu sắc ({selectedColors.length})
                    </Tag>
                  )}
                  {isFeatured !== undefined && (
                    <Tag
                      closable
                      onClose={handleRemoveFeatured}
                      color="default"
                      style={{
                        cursor: "pointer",
                        padding: "4px 12px",
                        borderRadius: 6,
                        fontSize: 13,
                        border: "1px solid #d9d9d9",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#000";
                        e.currentTarget.style.color = "#000";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d9d9d9";
                        e.currentTarget.style.color = "inherit";
                      }}
                    >
                      <StarOutlined
                        style={{ marginRight: 4, color: "#faad14" }}
                      />
                      Nổi bật
                    </Tag>
                  )}
                  {isOnSale !== undefined && (
                    <Tag
                      closable
                      onClose={handleRemoveOnSale}
                      color="default"
                      style={{
                        cursor: "pointer",
                        padding: "4px 12px",
                        borderRadius: 6,
                        fontSize: 13,
                        border: "1px solid #d9d9d9",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#000";
                        e.currentTarget.style.color = "#000";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d9d9d9";
                        e.currentTarget.style.color = "inherit";
                      }}
                    >
                      <FireOutlined
                        style={{ marginRight: 4, color: "#ff4d4f" }}
                      />
                      Đang giảm giá
                    </Tag>
                  )}
                  {searchQuery.trim() && (
                    <Tag
                      closable
                      onClose={handleRemoveSearch}
                      color="default"
                      style={{
                        cursor: "pointer",
                        padding: "4px 12px",
                        borderRadius: 6,
                        fontSize: 13,
                        border: "1px solid #d9d9d9",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#000";
                        e.currentTarget.style.color = "#000";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d9d9d9";
                        e.currentTarget.style.color = "inherit";
                      }}
                    >
                      <SearchOutlined style={{ marginRight: 4 }} />
                      Tìm kiếm: {searchQuery}
                    </Tag>
                  )}
                  {selectedPriceRange && (
                    <Tag
                      closable
                      onClose={handleRemovePriceRange}
                      color="default"
                      style={{
                        cursor: "pointer",
                        padding: "4px 12px",
                        borderRadius: 6,
                        fontSize: 13,
                        border: "1px solid #d9d9d9",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#000";
                        e.currentTarget.style.color = "#000";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d9d9d9";
                        e.currentTarget.style.color = "inherit";
                      }}
                    >
                      <DollarOutlined style={{ marginRight: 4 }} />
                      Giá: {selectedPriceRange.label}
                    </Tag>
                  )}
                </Space>
              </div>
            )}
          </Card>
        </div>
      </Form>

      <ProductList
        products={products}
        loading={isLoading}
        pagination={pagination}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onChangePage={changePage}
        onChangePageSize={changePageSize}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}

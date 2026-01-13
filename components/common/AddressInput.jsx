"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input, Button, Modal, App, Space, Spin, List } from "antd";
import {
  EnvironmentOutlined,
  SearchOutlined,
  AimOutlined,
} from "@ant-design/icons";
import { debounce } from "@/utils/helpers";

const AddressInput = ({
  value,
  onChange,
  placeholder = "Nhập địa chỉ...",
  disabled = false,
  style = {},
  ...props
}) => {
  const { message: messageApi } = App.useApp();
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Initialize map when modal opens with delay
  useEffect(() => {
    if (mapModalVisible && !mapInstanceRef.current) {
      const timer = setTimeout(() => {
        if (mapRef.current) {
          initializeMap();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [mapModalVisible]);

  const initializeMap = async () => {
    try {
      setMapLoaded(false);

      if (!mapRef.current) {
        console.error("Map container not found");
        return;
      }

      const L = (await import("leaflet")).default;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current).setView([16.0471, 108.2068], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        setSelectedCoordinates({ lat, lng });

        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        markerRef.current = L.marker([lat, lng]).addTo(map);
        await reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);
    } catch (error) {
      console.error("Error initializing map:", error);
      messageApi.error("Không thể tải bản đồ");
    }
  };

  const searchAddresses = async (query) => {
    if (!query.trim()) return;

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=vn&limit=5&addressdetails=1`
      );
      const data = await response.json();

      setSearchResults(
        data.map((item) => ({
          id: item.place_id,
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          address: item.address,
        }))
      );
    } catch (error) {
      console.error("Search error:", error);
      messageApi.error("Không thể tìm kiếm địa chỉ");
    } finally {
      setSearchLoading(false);
    }
  };


   const reverseGeocode = async (lat, lng) => {
     try {
       const response = await fetch(
         `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&language=vi`
       );
       const data = await response.json();

       if (data.display_name) {
         setSearchQuery(data.display_name);
       }
     } catch (error) {
       console.error("Reverse geocoding error:", error);
     }
   };

  const handleSelectSearchResult = async (result) => {
    if (mapInstanceRef.current) {
      try {
        const L = (await import("leaflet")).default;

        if (markerRef.current) {
          mapInstanceRef.current.removeLayer(markerRef.current);
        }

        markerRef.current = L.marker([result.lat, result.lng]).addTo(
          mapInstanceRef.current
        );
        mapInstanceRef.current.setView([result.lat, result.lng], 15);

        setSelectedCoordinates({ lat: result.lat, lng: result.lng });
        setSearchQuery(result.display_name);
        setSearchResults([]);
      } catch (error) {
        console.error("Error selecting result:", error);
      }
    }
  };

  const checkGeolocationPermission = async () => {
    if (!navigator.permissions || !navigator.permissions.query) {
      return null;
    }

    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      return result.state;
    } catch (error) {
      console.error("Error checking permission:", error);
      return null;
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      messageApi.error("Trình duyệt không hỗ trợ định vị");
      return;
    }

    setLocationLoading(true);

    try {
      const permissionState = await checkGeolocationPermission();

      if (permissionState === "denied") {
        messageApi.warning(
          "Quyền truy cập vị trí đã bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt."
        );
        setLocationLoading(false);
        return;
      }

      if (permissionState === "prompt") {
        messageApi.info(
          "Vui lòng cho phép truy cập vị trí để sử dụng tính năng này"
        );
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([latitude, longitude], 15);

              if (markerRef.current) {
                mapInstanceRef.current.removeLayer(markerRef.current);
              }

              const L = (await import("leaflet")).default;
              markerRef.current = L.marker([latitude, longitude]).addTo(
                mapInstanceRef.current
              );

              setSelectedCoordinates({ lat: latitude, lng: longitude });
              await reverseGeocode(latitude, longitude);
              messageApi.success("Đã lấy vị trí hiện tại thành công");
            }
          } catch (error) {
            console.error("Error handling location:", error);
            messageApi.error("Có lỗi xảy ra khi xử lý vị trí");
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Không thể lấy vị trí hiện tại";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Quyền truy cập vị trí bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "Không thể xác định vị trí. Vui lòng kiểm tra kết nối GPS.";
              break;
            case error.TIMEOUT:
              errorMessage = "Hết thời gian chờ lấy vị trí. Vui lòng thử lại.";
              break;
            default:
              errorMessage =
                "Không thể lấy vị trí hiện tại. Vui lòng thử lại sau.";
              break;
          }

          messageApi.error(errorMessage);
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } catch (error) {
      console.error("Error in getCurrentLocation:", error);
      messageApi.error("Có lỗi xảy ra khi lấy vị trí");
      setLocationLoading(false);
    }
  };

  const handleConfirmSelection = () => {
    if (searchQuery.trim()) {
      onChange?.(searchQuery.trim());
      setMapModalVisible(false);
    } else {
      messageApi.warning("Vui lòng chọn một địa chỉ");
    }
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.length > 2) {
        searchAddresses(query);
      } else {
        setSearchResults([]);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleModalClose = () => {
    setMapModalVisible(false);
    setSearchResults([]);
    setSearchQuery("");
    setSelectedCoordinates(null);
    setLocationLoading(false);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      setMapLoaded(false);
    }
  };

  return (
    <>
      <Space.Compact style={style} className="!w-full">
        <Input
          {...props}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={{ width: "calc(100% - 40px)" }}
        />
        <Button
          type="default"
          icon={<EnvironmentOutlined />}
          onClick={() => setMapModalVisible(true)}
          disabled={disabled}
          style={{ width: "40px" }}
          title="Chọn từ bản đồ"
        />
      </Space.Compact>

      <Modal
        title="Chọn địa chỉ từ bản đồ"
        open={mapModalVisible}
        onCancel={handleModalClose}
        onOk={handleConfirmSelection}
        width={800}
        destroyOnHidden
        styles={{
          body: { padding: "16px 0" },
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" className="!w-full">
            <Space.Compact className="!w-full">
              <Input
                placeholder="Tìm kiếm địa chỉ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<SearchOutlined />}
                className="!w-full"
              />
              <Button
                type="primary"
                icon={<AimOutlined />}
                onClick={getCurrentLocation}
                title="Vị trí hiện tại"
                className="!w-10"
                loading={locationLoading}
                disabled={locationLoading}
              />
            </Space.Compact>

            {searchLoading && (
              <div style={{ textAlign: "center", padding: "8px" }}>
                <Spin size="small" /> Đang tìm kiếm...
              </div>
            )}

            {searchResults.length > 0 && (
              <div style={{ maxHeight: "120px", overflowY: "auto" }}>
                <List
                  size="small"
                  dataSource={searchResults}
                  renderItem={(result) => (
                    <List.Item
                      style={{
                        cursor: "pointer",
                        padding: "8px",
                        fontSize: "12px",
                      }}
                      onClick={() => handleSelectSearchResult(result)}
                    >
                      <div>{result.display_name}</div>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </Space>
        </div>

        {!mapLoaded && (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Đang tải bản đồ...</div>
          </div>
        )}

        <div
          ref={mapRef}
          style={{
            height: "400px",
            width: "100%",
            border: "1px solid #d9d9d9",
            borderRadius: "4px",
            visibility: mapLoaded ? "visible" : "hidden",
            position: "relative",
          }}
        />

        <div style={{ padding: "8px 24px 0", fontSize: "12px", color: "#666" }}>
          💡 Nhấn vào bản đồ để chọn vị trí hoặc tìm kiếm địa chỉ ở trên
        </div>
      </Modal>

      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
    </>
  );
};

export default AddressInput;

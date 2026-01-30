"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LogoutOutlined,
  ProfileOutlined,
  ShoppingOutlined,
  BuildOutlined,
  SettingOutlined,
  SaveOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { trackSearch } from "@/services/behaviorTracking";
import HeaderMainBar from "./header/HeaderMainBar";
import HeaderMobileDrawer from "./header/HeaderMobileDrawer";
import HeaderCartModal from "./header/HeaderCartModal";
import SearchPopup from "./header/SearchPopup";

const Header = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, cart, loading: cartLoading, clearCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [searchPopupOpen, setSearchPopupOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef(null);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const handleSearch = (value) => {
    // if (value.trim()) {
    //   trackSearch(value.trim());
    //   router.push(`/tim-kiem?q=${encodeURIComponent(value.trim())}`);
    //   setSearchValue("");
    // }
  };

  const handleLogout = async () => {
    try {
      // Clear cart before logout
      if (isAuthenticated && cart?.items && cart.items.length > 0) {
        await clearCart();
      }
    } catch (error) {
      // Continue with logout even if clearCart fails
      console.error("Failed to clear cart on logout:", error);
    }

    await logout();
    router.push("/dang-nhap");
  };

  const handleCartClick = () => {
    setCartModalOpen(true);
  };

  const handleViewCart = () => {
    setCartModalOpen(false);
    router.push("/gio-hang");
  };

  const userMenuItems = isAuthenticated
    ? [
        {
          key: "profile",
          icon: <ProfileOutlined />,
          label: "Thông tin cá nhân",
          onClick: () => router.push("/ca-nhan"),
        },
        {
          key: "orders",
          icon: <ShoppingOutlined />,
          label: "Đơn hàng của tôi",
          onClick: () => router.push("/don-hang"),
        },
        {
          key: "my-configs",
          icon: <SaveOutlined />,
          label: "Cấu hình của tôi",
          onClick: () => router.push("/cau-hinh-cua-toi"),
        },
        {
          key: "vouchers",
          icon: <GiftOutlined />,
          label: "Khuyến mãi của tôi",
          onClick: () => router.push("/khuyen-mai"),
        },
        ...(isAdmin
          ? [
              {
                type: "divider",
              },
              {
                key: "admin",
                icon: <SettingOutlined />,
                label: "Quản trị hệ thống",
                onClick: () => {
                  window.open("/admin", "_blank");
                },
              },
            ]
          : []),
        {
          type: "divider",
        },
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: "Đăng xuất",
          onClick: handleLogout,
        },
      ]
    : [
        {
          key: "login",
          label: "Đăng nhập",
          onClick: () => router.push("/dang-nhap"),
        },
        {
          key: "register",
          label: "Đăng ký",
          onClick: () => router.push("/dang-ky"),
        },
      ];

  const menuItems = [
    {
      key: "products",
      label: <Link href="/san-pham">Sản phẩm</Link>,
    },
    {
      key: "build-pc",
      icon: <BuildOutlined />,
      label: <Link href="/build-pc">Build PC</Link>,
    },
  ];

  const handleSearchFocus = () => {
    setSearchFocused(true);
    setSearchPopupOpen(true);
  };

  const handleSearchBlur = (e) => {
    // Delay to allow click events on dropdown items
    setTimeout(() => {
      const activeElement = document.activeElement;
      const relatedTarget = e.relatedTarget;

      // Check if focus moved to dropdown or its children
      const dropdown = document.querySelector("[data-search-dropdown]");
      if (
        dropdown &&
        (dropdown.contains(activeElement) || dropdown.contains(relatedTarget))
      ) {
        return;
      }

      setSearchFocused(false);
      setSearchPopupOpen(false);
    }, 200);
  };

  return (
    <div className="sticky top-0 z-50">
      <HeaderMainBar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        handleSearch={handleSearch}
        handleCartClick={handleCartClick}
        userMenuItems={userMenuItems}
        isAuthenticated={isAuthenticated}
        user={user}
        itemCount={itemCount}
        menuItems={menuItems}
        setMobileMenuOpen={setMobileMenuOpen}
        onSearchClick={() => setSearchPopupOpen(true)}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
        searchInputRef={searchInputRef}
        searchPopupOpen={searchPopupOpen || searchFocused}
      />

      <HeaderMobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        menuItems={menuItems}
      />

      <HeaderCartModal
        open={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        onViewCart={handleViewCart}
        cart={cart}
        cartLoading={cartLoading}
      />
    </div>
  );
};

export default Header;

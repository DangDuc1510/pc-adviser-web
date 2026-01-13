import {
  Layout,
  Menu,
  Input,
  Button,
  Badge,
  Avatar,
  Dropdown,
  Tooltip,
} from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  SearchOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import SearchPopup from "./SearchPopup";
import { trackSearch } from "@/services/behaviorTracking";

const { Header: AntHeader } = Layout;
const { Search } = Input;

export default function HeaderMainBar({
  searchValue,
  setSearchValue,
  handleSearch,
  handleChatbotClick,
  handleCartClick,
  userMenuItems,
  isAuthenticated,
  user,
  itemCount,
  menuItems,
  setMobileMenuOpen,
  onSearchClick,
  onSearchFocus,
  onSearchBlur,
  searchInputRef,
  searchPopupOpen,
}) {
  return (
    <AntHeader
      style={{
        background: "#FFFFFF",
        padding: "0 24px",
        borderBottom: "1px solid #E0E0E0",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        {/* Logo + Desktop Menu */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                color: "#000",
                letterSpacing: "-0.5px",
              }}
              className="shrink-0"
            >
              PC Adviser
            </h1>
          </Link>

          <Menu
            mode="horizontal"
            items={menuItems}
            style={{
              border: "none",
              background: "transparent",
              minWidth: 400,
            }}
            className="hide-mobile"
          />
        </div>

        {/* Search, Chatbot, Cart, User, Mobile Menu */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "relative",
          }}
        >
          {/* Search - Desktop */}
          <div
            className="hide-mobile"
            style={{ position: "relative", width: 400 }}
          >
            <Input
              ref={searchInputRef}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={onSearchFocus}
              onBlur={onSearchBlur}
              onPressEnter={() => {
                if (searchValue?.trim()) {
                  // Track search event
                  trackSearch(searchValue.trim(), 0);
                  handleSearch(searchValue);
                }
              }}
              placeholder="Bạn muốn mua gì hôm nay..."
              prefix={<SearchOutlined style={{ color: "#999" }} />}
              style={{
                width: "100%",
                height: 40,
              }}
            />
            {searchPopupOpen && (
              <SearchPopup
                open={searchPopupOpen}
                onClose={() => {
                  if (onSearchBlur) {
                    onSearchBlur({ currentTarget: { contains: () => false } });
                  }
                }}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                onSearch={handleSearch}
              />
            )}
          </div>

          {/* Search - Mobile */}
          <Button
            type="text"
            icon={<SearchOutlined style={{ fontSize: 20 }} />}
            onClick={onSearchClick}
            className="hide-desktop"
          />

          {/* Chatbot Button */}
          <Tooltip title="Chat với AI tư vấn">
            <Button
              type="text"
              icon={<MessageOutlined style={{ fontSize: 20 }} />}
              onClick={handleChatbotClick}
            />
          </Tooltip>

          {/* Cart */}
          <Badge count={itemCount} offset={[-2, 2]}>
            <Button
              type="text"
              icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />}
              onClick={handleCartClick}
            />
          </Badge>

          {/* User Menu */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            overlayStyle={{ width: 200, padding: 4 }}
          >
            <div
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Avatar
                size={32}
                icon={<UserOutlined />}
                src={user?.avatar}
                style={{ background: "#000" }}
              />
              {isAuthenticated && user?.userName && (
                <span
                  className="hide-mobile"
                  style={{
                    maxWidth: 100,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.userName}
                </span>
              )}
            </div>
          </Dropdown>

          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 20 }} />}
            onClick={() => setMobileMenuOpen(true)}
            className="hide-desktop"
          />
        </div>
      </div>
    </AntHeader>
  );
}

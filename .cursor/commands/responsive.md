# Responsive Design Command - Tailwind CSS

Command này giúp bạn tạo và quản lý responsive design cho các thiết bị khác nhau: điện thoại, máy tính bảng, laptop và desktop sử dụng Tailwind CSS.

## Tailwind CSS Breakpoints

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      xs: "480px",   // Mobile phones (portrait)
      sm: "576px",   // Mobile phones (landscape)
      md: "768px",   // Tablets
      lg: "992px",   // Small laptops
      xl: "1200px",  // Desktop
      "2xl": "1600px", // Large desktop
    },
  },
};
```

### Breakpoint Reference

- **xs**: `480px` - Mobile phones (portrait)
- **sm**: `576px` - Mobile phones (landscape)
- **md**: `768px` - Tablets
- **lg**: `992px` - Small laptops
- **xl**: `1200px` - Desktop
- **2xl**: `1600px` - Large desktop

## Tailwind Responsive Transformations

Các pattern chuyển đổi responsive phổ biến cho các component với Tailwind CSS:

### 1. List: Grid → Column (Horizontal → Vertical)

```jsx
// Grid layout → Single column on mobile
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map((item) => (
    <div key={item.id}>{item.content}</div>
  ))}
</div>

// Horizontal list → Vertical stack
<ul className="flex flex-col md:flex-row gap-4">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>

// Inline list → Block stack
<div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-4">
  <span>Tag 1</span>
  <span>Tag 2</span>
  <span>Tag 3</span>
</div>
```

### 2. Tab: Horizontal → Vertical / Dropdown

```jsx
// Horizontal tabs → Vertical tabs on mobile
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        className="whitespace-nowrap px-4 py-2 md:px-6 md:py-3"
      >
        {tab.label}
      </button>
    ))}
  </div>
  <div className="flex-1">{activeTabContent}</div>
</div>

// Tabs → Dropdown/Select on mobile
<div className="block md:hidden">
  <select className="w-full p-2 border rounded">
    {tabs.map((tab) => (
      <option key={tab.id} value={tab.id}>
        {tab.label}
      </option>
    ))}
  </select>
</div>
<div className="hidden md:flex gap-2">
  {tabs.map((tab) => (
    <button key={tab.id} className="px-4 py-2">
      {tab.label}
    </button>
  ))}
</div>

// Tabs → Accordion on mobile
<div className="md:hidden">
  {tabs.map((tab) => (
    <div key={tab.id} className="border-b">
      <button className="w-full text-left p-4">{tab.label}</button>
      {isOpen && <div className="p-4">{tab.content}</div>}
    </div>
  ))}
</div>
<div className="hidden md:flex">
  {/* Horizontal tabs */}
</div>
```

### 3. Navigation: Horizontal Menu → Hamburger Menu

```jsx
// Desktop horizontal menu → Mobile hamburger
<nav className="flex items-center justify-between">
  <div className="logo">Logo</div>

  {/* Desktop menu */}
  <ul className="hidden md:flex gap-6">
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>

  {/* Mobile hamburger button */}
  <button className="md:hidden">
    <svg>...</svg>
  </button>
</nav>

// Mobile drawer menu
<div className="fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform translate-x-full md:translate-x-0 md:static md:w-auto md:shadow-none transition-transform">
  <ul className="flex flex-col md:flex-row gap-4 p-4 md:p-0">
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</div>
```

### 4. Card: Grid → Stack

```jsx
// Card grid → Single column stack
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {cards.map((card) => (
    <div key={card.id} className="bg-white rounded-lg shadow p-6">
      <h3>{card.title}</h3>
      <p>{card.description}</p>
    </div>
  ))}
</div>

// Horizontal card → Vertical card
<div className="flex flex-col md:flex-row gap-4 p-4">
  <img src="..." className="w-full md:w-1/3 object-cover" />
  <div className="flex-1">
    <h3>Title</h3>
    <p>Content</p>
  </div>
</div>

// Card with side image → Stacked image
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">
    <img src="..." className="w-full h-48 md:h-full object-cover" />
  </div>
  <div className="w-full md:w-1/2 flex flex-col justify-center">
    <h2>Title</h2>
    <p>Description</p>
  </div>
</div>
```

### 5. Form: Multi-column → Single Column

```jsx
// Two column form → Single column
<form className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label>First Name</label>
    <input type="text" className="w-full" />
  </div>
  <div>
    <label>Last Name</label>
    <input type="text" className="w-full" />
  </div>
  <div className="md:col-span-2">
    <label>Email</label>
    <input type="email" className="w-full" />
  </div>
</form>

// Form with sidebar → Stacked
<div className="flex flex-col lg:flex-row gap-6">
  <div className="w-full lg:w-1/3">
    <h3>Form Fields</h3>
  </div>
  <div className="w-full lg:w-2/3">
    <input type="text" className="w-full" />
  </div>
</div>

// Inline form fields → Stacked
<div className="flex flex-col sm:flex-row gap-4">
  <input type="text" className="flex-1" placeholder="Search..." />
  <button className="w-full sm:w-auto">Search</button>
</div>
```

### 6. Table: Table → Card List

```jsx
// Table → Card list on mobile
<div className="hidden md:block overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {data.map((row) => (
        <tr key={row.id}>
          <td>{row.name}</td>
          <td>{row.email}</td>
          <td>{row.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Card list for mobile */}
<div className="md:hidden space-y-4">
  {data.map((row) => (
    <div key={row.id} className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between mb-2">
        <span className="font-bold">{row.name}</span>
        <span className="badge">{row.status}</span>
      </div>
      <div className="text-sm text-gray-600">{row.email}</div>
    </div>
  ))}
</div>
```

### 7. Sidebar: Sidebar → Drawer/Overlay

```jsx
// Sidebar → Drawer on mobile
<div className="flex">
  {/* Sidebar */}
  <aside className="hidden md:block w-64 bg-gray-100 p-4">
    <nav>
      <ul className="space-y-2">
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </aside>

  {/* Mobile drawer */}
  <aside className="md:hidden fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform -translate-x-full">
    {/* Drawer content */}
  </aside>

  {/* Main content */}
  <main className="flex-1 p-4">
    Content
  </main>
</div>

// Sidebar → Bottom navigation
<div className="flex flex-col md:flex-row min-h-screen">
  <aside className="w-full md:w-64 order-2 md:order-1">
    {/* Desktop sidebar */}
  </aside>
  <main className="flex-1 order-1 md:order-2">
    Content
  </main>
</div>

{/* Bottom nav for mobile */}
<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around">
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>
```

### 8. Gallery: Grid → Carousel

```jsx
// Grid gallery → Carousel on mobile
<div className="hidden md:grid grid-cols-3 gap-4">
  {images.map((img) => (
    <img key={img.id} src={img.src} className="w-full" />
  ))}
</div>

{/* Mobile carousel */}
<div className="md:hidden overflow-x-auto snap-x snap-mandatory flex gap-4">
  {images.map((img) => (
    <img
      key={img.id}
      src={img.src}
      className="w-full flex-shrink-0 snap-center"
    />
  ))}
</div>

// Masonry grid → Simple grid
<div className="columns-1 md:columns-2 lg:columns-3 gap-4">
  {items.map((item) => (
    <div key={item.id} className="break-inside-avoid mb-4">
      {item.content}
    </div>
  ))}
</div>
```

### 9. Modal: Center → Fullscreen

```jsx
// Centered modal → Fullscreen on mobile
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-lg shadow-xl w-full max-w-lg md:max-w-2xl max-h-[90vh] md:max-h-[80vh] overflow-y-auto">
    <div className="p-6">
      <h2>Modal Title</h2>
      <p>Modal content</p>
    </div>
  </div>
</div>

// Fullscreen modal on mobile
<div className="fixed inset-0 z-50 md:flex md:items-center md:justify-center">
  <div className="bg-white w-full h-full md:w-auto md:h-auto md:rounded-lg md:shadow-xl md:max-w-2xl">
    <div className="p-4 md:p-6">
      Content
    </div>
  </div>
</div>
```

### 10. Button Group: Horizontal → Vertical

```jsx
// Horizontal button group → Vertical stack
<div className="flex flex-col sm:flex-row gap-2">
  <button className="w-full sm:w-auto">Primary</button>
  <button className="w-full sm:w-auto">Secondary</button>
  <button className="w-full sm:w-auto">Tertiary</button>
</div>

// Button toolbar → Dropdown on mobile
<div className="hidden md:flex gap-2">
  <button>Edit</button>
  <button>Delete</button>
  <button>Share</button>
</div>

<div className="md:hidden">
  <button className="w-full">More Actions ▼</button>
  {/* Dropdown menu */}
</div>
```

### 11. Breadcrumb: Horizontal → Collapsed

```jsx
// Full breadcrumb → Collapsed on mobile
<nav className="flex items-center gap-2 text-sm">
  <span className="hidden md:inline">Home</span>
  <span className="hidden md:inline">/</span>
  <span className="hidden md:inline">Category</span>
  <span className="hidden lg:inline">/</span>
  <span className="hidden lg:inline">Product</span>
  <span className="md:hidden">← Back</span>
</nav>

// Breadcrumb → Back button
<div className="flex items-center gap-2">
  <button className="md:hidden">←</button>
  <nav className="hidden md:flex gap-2">
    <a href="/">Home</a>
    <span>/</span>
    <a href="/category">Category</a>
  </nav>
</div>
```

### 12. Stats/Dashboard: Grid → Stack

```jsx
// Stats grid → Single column
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <div className="bg-white p-4 rounded">
    <div className="text-2xl font-bold">100</div>
    <div className="text-sm text-gray-600">Total Users</div>
  </div>
  <div className="bg-white p-4 rounded">
    <div className="text-2xl font-bold">50</div>
    <div className="text-sm text-gray-600">Active</div>
  </div>
</div>

// Dashboard layout
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* Main content */}
  </div>
  <div className="lg:col-span-1">
    {/* Sidebar widgets */}
  </div>
</div>
```

### 13. Search Bar: Full Width → Compact

```jsx
// Full width search → Compact on desktop
<div className="w-full md:w-auto">
  <div className="flex gap-2">
    <input
      type="search"
      className="flex-1 md:w-64 px-4 py-2 border rounded"
      placeholder="Search..."
    />
    <button className="px-4 py-2 bg-blue-500 text-white rounded">
      Search
    </button>
  </div>
</div>

// Search bar → Icon button on mobile
<div className="flex items-center gap-2">
  <div className="hidden md:block flex-1">
    <input type="search" className="w-full px-4 py-2" />
  </div>
  <button className="md:hidden">
    <svg>🔍</svg>
  </button>
</div>
```

### 14. Footer: Multi-column → Single Column

```jsx
// Footer columns → Stacked
<footer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 p-8">
  <div>
    <h4>Company</h4>
    <ul className="space-y-2">
      <li>
        <a href="/about">About</a>
      </li>
      <li>
        <a href="/contact">Contact</a>
      </li>
    </ul>
  </div>
  <div>
    <h4>Products</h4>
    <ul className="space-y-2">
      <li>
        <a href="/products">All Products</a>
      </li>
    </ul>
  </div>
  <div>
    <h4>Support</h4>
    <ul className="space-y-2">
      <li>
        <a href="/help">Help Center</a>
      </li>
    </ul>
  </div>
  <div>
    <h4>Follow Us</h4>
    <div className="flex gap-4">
      <a href="#">Facebook</a>
      <a href="#">Twitter</a>
    </div>
  </div>
</footer>
```

### 15. Image Gallery: Grid → Masonry → Single Column

```jsx
// Responsive image grid
<div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
  {images.map((img) => (
    <div key={img.id} className="break-inside-avoid mb-4">
      <img src={img.src} className="w-full rounded" />
    </div>
  ))}
</div>

// Aspect ratio preservation
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {images.map((img) => (
    <div key={img.id} className="aspect-square">
      <img src={img.src} className="w-full h-full object-cover rounded" />
    </div>
  ))}
</div>
```

## Tailwind Utility Classes cho Responsive

### Hide/Show theo breakpoint

```jsx
// Hide on mobile, show on desktop
<div className="hidden md:block">Desktop only</div>

// Show on mobile, hide on desktop
<div className="block md:hidden">Mobile only</div>

// Hide on specific breakpoints
<div className="hidden lg:block">Large screens only</div>
<div className="hidden xl:block">Extra large screens only</div>
```

### Responsive Container

```jsx
// Responsive container với padding
<div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
  Content
</div>

// Responsive max-width
<div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
  Content
</div>
```

### Responsive Typography

```jsx
// Responsive font sizes
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  Responsive Heading
</h1>

<p className="text-sm sm:text-base md:text-lg">
  Responsive paragraph
</p>
```

### Responsive Spacing

```jsx
// Responsive padding
<div className="p-4 sm:p-6 md:p-8 lg:p-10">
  Content
</div>

// Responsive margin
<div className="m-2 sm:m-4 md:m-6 lg:m-8">
  Content
</div>

// Responsive gap
<div className="grid gap-2 sm:gap-4 md:gap-6 lg:gap-8">
  Items
</div>
```

### Responsive Width/Height

```jsx
// Responsive width
<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
  Content
</div>

// Responsive height
<div className="h-32 sm:h-48 md:h-64 lg:h-96">
  Content
</div>
```

## JavaScript Helper Functions

```javascript
// Check device type
export const isMobile = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= 768;
};

export const isTablet = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth > 768 && window.innerWidth <= 992;
};

export const isDesktop = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth > 992;
};

// Get current breakpoint
export const getBreakpoint = () => {
  if (typeof window === "undefined") return "lg";
  const width = window.innerWidth;

  if (width <= 480) return "xs";
  if (width <= 576) return "sm";
  if (width <= 768) return "md";
  if (width <= 992) return "lg";
  if (width <= 1200) return "xl";
  return "2xl";
};

// Responsive hook for React
import { useState, useEffect } from "react";

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState("lg");

  useEffect(() => {
    const updateBreakpoint = () => {
      setBreakpoint(getBreakpoint());
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);

    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === "xs" || breakpoint === "sm" || breakpoint === "md",
    isTablet: breakpoint === "md",
    isDesktop:
      breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl",
  };
};
```

## Best Practices với Tailwind CSS

1. **Mobile-First Approach**: Bắt đầu với mobile (không prefix), sau đó thêm breakpoint prefix cho màn hình lớn hơn
   ```jsx
   <div className="p-4 md:p-6 lg:p-8">
   ```

2. **Sử dụng Tailwind Utilities**: Ưu tiên sử dụng utility classes của Tailwind thay vì custom CSS

3. **Flexible Images**: Sử dụng `w-full`, `h-auto`, `object-cover` cho images
   ```jsx
   <img src="..." className="w-full h-auto object-cover" />
   ```

4. **Touch Targets**: Đảm bảo các button có kích thước tối thiểu `min-h-[44px]` hoặc `px-4 py-3` trên mobile

5. **Readable Text**: Font size tối thiểu `text-base` (16px) trên mobile để tránh zoom tự động

6. **Responsive Grid**: Sử dụng `grid-cols-1` làm mặc định, sau đó tăng số cột theo breakpoint
   ```jsx
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
   ```

7. **Conditional Rendering**: Kết hợp `hidden` và `block` với breakpoints để hiển thị/ẩn elements
   ```jsx
   <div className="block md:hidden">Mobile</div>
   <div className="hidden md:block">Desktop</div>
   ```

8. **Responsive Spacing**: Sử dụng spacing scale của Tailwind với breakpoints
   ```jsx
   <div className="p-4 md:p-6 lg:p-8">
   ```

## Ví dụ Component Responsive với Tailwind

```jsx
// React component example với Tailwind
const ResponsiveCard = () => {
  const { isMobile } = useBreakpoint();

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow">
      <img 
        src="..." 
        alt="..." 
        className="w-full md:w-1/3 h-48 md:h-auto object-cover rounded"
      />
      <div className="flex-1">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
          Title
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Content
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded">
            Primary
          </button>
          <button className="w-full sm:w-auto px-4 py-2 border rounded">
            Secondary
          </button>
        </div>
      </div>
    </div>
  );
};
```

## Common Tailwind Responsive Patterns

### Pattern: Mobile Stack → Desktop Grid

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <div key={item.id}>{item.content}</div>)}
</div>
```

### Pattern: Mobile Vertical → Desktop Horizontal

```jsx
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">Left</div>
  <div className="w-full md:w-1/2">Right</div>
</div>
```

### Pattern: Mobile Full Width → Desktop Centered

```jsx
<div className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto">
  Content
</div>
```

### Pattern: Mobile Hidden → Desktop Visible

```jsx
<div className="hidden md:block">Desktop Content</div>
<div className="block md:hidden">Mobile Content</div>
```

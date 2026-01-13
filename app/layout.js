import { Roboto } from "next/font/google";
import "./globals.css";
import "@/styles/index.scss";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider, App as AntdApp } from "antd";
import Providers from "@/components/common/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata = {
  title: "PC Adviser - Tư vấn PC chuyên nghiệp",
  description: "Nền tảng tư vấn và mua sắm linh kiện PC chuyên nghiệp",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${roboto.variable} antialiased`}>
        <AntdRegistry>
          <Providers>
            <ConfigProvider
              theme={{
                token: {
                  // Main colors - Black & White theme
                  colorPrimary: "#000000",
                  colorInfo: "#000000",
                  colorSuccess: "#52c41a",
                  colorWarning: "#faad14",
                  colorError: "#ff4d4f",

                  // Text colors
                  colorText: "#000000",
                  colorTextSecondary: "#666666",
                  colorTextTertiary: "#999999",
                  colorTextQuaternary: "#CCCCCC",

                  // Background colors
                  colorBgContainer: "#FFFFFF",
                  colorBgElevated: "#FFFFFF",
                  colorBgLayout: "#F5F5F5",
                  colorBgSpotlight: "#FAFAFA",

                  // Border colors
                  colorBorder: "#E0E0E0",
                  colorBorderSecondary: "#F0F0F0",

                  // Font
                  fontFamily: `${roboto.style.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
                  fontSize: 14,
                  fontSizeHeading1: 38,
                  fontSizeHeading2: 30,
                  fontSizeHeading3: 24,
                  fontSizeHeading4: 20,
                  fontSizeHeading5: 16,

                  // Border radius
                  borderRadius: 4,
                  borderRadiusLG: 8,
                  borderRadiusSM: 2,

                  // Spacing
                  padding: 16,
                  paddingLG: 24,
                  paddingSM: 12,
                  paddingXS: 8,

                  // Box shadow
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                  boxShadowSecondary: "0 4px 16px rgba(0, 0, 0, 0.12)",
                },
                components: {
                  Button: {
                    primaryShadow: "0 2px 0 rgba(0, 0, 0, 0.045)",
                    controlHeight: 40,
                    controlHeightLG: 48,
                    controlHeightSM: 32,
                    fontWeight: 500,
                  },
                  Card: {
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                    boxShadowHover: "0 4px 16px rgba(0, 0, 0, 0.12)",
                  },
                  Input: {
                    controlHeight: 40,
                    controlHeightLG: 48,
                    controlHeightSM: 32,
                  },
                  Layout: {
                    headerBg: "#FFFFFF",
                    headerHeight: 64,
                    headerPadding: "0 24px",
                    footerBg: "#000000",
                    footerPadding: "48px 24px",
                  },
                },
              }}
            >
              <AntdApp>
                <Header />
                <div className="min-h-screen bg-gray-50">
                  {children}
                </div>
                <Footer />
              </AntdApp>
            </ConfigProvider>
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "hocphi.info — Tra cứu & so sánh học phí đại học",
  description:
    "Tra cứu, so sánh và ước lượng tổng chi phí học phí đại học Việt Nam theo trường × ngành × hệ đào tạo, kèm dự phóng cả khoá 4–5 năm.",
};

// Root layout — the shared shell. It does NOT re-render when navigating between
// child pages (learning note #16), so header/footer belong here.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

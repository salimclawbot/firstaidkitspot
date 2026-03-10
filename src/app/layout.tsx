import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: { default: "Office Chair Picks — Best Office Chairs for Back Pain & Comfort (2026)", template: "%s | Office Chair Picks" },
  description: "Expert-tested office chairs for back pain, lumbar support, and all-day comfort. Compare the best ergonomic chairs of 2026.",
  metadataBase: new URL("https://officechairpicks.vercel.app"),
  alternates: { canonical: "https://officechairpicks.vercel.app" },
  openGraph: { siteName: "Office Chair Picks", type: "website" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className={inter.className}>{children}</body></html>);
}

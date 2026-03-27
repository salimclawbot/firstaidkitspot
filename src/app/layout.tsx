import Script from 'next/script';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "First Aid Kit Spot — Best First Aid Kits & Supplies (2026)", template: "%s | First Aid Kit Spot" },
  description: "Expert-reviewed first aid kits for home, car and outdoor use in 2026. Find the best emergency kit with our detailed buyer guides, checklists and comparisons.",
  metadataBase: new URL("https://firstaidkitspot.com"),
  alternates: { canonical: "https://firstaidkitspot.com" },
  openGraph: {
    siteName: "First Aid Kit Spot",
    type: "website",
    title: "First Aid Kit Spot — Best First Aid Kits & Supplies (2026)",
    description: "Expert-reviewed first aid kits for home, car and outdoor use in 2026. Compare the best emergency kits with our detailed buying guides and checklists.",
    url: "https://firstaidkitspot.com",
    images: [{ url: "https://firstaidkitspot.com/og-image.jpg", width: 1200, height: 630, alt: "First Aid Kit Spot — Best First Aid Kits & Supplies (2026)" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "First Aid Kit Spot — Best First Aid Kits & Supplies (2026)",
    description: "Expert-reviewed first aid kits for home, car and outdoor use in 2026. Compare the best emergency kits with our detailed buying guides and checklists.",
    images: ["https://firstaidkitspot.com/og-image.jpg"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "First Aid Kit Spot",
  "url": "https://firstaidkitspot.com",
  "description": "Expert first aid kit reviews and safety guides",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://firstaidkitspot.com/?s={{search_term_string}}",
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <main >{children}</main>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C0G6Q8T1CL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C0G6Q8T1CL');
          `}
        </Script>
      </body>
    </html>
  );
}

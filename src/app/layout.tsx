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

        <Script id="ga4-custom-event-tracking" strategy="afterInteractive">{`
          (function () {
            if (typeof window === 'undefined') return;

            const getPagePath = () => window.location.pathname + window.location.search;

            const findNearestHeadingText = (el) => {
              let node = el;
              while (node && node !== document.body) {
                const heading = node.querySelector?.('h1, h2, h3, h4, h5, h6');
                if (heading && heading.textContent) return heading.textContent.trim();
                node = node.parentElement;
              }
              const fallbackHeading = document.querySelector('h1, h2');
              return fallbackHeading?.textContent?.trim() || '';
            };

            const getProductName = (link) => {
              const linkText = link.textContent?.trim() || '';
              if (linkText) return linkText;
              return findNearestHeadingText(link) || '';
            };

            const isAmazonAffiliateLink = (url) => {
              const value = (url || '').toLowerCase();
              return (
                value.includes('amazon.com') ||
                value.includes('amzn.to') ||
                value.includes('tag=theforge05-20') ||
                value.includes('tag=doublefury-22')
              );
            };

            const trackEvent = (eventName, params) => {
              if (typeof window.gtag !== 'function') return;
              window.gtag('event', eventName, params);
            };

            document.addEventListener('click', (event) => {
              const target = event.target;
              if (!(target instanceof Element)) return;
              const link = target.closest('a[href]');
              if (!link) return;

              const href = link.getAttribute('href') || '';
              const absoluteUrl = (() => {
                try {
                  return new URL(href, window.location.origin).toString();
                } catch {
                  return href;
                }
              })();

              if (!isAmazonAffiliateLink(absoluteUrl)) return;

              const linkText = (link.textContent || '').trim();
              trackEvent('affiliate_click', {
                link_url: absoluteUrl,
                link_text: linkText,
                page_path: getPagePath(),
                product_name: getProductName(link),
              });
            });

            const scrollMilestones = [25, 50, 75, 100];
            const scrollFired = new Set();

            const checkScrollDepth = () => {
              const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
              const docHeight = Math.max(
                document.documentElement.scrollHeight,
                document.body.scrollHeight,
                document.documentElement.offsetHeight,
                document.body.offsetHeight,
                document.documentElement.clientHeight
              );
              const winHeight = window.innerHeight || document.documentElement.clientHeight;
              const scrollable = Math.max(docHeight - winHeight, 1);
              const percent = Math.min(100, Math.round((scrollTop / scrollable) * 100));

              scrollMilestones.forEach((milestone) => {
                if (percent >= milestone && !scrollFired.has(milestone)) {
                  scrollFired.add(milestone);
                  trackEvent('scroll_depth', {
                    percent_scrolled: milestone,
                    page_path: getPagePath(),
                  });
                }
              });
            };

            let scrollTicking = false;
            window.addEventListener('scroll', () => {
              if (scrollTicking) return;
              scrollTicking = true;
              window.requestAnimationFrame(() => {
                checkScrollDepth();
                scrollTicking = false;
              });
            }, { passive: true });
            checkScrollDepth();

            const engagementMilestones = [30, 60, 120, 300];
            engagementMilestones.forEach((seconds) => {
              window.setTimeout(() => {
                trackEvent('engagement_time', {
                  time_seconds: seconds,
                  page_path: getPagePath(),
                });
              }, seconds * 1000);
            });
          })();
        `}</Script>

      </body>
    </html>
  );
}

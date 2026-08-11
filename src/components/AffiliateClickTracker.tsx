"use client";

import { useEffect } from "react";
import { portfolioSite } from "@/lib/portfolio-config";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function AffiliateClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest<HTMLAnchorElement>('a[data-affiliate-link="amazon"]');
      if (!link || !portfolioSite.commercialEnabled) return;
      window.gtag?.("event", "affiliate_click", {
        schema_version: "2",
        site_id: portfolioSite.domain,
        page_path: window.location.pathname,
        page_url: window.location.href,
        product_id: link.dataset.productId || "unknown",
        asin: link.dataset.asin || "",
        placement_id: link.dataset.placementId || "article-body",
        cta_position: link.dataset.ctaPosition || "inline",
        destination_url: link.href,
        destination_type: link.dataset.destinationType || "amazon",
        link_text: (link.textContent || "").trim().slice(0, 100),
        link_type: "affiliate",
        marketplace: "www.amazon.com",
        partner_tag: portfolioSite.partnerTag,
        content_type: "article",
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}

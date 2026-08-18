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
      const link = target?.closest<HTMLAnchorElement>('a[data-affiliate-link="amazon"], a[data-affiliate-network="amazon"], a[href*="amazon.com"][href*="tag="], a[href*="amzn.to"]');
      if (!link || !portfolioSite.commercialEnabled) return;
      const asin = link.dataset.asin || link.href.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)?.[1] || "";
      window.gtag?.("event", "affiliate_click", {
        schema_version: "2",
        site_id: portfolioSite.domain,
        page_path: window.location.pathname,
        page_url: window.location.href,
        product_id: link.dataset.productId || "unknown",
        asin,
        placement_id: link.dataset.placementId || link.dataset.affiliatePlacement || "article-body",
        cta_position: link.dataset.ctaPosition || link.dataset.affiliatePlacement || "inline",
        destination_url: link.href,
        link_url: link.href,
        link_domain: new URL(link.href).hostname,
        destination_type: link.dataset.destinationType || "amazon",
        link_text: (link.textContent || "").trim().slice(0, 100),
        link_type: "affiliate",
        outbound: true,
        marketplace: "www.amazon.com",
        partner_tag: portfolioSite.partnerTag,
        content_type: "article",
        page_title: document.title,
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}

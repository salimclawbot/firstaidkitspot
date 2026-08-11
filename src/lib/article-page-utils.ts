import fs from "node:fs";
import path from "node:path";
import { portfolioSite } from "@/lib/portfolio-config";

export type TocItem = {
  id: string;
  text: string;
  level: "h2" | "h3" | "h4";
};

export type FaqItem = {
  question: string;
  answer: string;
};

function cleanText(value: unknown): string {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncateAtWord(value: string, max: number): string {
  if (value.length <= max) return value;
  const candidate = value.slice(0, max - 3);
  const lastSpace = candidate.lastIndexOf(" ");
  return (lastSpace > max * 0.72 ? candidate.slice(0, lastSpace) : candidate).replace(/[,:;.!?\s]+$/, "") + "...";
}

export function normalizeMetaTitle(value: string | undefined): string {
  return truncateAtWord(cleanText(value) || "Practical Editorial Guide", 46);
}

export function normalizeMetaDescription(description: unknown, title = "This guide"): string {
  const clean = cleanText(description);
  const subject = cleanText(title) || "This guide";
  const fallback =
    subject +
    ": practical, carefully reviewed guidance, key considerations, and clear next steps to help readers make an informed decision.";
  return truncateAtWord(clean.length >= 70 ? clean : (clean ? clean + " " : "") + fallback, 160);
}

export function buildKeywords(title: string, category?: string): string[] {
  const stop = new Set(["about", "after", "and", "are", "best", "for", "from", "guide", "how", "the", "this", "what", "with", "your", "2026"]);
  const words = (title + " " + (category || "")).toLowerCase().match(/[a-z0-9]+/g) || [];
  return Array.from(new Set(words.filter((word) => word.length > 2 && !stop.has(word)))).slice(0, 12);
}

function slugFromText(value: string): string {
  return cleanText(value)
    .toLowerCase()
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";
}

function normalizeImages(html: string, fallbackAlt: string): string {
  return html.replace(/<img\b([^>]*)>/gi, (_match, rawAttributes: string) => {
    const srcMatch = rawAttributes.match(/\bsrc=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
    let src = srcMatch?.[1] || srcMatch?.[2] || srcMatch?.[3] || "";
    if (src.startsWith("/")) {
      const localPath = src.split(/[?#]/)[0].replace(/^\/+/, "");
      if (!fs.existsSync(path.join(process.cwd(), "public", localPath))) src = portfolioSite.heroImage;
    }

    const attributes = rawAttributes
      .replace(/\bsrc=(?:"[^"]+"|'[^']+'|[^\s>]+)/i, "")
      .replace(/\balt=(?:"[^"]*"|'[^']*'|[^\s>]+)/i, "")
      .replace(/\sloading=(?:"[^"]*"|'[^']*'|[^\s>]+)/i, "")
      .replace(/\s+/g, " ")
      .trim();
    const safeAlt = cleanText(fallbackAlt || "Editorial illustration").replace(/"/g, "&quot;");
    return '<img src="' + (src || portfolioSite.heroImage) + '" alt="' + safeAlt + '" loading="lazy"' + (attributes ? " " + attributes : "") + ">";
  });
}

function normalizeLinks(html: string): string {
  return html.replace(/<a\s+([^>]*?)href=(["'])([^"']+)\2([^>]*)>([\s\S]*?)<\/a>/gi, (
    _match,
    before: string,
    _quote: string,
    rawHref: string,
    after: string,
    inner: string,
  ) => {
    const href = rawHref.trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return '<a ' + before + 'href="' + href + '"' + after + ">" + inner + "</a>";
    }

    const attributes = (before + after)
      .replace(/\srel=(?:"[^"]*"|'[^']*')/gi, "")
      .replace(/\starget=(?:"[^"]*"|'[^']*')/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    try {
      const parsed = new URL(href, "https://" + portfolioSite.domain);
      const host = parsed.hostname.toLowerCase();
      const selfHost = portfolioSite.domain.replace(/^www\./, "");
      const normalizedHost = host.replace(/^www\./, "");

      if (/(^|\.)amazon\./i.test(host)) {
        if (!portfolioSite.commercialEnabled || !portfolioSite.partnerTag) return inner;
        parsed.searchParams.set("tag", portfolioSite.partnerTag);
        return '<a' + (attributes ? " " + attributes : "") + ' href="' + parsed.toString() + '" target="_blank" rel="sponsored nofollow noopener">' + inner + "</a>";
      }

      if (normalizedHost === selfHost) {
        return '<a' + (attributes ? " " + attributes : "") + ' href="' + parsed.pathname + parsed.search + parsed.hash + '">' + inner + "</a>";
      }

      return '<a' + (attributes ? " " + attributes : "") + ' href="' + parsed.toString() + '" target="_blank" rel="nofollow noopener">' + inner + "</a>";
    } catch {
      return '<a' + (attributes ? " " + attributes : "") + ' href="' + href + '">' + inner + "</a>";
    }
  });
}

function normalizeHeadings(html: string): { html: string; toc: TocItem[] } {
  const used = new Map<string, number>();
  const toc: TocItem[] = [];
  const withoutH1 = html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi, "");
  const normalized = withoutH1.replace(/<(h[2-4])(\b[^>]*)>([\s\S]*?)<\/\1>/gi, (_match, tag, attrs, inner) => {
    const existing = attrs.match(/\sid=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
    const base = existing?.[1] || existing?.[2] || existing?.[3] || slugFromText(inner);
    const count = used.get(base) || 0;
    used.set(base, count + 1);
    const id = count ? base + "-" + (count + 1) : base;
    const cleanAttrs = attrs.replace(/\sid=(?:"[^"]+"|'[^']+'|[^\s>]+)/i, "");
    toc.push({ id, text: cleanText(inner), level: tag.toLowerCase() as TocItem["level"] });
    return "<" + tag + cleanAttrs + ' id="' + id + '">' + inner + "</" + tag + ">";
  });
  return { html: normalized, toc };
}

export function normalizeArticleHtml(raw: string, fallbackAlt: string): { html: string; toc: TocItem[] } {
  const safe = String(raw || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<video\b[\s\S]*?<\/video>/gi, (video) => video.replace(/\sautoplay(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi, ""));
  const linked = normalizeLinks(safe);
  const imaged = normalizeImages(linked, fallbackAlt);
  const tabled = imaged
    .replace(/<table(?![^>]*class=)/gi, '<table class="prose-table"')
    .replace(/<table/gi, '<div class="overflow-x-auto"><table')
    .replace(/<\/table>/gi, "</table></div>");
  return normalizeHeadings(tabled);
}

export function normalizeAmazonUrl(rawUrl: string): string {
  if (!portfolioSite.commercialEnabled || !portfolioSite.partnerTag) return "";
  try {
    const parsed = new URL(rawUrl);
    if (!/(^|\.)amazon\./i.test(parsed.hostname)) return rawUrl;
    parsed.searchParams.set("tag", portfolioSite.partnerTag);
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

export function getFaqItems(faqSchema: unknown): FaqItem[] {
  if (!faqSchema || typeof faqSchema !== "object") return [];
  const value = faqSchema as {
    "@type"?: string;
    mainEntity?: Array<{ name?: string; acceptedAnswer?: { text?: string } | string }>;
  };
  if (value["@type"] !== "FAQPage" || !Array.isArray(value.mainEntity)) return [];

  return value.mainEntity
    .map((entry) => ({
      question: cleanText(entry.name),
      answer: cleanText(typeof entry.acceptedAnswer === "string" ? entry.acceptedAnswer : entry.acceptedAnswer?.text),
    }))
    .filter((entry) => entry.question && entry.answer);
}

export function buildFaqSchema(items: FaqItem[]): Record<string, unknown> | null {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

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

const AFFILIATE_TAG = portfolioSite.partnerTag;
const AMAZON_HOST_RE = /(^|\.)amazon\./i;
const YOUTUBE_HOST_RE = /(youtube\.com|youtu\.be|youtube-nocookie\.com)/i;
const SELF_DOMAIN = portfolioSite.domain;
const PORTFOLIO_DOMAINS = new Set([
  "carpaltunnelguide.com",
  "coccyxrelief.com",
  "walkingpadpicks.com",
  "firstaidkitspot.com",
  "plantarfasciitisguides.com",
  "homecoffeespot.com",
  "planhomeschooling.com",
  "postpartumspot.com",
  "verticalmouseguide.com",
  "sciaticaspot.com",
]);

const TRACKING_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "msclkid"];

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function clampText(value: string | undefined, minLength: number, maxLength: number, fallback: string): string {
  const normalized = normalizeWhitespace(value ?? "");
  if (!normalized) return fallback;
  if (normalized.length <= maxLength) return normalized;
  if (normalized.length >= minLength) return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
  return normalized;
}

export function normalizeMetaTitle(value: string | undefined): string {
  return clampText(value, 40, 60, "Affiliate Guide");
}

export function normalizeMetaDescription(value: string | undefined): string {
  return clampText(value, 145, 160, "Expert affiliate guide with practical recommendations.");
}

function slugFromText(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return slug.slice(0, 72) || "section";
}

function uniqueSlug(base: string, used: Map<string, number>): string {
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function normalizeTrackingParams(rawHref: string): string {
  try {
    const parsed = new URL(rawHref);
    TRACKING_PARAMS.forEach((param) => parsed.searchParams.delete(param));
    return parsed.toString();
  } catch {
    return rawHref;
  }
}

function normalizeDomain(rawHref: string): string {
  try {
    const parsed = new URL(rawHref);
    return (parsed.hostname || "").replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function isCrossPortfolioLink(rawHref: string): boolean {
  const host = normalizeDomain(rawHref);
  return !!host && PORTFOLIO_DOMAINS.has(host) && host !== SELF_DOMAIN;
}

function normalizeAmazonUrl(rawHref: string): string {
  try {
    const parsed = new URL(rawHref);
    if (!AMAZON_HOST_RE.test(parsed.hostname) && !parsed.hostname.includes("amzn.to")) return rawHref;
    if (!portfolioSite.commercialEnabled || !AFFILIATE_TAG) return "";
    parsed.searchParams.set("tag", AFFILIATE_TAG);
    return normalizeTrackingParams(parsed.toString());
  } catch {
    return rawHref;
  }
}

function amazonIdentity(rawHref: string) {
  const asin = rawHref.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?]|$)/i)?.[1]?.toUpperCase() || "";
  const destinationType = asin ? "product_detail" : /\/s(?:[/?]|$)/i.test(rawHref) ? "search" : "amazon_other";
  return { asin, destinationType };
}

function escapeAttribute(value: string): string {
  return value.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function normalizeAnchorTag(
  match: string,
  beforeHref: string,
  _quote: string,
  href: string,
  afterHref: string,
  innerText: string,
): string {
  const hrefValue = href || "";
  if (!hrefValue) return innerText;
  const isMailto = /^mailto:/i.test(hrefValue);
  const isTel = /^tel:/i.test(hrefValue);
  const isAmazon = /amazon\.|amzn\.to/i.test(hrefValue);
  const isYouTube = YOUTUBE_HOST_RE.test(hrefValue);

  if (isAmazon && (!portfolioSite.commercialEnabled || !AFFILIATE_TAG)) {
    return `<span data-commercial-link-removed>${innerText}</span>`;
  }

  if (isYouTube) {
    return `<span data-video-removed><strong>Video content moved here to keep the site YouTube-free.</strong> ${normalizeWhitespace(
      innerText,
    )}</span>`;
  }

  const requiresTarget = isAbsoluteUrl(hrefValue) && !isMailto && !isTel;
  const isCrossNetwork = isCrossPortfolioLink(hrefValue);
  if (isCrossNetwork) {
    return `<span data-cross-network-link>${innerText}</span>`;
  }

  const noTrackingHref = normalizeTrackingParams(hrefValue);
  const normalizedHref = isAmazon ? normalizeAmazonUrl(noTrackingHref) : noTrackingHref;
  const amazon = amazonIdentity(normalizedHref);
  const cleaned = `${beforeHref} ${afterHref}`
    .replace(/\starget=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\srel=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\shref=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .trim();

  const relTokens = [
    requiresTarget ? "noopener" : "",
    requiresTarget ? "noreferrer" : "",
    isAmazon ? "nofollow" : "",
    isAmazon ? "sponsored" : "",
  ].filter(Boolean);

  const relValue = relTokens.length ? ` rel="${relTokens.join(" ")}"` : "";
  const targetAttr = requiresTarget ? ' target="_blank"' : "";

  const affiliateData = isAmazon ? ` data-affiliate-link="amazon" data-product-id="${amazon.asin || "category-discovery"}" data-asin="${amazon.asin}" data-placement-id="article-body" data-cta-position="inline" data-destination-type="${amazon.destinationType}"` : "";
  return `<a ${cleaned}href="${escapeAttribute(normalizedHref)}"${targetAttr}${relValue}${affiliateData}>${innerText}</a>`;
}

function normalizeImages(html: string, fallbackAlt: string): string {
  return html.replace(/<img\s+[^>]*>/gi, (match) => {
    const srcMatch = match.match(/\ssrc=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
    const src = srcMatch?.[1] || srcMatch?.[2] || srcMatch?.[3] || "";
    let next = match;
    if (src.startsWith("/")) {
      const cleanPath = src.split(/[?#]/)[0].replace(/^\/+/, "");
      if (!fs.existsSync(path.join(process.cwd(), "public", cleanPath))) {
        next = next.replace(src, portfolioSite.heroImage);
      }
    }
    if (!/\salt=/i.test(next)) next = next.replace(">", ` alt="${escapeAttribute(fallbackAlt)}">`);
    if (!/\sloading=/i.test(next)) next = next.replace(">", ' loading="lazy">');
    if (!/\sdecoding=/i.test(next)) next = next.replace(">", ' decoding="async">');
    if (!/\sreferrerpolicy=/i.test(next)) next = next.replace(">", ' referrerpolicy="no-referrer">');
    if (!/\sclass=/i.test(next)) next = next.replace(">", ' class="w-full h-auto rounded-xl object-cover max-w-full">');
    return next.replace(/\sstyle\s*=\s*(['"]).*?\1/gi, "");
  });
}

export function buildKeywords(title: string, category?: string): string[] {
  const stop = new Set(["about", "after", "and", "are", "best", "for", "from", "guide", "how", "the", "this", "what", "with", "your", "2026"]);
  const words = `${title} ${category || ""}`.toLowerCase().match(/[a-z0-9]+/g) || [];
  return Array.from(new Set(words.filter((word) => word.length > 2 && !stop.has(word)))).slice(0, 12);
}

function normalizeVideos(html: string): string {
  html = html.replace(/<video\b[\s\S]*?<\/video>/gi, (block) => {
    const sourceMatch = block.match(/<source\b[^>]*src=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
    const source = sourceMatch?.[1] || sourceMatch?.[2] || sourceMatch?.[3] || "";
    if (source.startsWith("/")) {
      const cleanSource = source.split(/[?#]/)[0].replace(/^\/+/, "");
      if (!fs.existsSync(path.join(process.cwd(), "public", cleanSource))) return "";
    }
    const posterMatch = block.match(/poster=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
    const poster = posterMatch?.[1] || posterMatch?.[2] || posterMatch?.[3] || "";
    if (poster.startsWith("/")) {
      const cleanPoster = poster.split(/[?#]/)[0].replace(/^\/+/, "");
      if (!fs.existsSync(path.join(process.cwd(), "public", cleanPoster))) return block.replace(poster, portfolioSite.heroImage);
    }
    return block;
  });
  return html.replace(/<video class="w-full rounded-lg my-6" preload="metadata" controls([^>]*)>/gi, (match) => {
    const withoutAutoplay = match
      .replace(/\s(?:autoPlay|autoplay)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/gi, "")
      .replace(/\s(?:loop|playsinline|playsInline)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/gi, "");

    const hasControls = /\scontrols(=|$)/i.test(withoutAutoplay);
    const hasPreload = /\spreload=/i.test(withoutAutoplay);

    const next = hasControls ? withoutAutoplay : withoutAutoplay.replace(/^<video controls/i, "<video controls");
    const next2 = hasPreload ? next : next.replace(/^<video/i, '<video preload="metadata"');
    return next2.includes("class=")
      ? next2
      : next2.replace(/^<video/i, '<video class="w-full rounded-lg my-6"');
  });
}

function normalizeIframes(html: string): string {
  return html.replace(/<iframe[\s\S]*?<\/iframe>/gi, (match) => {
    const srcMatch = match.match(/src=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
    const rawSrc = normalizeWhitespace((srcMatch?.[1] ?? srcMatch?.[2] ?? srcMatch?.[3] ?? ""));
    if (!rawSrc) return "";

    if (YOUTUBE_HOST_RE.test(rawSrc)) {
      return `<p><strong>Video content moved here to keep the site YouTube-free.</strong></p>`;
    }
    if (/\.mp4(\?|$)/i.test(rawSrc)) {
      return `<figure class="my-6"><video controls preload="metadata" class="w-full rounded-lg"><source src="${rawSrc}" type="video/mp4" /></video></figure>`;
    }
    return `<p><a href="${rawSrc}" target="_blank" rel="noopener noreferrer nofollow">Watch reference</a></p>`;
  });
}

function normalizeTableBlocks(html: string): string {
  return html
    .replace(/<table(?![^>]*class=)/gi, '<table class="prose-table"')
    .replace(/<table/gi, '<div class="overflow-x-auto"><table')
    .replace(/<\/table>/gi, "</table></div>");
}

function ensureHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const used = new Map<string, number>();
  const headings: TocItem[] = [];
  const replaced = html.replace(/<(h[2-4])(\b[^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, inner) => {
    const existingId = /\sid=(?:"([^"]+)"|'([^']+)'|([^>\s]+))/i.exec(attrs)?.[1];
    const base = existingId || slugFromText(inner);
    const id = uniqueSlug(base, used);
    headings.push({ id, text: normalizeWhitespace(inner), level: tag as TocItem["level"] });

    const nextAttrs = existingId
      ? attrs.replace(/\sid=(?:"[^"]+"|'[^']+'|[^\s>]+)/i, ` id="${id}"`)
      : `${attrs} id="${id}"`;
    return `<${tag}${nextAttrs}>${inner}</${tag}>`;
  });
  return { html: replaced, toc: headings };
}

function rewriteAnchors(html: string): string {
  return html.replace(/<a\s+([^>]*?)href=([\'"])([^\'"]+)\2([^>]*)>([\s\S]*?)<\/a>/gi, normalizeAnchorTag);
}

export function normalizeArticleHtml(
  raw: string,
  fallbackAlt: string,
): { html: string; toc: TocItem[] } {
  const withoutScripts = raw.replace(/<script[\s\S]*?<\/script>/gi, "");
  const withoutMetadataDebris = withoutScripts
    .replace(/<p>\s*(?:article_schema|faq_schema)\s*:[\s\S]*?<\/p>/gi, "")
    .replace(/<p>\s*---\|(?:---\|?)*\s*<\/p>/gi, "");
  const withIframes = normalizeIframes(withoutMetadataDebris);
  const withVideos = normalizeVideos(withIframes);
  const links = rewriteAnchors(withVideos);
  const images = normalizeImages(links, fallbackAlt);
  const tables = normalizeTableBlocks(images);
  const headings = ensureHeadingIds(tables);
  return { html: headings.html, toc: headings.toc };
}

export function getFaqItems(faqSchema: unknown): FaqItem[] {
  if (!faqSchema || typeof faqSchema !== "object") {
    return [];
  }

  const faq = faqSchema as {
    "@type"?: string;
    mainEntity?: Array<{ name?: string; acceptedAnswer?: { text?: string } | string }>;
  };

  if (faq["@type"] !== "FAQPage" || !Array.isArray(faq.mainEntity)) {
    return [];
  }

  return faq.mainEntity
    .map((entry) => {
      const question = typeof entry.name === "string" ? entry.name.trim() : "";
      const answerCandidate = entry.acceptedAnswer;
      const answer =
        typeof answerCandidate === "string"
          ? answerCandidate
          : typeof answerCandidate?.text === "string"
            ? answerCandidate.text
            : "";
      if (!question || !answer) return null;
      return { question, answer: answer.trim() };
    })
    .filter((item): item is FaqItem => Boolean(item));
}

export function buildFaqSchema(questionAnswers: FaqItem[]): Record<string, unknown> | null {
  if (!questionAnswers.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questionAnswers.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

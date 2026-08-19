import { NextRequest, NextResponse } from "next/server";
import { portfolioSite } from "@/lib/portfolio-config";
import { allowedAmazonProducts } from "@/lib/amazon-product-registry";
import { getArticleBySlug } from "@/lib/articles";

type AmazonApiItem = {
  asin: string;
  detailPageURL?: string;
  itemInfo?: { title?: { displayValue?: string } };
  images?: { primary?: { large?: { url?: string } } };
  offersV2?: { listings?: Array<{ availability?: { message?: string } }> };
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 30;
const requestWindows = new Map<string, { count: number; resetAt: number }>();
let tokenCache: { token: string; expiresAt: number } | null = null;

function rateLimit(request: NextRequest): number | null {
  const now = Date.now();
  const key = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown").split(",")[0].trim();
  const current = requestWindows.get(key);
  if (!current || current.resetAt <= now) {
    requestWindows.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    if (requestWindows.size > 1_000) {
      requestWindows.forEach((window, candidate) => { if (window.resetAt <= now) requestWindows.delete(candidate); });
    }
    return null;
  }
  if (current.count >= RATE_LIMIT) return Math.max(1, Math.ceil((current.resetAt - now) / 1_000));
  current.count += 1;
  return null;
}

async function fetchAmazon(url: string, init: RequestInit): Promise<Response> {
  let lastResponse: Response | null = null;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    try {
      try {
        const response = await fetch(url, { ...init, signal: controller.signal });
        lastResponse = response;
        if (response.status !== 429 && response.status < 500) return response;
      } catch (error) {
        lastError = error;
        if (attempt === 1) throw error;
      }
    } finally {
      clearTimeout(timeout);
    }
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 350));
  }
  if (lastResponse) return lastResponse;
  throw lastError instanceof Error ? lastError : new Error("Amazon request timed out");
}

async function accessToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;
  const clientId = process.env.AMAZON_CREATORS_CLIENT_ID;
  const clientSecret = process.env.AMAZON_CREATORS_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Amazon Creators API is not configured");
  const response = await fetchAmazon("https://api.amazon.com/auth/o2/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "creatorsapi::default",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Amazon Creators API authentication failed");
  const payload = await response.json();
  tokenCache = { token: payload.access_token, expiresAt: Date.now() + Math.max(300, payload.expires_in || 3600) * 1000 };
  return tokenCache.token;
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Amazon-Advertising-API-ClientId": process.env.AMAZON_CREATORS_CLIENT_ID || "",
    "Amazon-Advertising-API-Scope": process.env.AMAZON_CREATORS_MARKETPLACE || "US",
    "x-marketplace": "www.amazon.com",
  };
}

function taggedProductUrl(rawUrl: string | undefined, asin: string): string {
  const fallback = `https://www.amazon.com/dp/${asin}`;
  try {
    const parsed = new URL(rawUrl || fallback);
    if (!/(^|\.)amazon\.com$/i.test(parsed.hostname)) return `${fallback}?tag=${portfolioSite.partnerTag}`;
    parsed.protocol = "https:";
    parsed.searchParams.set("tag", portfolioSite.partnerTag);
    return parsed.toString();
  } catch {
    return `${fallback}?tag=${portfolioSite.partnerTag}`;
  }
}

function present(item: AmazonApiItem, id = `API-${item.asin}`) {
  return {
    id,
    asin: item.asin,
    title: item.itemInfo?.title?.displayValue || "Amazon product listing",
    url: taggedProductUrl(item.detailPageURL, item.asin),
    image: item.images?.primary?.large?.url || null,
    availability: item.offersV2?.listings?.[0]?.availability?.message || null,
    apiVerified: true,
    checkedAt: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  if (!portfolioSite.commercialEnabled || !portfolioSite.partnerTag) {
    return NextResponse.json({ products: [], commercialEnabled: false }, { status: 404 });
  }

  const retryAfter = rateLimit(request);
  if (retryAfter) {
    return NextResponse.json({ products: [], error: "rate-limited" }, { status: 429, headers: { "Retry-After": String(retryAfter), "Cache-Control": "private, no-store" } });
  }

  const allowedParameters = new Set(["ids", "slug"]);
  const parameterNames = Array.from(request.nextUrl.searchParams.keys());
  if (parameterNames.some((name) => !allowedParameters.has(name)) || request.nextUrl.searchParams.getAll("ids").length > 1 || request.nextUrl.searchParams.getAll("slug").length > 1) {
    return NextResponse.json({ products: [], error: "invalid-query" }, { status: 400, headers: { "Cache-Control": "private, no-store" } });
  }

  const rawIds = request.nextUrl.searchParams.get("ids") || "";
  const requested = Array.from(new Set(rawIds.split(",").map((id) => id.trim()).filter(Boolean))).sort().slice(0, 10);
  const allowed = requested.map((id) => allowedAmazonProducts[id]).filter(Boolean);
  const rawSlug = request.nextUrl.searchParams.get("slug") || "";
  const slug = rawSlug.trim().slice(0, 120);
  if (rawSlug !== slug || (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))) {
    return NextResponse.json({ products: [], error: "invalid-slug" }, { status: 400, headers: { "Cache-Control": "private, no-store" } });
  }
  const canonicalQuery = slug ? `?slug=${slug}` : rawIds ? `?ids=${encodeURIComponent(rawIds)}` : "";
  if ((!rawIds && !slug) || request.nextUrl.search !== canonicalQuery) {
    return NextResponse.json({ products: [], error: "invalid-query" }, { status: 400, headers: { "Cache-Control": "private, no-store" } });
  }
  if (requested.length && (allowed.length !== requested.length || rawIds !== requested.join(",") || slug)) {
    return NextResponse.json({ products: [], error: "invalid-product-request" }, { status: 400, headers: { "Cache-Control": "private, no-store" } });
  }
  let resolvedTitle = "";
  if (!allowed.length) {
    const article = slug ? getArticleBySlug(slug) : null;
    resolvedTitle = article?.title || "";
    if (!resolvedTitle) return NextResponse.json({ products: [] }, { status: 404, headers: { "Cache-Control": "public, s-maxage=300" } });
  }

  try {
    const token = await accessToken();
    let products: ReturnType<typeof present>[] = [];

    if (allowed.length) {
      const response = await fetchAmazon("https://creatorsapi.amazon/catalog/v1/getItems", {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({
          partnerTag: portfolioSite.partnerTag,
          itemIds: allowed.map((item) => item.asin),
          itemIdType: "ASIN",
          marketplace: "www.amazon.com",
          resources: ["images.primary.large", "itemInfo.title", "itemInfo.byLineInfo", "offersV2.listings.availability"],
        }),
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Amazon catalog request failed");
      const payload = await response.json();
      const apiItems = new Map<string, AmazonApiItem>((payload?.itemsResult?.items || []).map((item: AmazonApiItem) => [item.asin, item] as const));
      products = allowed.map((record) => {
        const item = apiItems.get(record.asin);
        return item ? present(item, record.id) : {
          id: record.id,
          asin: record.asin,
          title: record.label,
          url: taggedProductUrl(undefined, record.asin),
          image: null,
          availability: null,
          apiVerified: false,
          checkedAt: new Date().toISOString(),
        };
      });
    } else {
      const keywords = resolvedTitle.replace(/\b(?:20\d{2}|guide|review|best)\b/gi, " ").replace(/\s+/g, " ").trim().slice(0, 80);
      const response = await fetchAmazon("https://creatorsapi.amazon/catalog/v1/searchItems", {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({
          partnerTag: portfolioSite.partnerTag,
          keywords,
          searchIndex: "All",
          itemCount: 3,
          marketplace: "www.amazon.com",
          resources: ["images.primary.large", "itemInfo.title", "itemInfo.byLineInfo", "offersV2.listings.availability"],
        }),
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Amazon catalog search failed");
      const payload = await response.json();
      products = (payload?.searchResult?.items || []).slice(0, 3).map((item: AmazonApiItem) => present(item));
    }

    const checkedAt = new Date().toISOString();
    return NextResponse.json({ products, checkedAt }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch {
    return NextResponse.json({ products: [], error: "live-catalog-unavailable" }, { status: 503, headers: { "Retry-After": "30", "Cache-Control": "private, no-store" } });
  }
}

"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import type { AmazonProductGroup } from "@/lib/amazon-product-registry";

type DisplayProduct = {
  asin?: string;
  title?: string;
  label?: string;
  image?: string;
  imageUrl?: string;
  url?: string;
  affiliateUrl?: string;
  detailPageUrl?: string;
  price?: string;
  availability?: string;
};

type ApiPayload = { products?: DisplayProduct[]; source?: string };
type PortalTargets = { middle: HTMLElement | null; closing: HTMLElement | null };

const productRequests = new Map<string, Promise<ApiPayload>>();

function loadProducts(slug: string): Promise<ApiPayload> {
  const existing = productRequests.get(slug);
  if (existing) return existing;
  const request = fetch("/api/amazon/products?slug=" + encodeURIComponent(slug), {
    headers: { Accept: "application/json" },
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("Amazon product lookup unavailable");
      return (await response.json()) as ApiPayload;
    })
    .catch(() => ({ products: [], source: "unavailable" }));
  productRequests.set(slug, request);
  return request;
}

function ProductRail({
  group,
  products,
  slug,
  placement,
  loading,
}: {
  group: AmazonProductGroup;
  products: DisplayProduct[];
  slug: string;
  placement: "opening" | "middle" | "closing";
  loading: boolean;
}) {
  const headingId = "amazon-" + slug + "-" + placement;
  const placementLabel =
    placement === "opening"
      ? "Quick product options"
      : placement === "middle"
        ? "More relevant options"
        : "Compare before you leave";

  if (!loading && products.length === 0) return null;

  return (
    <aside
      aria-labelledby={headingId}
      data-amazon-carousel={placement}
      className="my-7 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 shadow-sm"
    >
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-700">
            {placementLabel}
          </p>
          <h2 id={headingId} className="mt-1 text-lg font-bold leading-tight text-slate-900">
            {group.heading}
          </h2>
        </div>
        <p className="text-xs text-slate-500">Details checked with Amazon</p>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-hidden" aria-label="Loading Amazon products">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-48 w-40 shrink-0 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {products.slice(0, 6).map((product, index) => {
            const title = product.title || product.label || "Relevant Amazon listing";
            const image = product.imageUrl || product.image;
            const href =
              product.affiliateUrl ||
              product.detailPageUrl ||
              product.url ||
              (product.asin ? "https://www.amazon.com/dp/" + product.asin : undefined);
            if (!href) return null;

            return (
              <article
                key={product.asin || title + "-" + index}
                className="flex w-40 shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:w-44"
              >
                <a
                  href={href}
                  target="_blank"
                  rel="sponsored nofollow noopener"
                  data-affiliate-network="amazon"
                  data-affiliate-placement={placement}
                  data-affiliate-slug={slug}
                  className="group flex h-full flex-col no-underline"
                  aria-label={"View " + title + " on Amazon"}
                >
                  <div className="flex h-28 items-center justify-center bg-white p-2">
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        loading="lazy"
                        className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-center text-xs font-semibold text-slate-500">
                        View product details
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col border-t border-slate-100 p-3">
                    <h3 className="line-clamp-3 text-sm font-bold leading-5 text-slate-900">
                      {title}
                    </h3>
                    {product.price ? (
                      <p className="mt-2 text-sm font-bold text-slate-900">{product.price}</p>
                    ) : null}
                    {product.availability ? (
                      <p className="mt-1 line-clamp-1 text-xs text-emerald-700">{product.availability}</p>
                    ) : null}
                    <span className="mt-auto pt-3 text-xs font-bold text-amber-700">
                      Check current details on Amazon
                    </span>
                  </div>
                </a>
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-3 text-[11px] leading-4 text-slate-500">
        As an Amazon Associate we earn from qualifying purchases. Product details and availability can change.
      </p>
    </aside>
  );
}

export default function AmazonProductShowcase({
  group,
  slug,
}: {
  group: AmazonProductGroup | null;
  slug: string;
}) {
  const fallbackProducts = useMemo(
    () => ((group?.products || []) as unknown as DisplayProduct[]),
    [group],
  );
  const [products, setProducts] = useState<DisplayProduct[]>(fallbackProducts);
  const [loading, setLoading] = useState(Boolean(group));
  const [targets, setTargets] = useState<PortalTargets>({ middle: null, closing: null });

  useEffect(() => {
    if (!group) {
      setLoading(false);
      return;
    }
    let active = true;
    loadProducts(slug).then((payload) => {
      if (!active) return;
      setProducts(payload.products?.length ? payload.products : fallbackProducts);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [fallbackProducts, group, slug]);

  useEffect(() => {
    if (!group) return;
    const article = document.querySelector("main article, article");
    if (!(article instanceof HTMLElement)) return;

    const headings = Array.from(article.querySelectorAll("h2"));
    const middleAnchor = headings[Math.max(1, Math.floor(headings.length / 2))] || null;
    const middle = document.createElement("div");
    const closing = document.createElement("div");
    middle.dataset.amazonPortal = slug + "-middle";
    closing.dataset.amazonPortal = slug + "-closing";

    if (middleAnchor?.parentNode) {
      middleAnchor.parentNode.insertBefore(middle, middleAnchor);
    } else {
      article.appendChild(middle);
    }
    article.appendChild(closing);
    setTargets({ middle, closing });

    return () => {
      middle.remove();
      closing.remove();
    };
  }, [group, slug]);

  if (!group) return null;
  const railProps = { group, products, slug, loading };

  return (
    <>
      <ProductRail {...railProps} placement="opening" />
      {targets.middle
        ? createPortal(<ProductRail {...railProps} placement="middle" />, targets.middle)
        : null}
      {targets.closing
        ? createPortal(<ProductRail {...railProps} placement="closing" />, targets.closing)
        : null}
    </>
  );
}

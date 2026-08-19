"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import type { AmazonProductGroup } from "@/lib/amazon-product-registry";
import { portfolioSite } from "@/lib/portfolio-config";

const MAX_PLACEMENTS = 10;
const BLOCKED_SECTION = /(\?|table of contents|frequently asked|sources|methodology|diagnos|red flag|emergenc|urgent|medicat|dosage|treatment|therapy|exercise|stretch|surgery|operation|post.?op|injection|recovery|when to see|doctor|clinician|symptom|warning|side effect|cure|pain|injury|safety|routine|pet first aid|training|joint|lubric|maintenance|motor ventilation|belt tension|alignment|surface and deck care|why .* (helps|matters))/i;
const SAFE_SECTION = /(compar|criteria|choose|buying|\bvs\b|fit|size|dimension|weight|portab|material|foam|gel|support|feature|adjust|compatib|capacity|quality|quantity|storage|moisture|light|family|household|burr|blade|grind|brew|noise|step|verdict|hand|grip|button|sensitivity|wired|wireless|connection|schedule|template|planning|planner|record|curriculum|arch|heel cup|midsole|footwear|shoe|sandal|motor|belt|deck|space|fold|desk|surface)/i;
const NUMBERED_CRITERIA = /^\d+\.\s*(portab|weight|size|fit|dimension|material|foam|gel|support|adjust|compatib|capacity|storage|arch|heel|midsole|noise|motor|belt|deck|grind|burr|brew|schedule|template)/i;

function sectionHeading(paragraph: HTMLParagraphElement, headings: HTMLHeadingElement[]): string {
  let current = "";
  for (const heading of headings) {
    if (heading.compareDocumentPosition(paragraph) & Node.DOCUMENT_POSITION_FOLLOWING) {
      current = heading.textContent || "";
    } else {
      break;
    }
  }
  return current;
}

function chooseParagraphs(article: HTMLElement): HTMLParagraphElement[] {
  const headings = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2, h3")).filter(
    (heading) => !heading.closest("aside, [data-amazon-carousel], [data-affiliate-boost]"),
  );
  const candidates = Array.from(article.querySelectorAll<HTMLParagraphElement>("p")).filter((paragraph) => {
    if ((paragraph.textContent || "").trim().length < 90) return false;
    if (paragraph.closest("aside, nav, header, footer, [data-amazon-carousel], [data-affiliate-boost], [data-no-affiliate]")) return false;
    const heading = sectionHeading(paragraph, headings);
    const numbered = /^\d+\.\s/.test(heading);
    return SAFE_SECTION.test(heading) && !BLOCKED_SECTION.test(heading) && (!numbered || NUMBERED_CRITERIA.test(heading));
  });

  const count = Math.min(MAX_PLACEMENTS, candidates.length);
  const selected: HTMLParagraphElement[] = [];
  const used = new Set<number>();
  for (let slot = 0; slot < count; slot += 1) {
    const index = Math.min(candidates.length - 1, Math.floor(((slot + 1) * candidates.length) / (count + 1)));
    if (!used.has(index)) {
      used.add(index);
      selected.push(candidates[index]);
    }
  }
  return selected;
}

function Placement({ href, slug, position }: { href: string; slug: string; position: number }) {
  const placementId = `contextual-amazon-${String(position + 1).padStart(2, "0")}`;
  return (
    <aside data-affiliate-boost={placementId} className="my-5 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm shadow-sm">
      <p className="m-0 flex flex-wrap items-center justify-between gap-2 text-slate-700">
        <span><strong>Shopping checkpoint:</strong> compare the guide criteria against current options.</span>
        <a
          href={href}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          data-affiliate-link="amazon"
          data-affiliate-site={portfolioSite.domain}
          data-affiliate-page={slug}
          data-product-id="category-discovery"
          data-placement-id={placementId}
          data-cta-position={`article-${position + 1}`}
          data-destination-type="search"
          className="font-bold text-amber-800 underline decoration-2 underline-offset-4"
        >
          Compare on Amazon
        </a>
      </p>
    </aside>
  );
}

export default function ContextualAmazonPlacements({ group, slug }: { group: AmazonProductGroup | null; slug: string }) {
  const [targets, setTargets] = useState<HTMLElement[]>([]);
  const href =
    group && portfolioSite.commercialEnabled && portfolioSite.partnerTag
      ? `https://www.amazon.com/s?k=${encodeURIComponent(group.similarQuery)}&tag=${encodeURIComponent(portfolioSite.partnerTag)}`
      : "";

  useEffect(() => {
    if (!href) return;
    const article = document.querySelector<HTMLElement>("main article") || document.querySelector<HTMLElement>("article");
    if (!article) return;

    const headings = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2, h3")).filter(
      (heading) => !heading.closest("aside, [data-amazon-carousel], [data-affiliate-boost]"),
    );
    const created = chooseParagraphs(article).map((paragraph, index) => {
      const target = document.createElement("div");
      target.dataset.affiliateBoostAnchor = `${slug}-${index + 1}`;
      target.dataset.affiliateContextHeading = sectionHeading(paragraph, headings);
      paragraph.insertAdjacentElement("afterend", target);
      return target;
    });
    setTargets(created);
    return () => created.forEach((target) => target.remove());
  }, [href, slug]);

  if (!href) return null;
  return <>{targets.map((target, index) => createPortal(<Placement href={href} slug={slug} position={index} />, target, `${slug}-${index}`))}</>;
}

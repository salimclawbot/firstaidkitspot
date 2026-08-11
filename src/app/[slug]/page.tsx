import { Metadata } from "next";
import AmazonProductShowcase from "@/components/AmazonProductShowcase";
import { getAmazonProductGroup } from "@/lib/amazon-product-registry";
import AffiliateDisclosureNotice from "@/components/AffiliateDisclosureNotice";
import { notFound } from "next/navigation";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";
import {
  buildKeywords,
  buildFaqSchema,
  getFaqItems,
  normalizeArticleHtml,
  normalizeMetaDescription,
  normalizeMetaTitle,
  type TocItem,
} from "@/lib/article-page-utils";
import { getArticleBySlug, getAllSlugs } from "@/lib/articles";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function TableOfContents({ items }: { items: TocItem[] }) {
  if (!items.length) return null;
  return (
    <nav className="bg-red-50 border border-red-200 rounded-lg p-5 mb-8">
      <p className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wide">Table of Contents</p>
      <ol className="list-decimal list-inside space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="text-sm text-slate-700 hover:text-slate-900 hover:underline">
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function InternalLinks() {
  const links = [
    { href: "/guides/first-aid-kit-buying-guide", label: "How to choose the best first-aid kit" },
    { href: "/guides/first-aid-diy-fundamentals", label: "First Aid Basics for New Parents" },
    { href: "/guides/travel-first-aid-kit", label: "Travel first-aid kit essentials" },
    { href: "/guides/pet-first-aid-fundamentals", label: "Pet-safe home first aid setup" },
  ];

  return (
    <aside className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h2 className="text-lg font-bold text-slate-900">More First Aid Guides</h2>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="hover:underline">{link.label}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FaqSection({ items, slug }: { items: { question: string; answer: string }[]; slug: string }) {
  if (!items.length) return null;
  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h2 className="text-2xl font-bold text-slate-900" id="faq">
        Frequently Asked Questions
      </h2>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <details key={`${slug}-${item.question}`} className="rounded-lg border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">{item.question}</summary>
            <p className="mt-2 text-sm text-slate-700">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

const parseJsonField = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

function extractAndStripSchema(content: string) {
  const schemaRegex = /```json\n([\s\S]*?)\n```/g;
  const schemas: Record<string, unknown>[] = [];
  let match: RegExpExecArray | null;
  let contentWithoutSchemas = content;

  while ((match = schemaRegex.exec(content)) !== null) {
    try {
      schemas.push(JSON.parse(match[1]));
    } catch {
      // Ignore malformed blocks
    }
  }

  contentWithoutSchemas = contentWithoutSchemas.replace(/```json\n[\s\S]*?\n```\n?/g, "");

  return { schemas, contentWithoutSchemas };
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Not Found" };

  const title = normalizeMetaTitle(article.title);
  const description = normalizeMetaDescription(article.description);
  return {
    title,
    description,
    keywords: buildKeywords(article.title, String(article.frontmatter?.category || "First Aid")),
    alternates: { canonical: `https://firstaidkitspot.com/${article.slug}` },
    openGraph: {
      title,
      description,
      url: `https://firstaidkitspot.com/${article.slug}`,
      images: [{ url: "https://firstaidkitspot.com/editorial-hero.png", width: 1536, height: 864, alt: title }],
      type: "article",
      siteName: "First Aid Kit Spot",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://firstaidkitspot.com/editorial-hero.png"],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const title = normalizeMetaTitle(article.title);
  const description = normalizeMetaDescription(article.description);

  const { contentWithoutSchemas } = extractAndStripSchema(article.content);
  const processed = await remark().use(remarkGfm).use(html, { sanitize: false }).process(contentWithoutSchemas);
  const htmlFromMarkdown = String(processed);
  const { html: normalizedHtml, toc } = normalizeArticleHtml(htmlFromMarkdown, article.title);
  const amazonProductGroup = getAmazonProductGroup(article.slug);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <p className="text-xs font-semibold uppercase tracking-wide text-red-700">{String(article.frontmatter?.category || "First Aid")}</p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900">{title}</h1>
      <p className="mt-3 text-slate-600">By First Aid Kit Spot Editorial Team • Published {article.publishedAt}</p>
      <figure className="my-7 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
        <img src="/editorial-hero.png" alt={article.title} className="aspect-[16/9] w-full object-cover" width="1536" height="864" fetchPriority="high" />
      </figure>
      <AffiliateDisclosureNotice />

      <TableOfContents items={toc} />
      <AmazonProductShowcase group={amazonProductGroup} slug={article.slug} />
      <div className="prose prose-slate max-w-none mt-8" dangerouslySetInnerHTML={{ __html: normalizedHtml }} />

      <InternalLinks />
    </article>
  );
}

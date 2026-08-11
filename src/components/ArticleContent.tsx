"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { Article } from "@/lib/articles";

const AFFILIATE_TAG = "firstaidkitspot-20";
const TRACKING_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "msclkid"];
const YOUTUBE_HOST_RE = /(youtube\.com|youtu\.be|youtube-nocookie\.com)/i;

function normalizeTrackingParams(rawHref: string): string {
  try {
    const parsed = new URL(rawHref);
    TRACKING_PARAMS.forEach((param) => parsed.searchParams.delete(param));
    return parsed.toString();
  } catch {
    return rawHref;
  }
}

function normalizeAmazonUrl(rawHref: string): string {
  try {
    const parsed = new URL(rawHref);
    if (!/amazon\./i.test(parsed.hostname) && !/amzn\.to/i.test(parsed.hostname)) {
      return rawHref;
    }
    parsed.searchParams.set("tag", AFFILIATE_TAG);
    return normalizeTrackingParams(parsed.toString());
  } catch {
    return rawHref;
  }
}

interface ArticleContentProps {
  article: Article;
}

// Custom components for markdown elements
const components = {
  h1: (props: any) => <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />,
  h2: (props: any) => <h2 className="text-2xl font-bold mt-8 mb-3 border-t pt-4" {...props} />,
  h3: (props: any) => <h3 className="text-xl font-bold mt-6 mb-2" {...props} />,
  h4: (props: any) => <h4 className="text-lg font-semibold mt-5 mb-2" {...props} />,
  p: (props: any) => <p className="mb-4 leading-relaxed" {...props} />,
  a: (props: any) => {
    if (props.href && YOUTUBE_HOST_RE.test(props.href)) {
      return <span className="text-xs text-slate-700">Video content moved here to keep the site YouTube-free.</span>;
    }
    const normalizedHref = props.href ? normalizeAmazonUrl(normalizeTrackingParams(props.href)) : "";
    if (props.href && /amazon\./i.test(normalizedHref)) {
      const { href, ...rest } = props;
      const rel = new Set((props.rel ?? "").toString().split(/\s+/).filter(Boolean));
      rel.add("nofollow");
      rel.add("sponsored");
      rel.add("noopener");
      rel.add("noreferrer");
      if (!rel.has("ugc")) rel.add("ugc");
      return (
        <a
          className="text-blue-600 hover:underline"
          href={normalizedHref}
          rel={Array.from(rel).join(" ")}
          target="_blank"
          {...rest}
        />
      );
    }
    return <a className="text-blue-600 hover:underline" {...props} />;
  },
  img: (props: any) => (
    <figure className="my-6">
      <img
        {...props}
        className="rounded-lg max-w-full h-auto"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
      {props.alt && <figcaption className="text-sm text-gray-600 mt-2 text-center">{props.alt}</figcaption>}
    </figure>
  ),
  video: (props: any) => (
    <video
      className="w-full rounded-lg my-6"
      controls
      preload="metadata"
      muted
      {...props}
      style={{ width: "100%", borderRadius: "8px", margin: "1.5rem 0" }}
    />
  ),
  table: (props: any) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse border border-gray-300" {...props} />
    </div>
  ),
  tr: (props: any) => <tr className="border border-gray-300" {...props} />,
  td: (props: any) => <td className="border border-gray-300 px-4 py-2" {...props} />,
  th: (props: any) => <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-bold" {...props} />,
  ul: (props: any) => <ul className="list-disc list-inside mb-4 pl-4" {...props} />,
  ol: (props: any) => <ol className="list-decimal list-inside mb-4 pl-4" {...props} />,
  li: (props: any) => <li className="mb-2" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4" {...props} />
  ),
};

export default function ArticleContent({ article }: ArticleContentProps) {
  // Parse schema blocks from markdown content
  const schemaRegex = /```json\n([\s\S]*?)\n```/g;
  const schemas: any[] = [];
  let match;
  let contentWithoutSchemas = article.content;

  while ((match = schemaRegex.exec(article.content)) !== null) {
    try {
      schemas.push(JSON.parse(match[1]));
    } catch (e) {
      console.error("Failed to parse schema:", match[1]);
    }
  }

  // Remove schema blocks from rendered content
  contentWithoutSchemas = contentWithoutSchemas.replace(/```json\n[\s\S]*?\n```\n?/g, "");
  
  // Ensure Amazon links are properly converted to HTML anchors
  contentWithoutSchemas = contentWithoutSchemas.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]*amazon[^\)]*)\)/g,
    (_match, text, href) => `<a href="${normalizeAmazonUrl(normalizeTrackingParams(href))}" target="_blank" rel="noopener noreferrer nofollow sponsored ugc">${text}</a>`
  );

  return (
    <>
      {/* Schema.org structured data */}
      {schemas.map((schema, idx) => (
        <script key={idx} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      {/* Article header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <p className="text-gray-600">By {article.author} • Published {new Date(article.publishedAt).toLocaleDateString()}</p>
        {article.image && (
          <img src={article.image} alt={article.title} className="w-full rounded-lg mt-4 max-h-96 object-cover" />
        )}
      </div>

      {/* Main content with markdown rendering */}
      <div className="prose prose-slate max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeRaw,
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
          ]}
          components={components}
        >
          {contentWithoutSchemas}
        </ReactMarkdown>
      </div>
    </>
  );
}

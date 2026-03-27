"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { Article } from "@/lib/articles";

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
  a: (props: any) => <a className="text-blue-600 hover:underline" {...props} />,
  img: (props: any) => (
    <figure className="my-6">
      <img {...props} className="rounded-lg max-w-full h-auto" />
      {props.alt && <figcaption className="text-sm text-gray-600 mt-2 text-center">{props.alt}</figcaption>}
    </figure>
  ),
  video: (props: any) => (
    <video
      {...props}
      style={{ width: "100%", borderRadius: "8px", margin: "1.5rem 0" }}
      autoPlay
      muted
      loop
      playsInline
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

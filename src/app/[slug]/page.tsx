import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug, getAllSlugs } from "@/lib/articles";
import ArticleContent from "@/components/ArticleContent";

interface PageProps { params: { slug: string } }

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  if (!article) return { title: "Not Found" };
  
  const ogImage = article.image || "https://firstaidkitspot.com/og-image.jpg";
  
  return {
    title: { absolute: article.title },
    description: article.description,
    alternates: { canonical: `https://firstaidkitspot.com/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://firstaidkitspot.com/${article.slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
      type: "article",
      siteName: "First Aid Kit Spot",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [ogImage],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <ArticleContent article={article} />
    </article>
  );
}

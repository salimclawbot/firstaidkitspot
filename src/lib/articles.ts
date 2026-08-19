import { safeMatter } from "@/lib/safe-matter";
import { normalizeArticleHeadings, resolveArticleDescription, resolveArticleTitle } from "@/lib/article-copy";
import fs from "fs";
import path from "path";

const contentDirectory = path.join(process.cwd(), "content");
const redirectedSlugs = new Set(["what-every-first-aid-kit-should-contain"]);

export interface Article {
  slug: string;
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  image: string;
  content: string;
  frontmatter: Record<string, unknown>;
}

export function getArticleBySlug(slug: string): Article | null {
  try {
    const filePath = path.join(contentDirectory, `${slug}.md`);
    const content = fs.readFileSync(filePath, "utf-8");
    const { data, content: markdown } = safeMatter(content);

    return {
      slug,
      title: resolveArticleTitle(data.title, slug),
      description: resolveArticleDescription(data.description || data.meta_description, markdown, resolveArticleTitle(data.title, slug)),
      author: "First Aid Kit Spot Editorial Team",
      publishedAt: String(data.publishedAt || data.datePublished || "2026-01-01"),
      image: String(data.image || "/editorial-hero.png"),
      content: markdown,
      frontmatter: data,
    };
  } catch (error) {
    return null;
  }
}

export function getAllArticles(): Article[] {
  try {
    const files = fs.readdirSync(contentDirectory);
    const articles = files
      .filter((file) => file.endsWith(".md") && !redirectedSlugs.has(file.replace(/\.md$/, "")))
      .map((file) => {
        const slug = file.replace(".md", "");
        const article = getArticleBySlug(slug);
        return article;
      })
      .filter((article): article is Article => article !== null)
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        return dateB - dateA;
      });

    return articles;
  } catch (error) {
    return [];
  }
}

export function getAllSlugs(): string[] {
  try {
    const files = fs.readdirSync(contentDirectory);
    return files
      .filter((file) => file.endsWith(".md") && !redirectedSlugs.has(file.replace(/\.md$/, "")))
      .map((file) => file.replace(".md", ""));
  } catch (error) {
    return [];
  }
}

// No markdown processing here — let Next.js pages handle it with react-markdown

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDirectory = path.join(process.cwd(), "content");

export interface Article {
  slug: string;
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  image: string;
  content: string;
  frontmatter: any;
}

export function getArticleBySlug(slug: string): Article | null {
  try {
    const filePath = path.join(contentDirectory, `${slug}.md`);
    const content = fs.readFileSync(filePath, "utf-8");
    const { data, content: markdown } = matter(content);

    return {
      slug,
      title: data.title,
      description: data.description,
      author: data.author,
      publishedAt: data.publishedAt,
      image: data.image,
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
      .filter((file) => file.endsWith(".md"))
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
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(".md", ""));
  } catch (error) {
    return [];
  }
}

// No markdown processing here — let Next.js pages handle it with react-markdown

import { Metadata } from "next";
import Link from "next/link";
import { getAllSlugs, getArticle } from "@/lib/articles";
export const metadata: Metadata = {
  title: "Best Office Chairs for Back Pain & Lumbar Support (2026)",
  description: "Expert-tested office chairs for back pain, lumbar support, and all-day comfort. Compare the best ergonomic chairs of 2026.",
  alternates: { canonical: "https://officechairpicks.vercel.app" },
};
export default async function HomePage() {
  const slugs = getAllSlugs();
  const articles = (await Promise.all(slugs.map(s => getArticle(s)))).filter(Boolean);
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="mb-4 text-4xl font-bold text-slate-900">Best Office Chairs for Back Pain & Lumbar Support (2026)</h1>
      <p className="mb-12 text-xl text-slate-600">Expert-tested picks for all-day comfort. No more aching backs.</p>
      <div className="grid gap-6">
        {articles.map((a) => a && (
          <Link key={a.slug} href={`/${a.slug}`} className="block rounded-xl border border-slate-200 p-6 transition-all hover:border-blue-600 hover:shadow-md">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">{a.title}</h2>
            <p className="text-slate-600">{a.description}</p>
            <span className="mt-3 inline-block text-sm font-medium text-blue-600">Read guide →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}

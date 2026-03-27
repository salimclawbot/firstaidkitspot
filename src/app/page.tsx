import { Metadata } from "next";
import Link from "next/link";
import { getAllSlugs, getArticle } from "@/lib/articles";
export const metadata: Metadata = {
  title: "Best First Aid Kits & Supplies (2026): Expert-Tested Picks",
  description: "Expert-reviewed first aid kits for home, car and outdoor use in 2026. Find the best emergency kit with our detailed buyer guides, checklists and comparisons.",
  alternates: { canonical: "https://firstaidkitspot.com" },
};
export default async function HomePage() {
  const slugs = getAllSlugs();
  const articles = (await Promise.all(slugs.map(s => getArticle(s)))).filter(Boolean);
      return (
    <main className="max-w-4xl mx-auto px-4 py-12"><img src="/images/first-aid-kit-hero.jpg" alt="Best first aid kits 2026 - expert tested picks" style={{width:"100%",maxHeight:"380px",objectFit:"cover",borderRadius:"12px",marginBottom:"1.5rem"}} />
      <h1 className="mb-4 text-4xl font-bold text-slate-900">Best First Aid Kits & Supplies (2026): Expert-Tested Picks</h1>
      <p className="mb-12 text-xl text-slate-600">Expert-reviewed picks for home, car and outdoor emergencies.</p>
      <div className="grid gap-6">
        {articles.map((a) => a && (
          <Link key={a.slug} href={`/${a.slug}`} className="block rounded-xl border border-slate-200 p-6 transition-all hover:border-blue-600 hover:shadow-md">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">{a.title}</h2>
            <p className="text-slate-600">{a.description}</p>
            <span className="mt-3 inline-block text-sm font-medium text-blue-600">Read guide →</span>
          </Link>
        ))}
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {"@type":"Question","name":"What should be in a home first aid kit?","acceptedAnswer":{"@type":"Answer","text":"A home first aid kit should include bandages, gauze, antiseptic wipes, adhesive tape, scissors, tweezers, thermometer, pain relievers, and a first aid manual."}},
            {"@type":"Question","name":"How often should you replace your first aid kit?","acceptedAnswer":{"@type":"Answer","text":"Check your first aid kit every 12 months and replace expired items. Most pre-packaged kits have a 5-year shelf life but individual items may expire sooner."}},
            {"@type":"Question","name":"What is the best first aid kit for home use?","acceptedAnswer":{"@type":"Answer","text":"The Johnson & Johnson All-Purpose First Aid Kit is our top pick for home use, offering 160 pieces covering most common household injuries at an affordable price."}}
          ]
        })}}
      />
      </main>
  );
}

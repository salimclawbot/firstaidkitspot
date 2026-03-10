import Link from "next/link";

export interface BreadcrumbItem { label: string; url: string }

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://officechairpicks.vercel.app" },
      ...items.map((item, idx) => ({ "@type": "ListItem", position: idx + 2, name: item.label, item: `https://officechairpicks.vercel.app${item.url}` })),
    ],
  };
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-2">
        <li><Link href="/" className="hover:text-blue-700">Home</Link></li>
        {items.map((item) => (
          <li key={item.url} className="flex items-center gap-2"><span>/</span><Link href={item.url} className="hover:text-blue-700">{item.label}</Link></li>
        ))}
      </ol>
    </nav>
  );
}

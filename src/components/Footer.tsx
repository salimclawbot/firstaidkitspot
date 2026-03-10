import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-blue-100 bg-blue-50/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-slate-700 sm:px-6 md:grid-cols-3">
        <div>
          <h3 className="font-semibold text-slate-900">Office Chair Picks</h3>
          <p className="mt-2">Expert-tested office chair reviews, comparisons, and buying guides focused on pain relief and long-session comfort.</p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Guides</h3>
          <ul className="mt-2 space-y-1">
            <li><Link href="/best-office-chair-for-back-pain" className="hover:text-blue-700">Best Office Chair for Back Pain</Link></li>
            <li><Link href="/affiliate-disclosure" className="hover:text-blue-700">Affiliate Disclosure</Link></li>
            <li><Link href="/privacy" className="hover:text-blue-700">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Contact</h3>
          <p className="mt-2">hello@officechairpicks.vercel.app</p>
        </div>
      </div>
      <div className="border-t border-blue-100 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} Office Chair Picks</div>
    </footer>
  );
}

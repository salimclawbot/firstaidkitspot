import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-red-100 bg-red-50/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-slate-700 sm:px-6 md:grid-cols-3">
        <div>
          <h3 className="font-semibold text-slate-900">First Aid Kit Spot</h3>
          <p className="mt-2">Expert first aid kit reviews, buying guides, and checklists for home, car, and outdoor use.</p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Guides</h3>
          <ul className="mt-2 space-y-1">
            <li><Link href="/best-first-aid-kit-home" className="hover:text-red-700">Home Kit</Link></li>
            <li><Link href="/best-first-aid-kit-car" className="hover:text-red-700">Car Kit</Link></li>
            <li><Link href="/first-aid-kit-checklist" className="hover:text-red-700">Checklist</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Contact</h3>
          <p className="mt-2">hello@firstaidkitspot.com</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/privacy-policy" className="hover:text-red-700">Privacy Policy</Link></li>
            <li><Link href="/affiliate-disclosure" className="hover:text-red-700">Affiliate Disclosure</Link></li>
            <li><Link href="/about" className="hover:text-red-700">About</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-red-100 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} First Aid Kit Spot</div>
    </footer>
  );
}

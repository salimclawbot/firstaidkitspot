"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-red-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-bold text-red-800">First Aid Kit Spot</Link>
        <nav className="hidden gap-6 text-sm font-medium text-slate-700 md:flex">
          <Link href="/best-first-aid-kit-home" className="hover:text-red-700">Home Kit</Link>
          <Link href="/best-first-aid-kit-car" className="hover:text-red-700">Car Kit</Link>
          <Link href="/first-aid-kit-checklist" className="hover:text-red-700">Checklist</Link>
          <Link href="/about" className="hover:text-red-700">About</Link>
        </nav>
      </div>
    </header>
  );
}

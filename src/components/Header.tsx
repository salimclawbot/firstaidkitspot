"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-blue-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-bold text-blue-800">Office Chair Picks</Link>
        <nav className="hidden gap-6 text-sm font-medium text-slate-700 md:flex">
          <Link href="/best-office-chair-for-back-pain" className="hover:text-blue-700">Best Overall</Link>
          <Link href="/affiliate-disclosure" className="hover:text-blue-700">Disclosure</Link>
          <Link href="/contact" className="hover:text-blue-700">Contact</Link>
          <Link href="/about" className="hover:text-blue-700">About</Link>
        </nav>
      </div>
    </header>
  );
}

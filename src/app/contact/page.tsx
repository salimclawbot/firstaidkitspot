import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "First Aid Kit Spot is here to help with buying guidance, content requests, and practical affiliate support updates.",
  alternates: { canonical: "https://firstaidkitspot.com/contact" },
  openGraph: {
    title: "Contact",
    description: "First Aid Kit Spot is here to help with buying guidance, content requests, and practical affiliate support updates.",
    url: "https://firstaidkitspot.com/contact",
    siteName: "First Aid Kit Spot",
    type: "website",
    images: [
      {
        url: "https://firstaidkitspot.com/editorial-hero.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact",
    description: "First Aid Kit Spot is here to help with buying guidance, content requests, and practical affiliate support updates.",
    images: ["https://firstaidkitspot.com/editorial-hero.png"],
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-4">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p>Questions, corrections, or partnership inquiries:</p>
      <p><a className="text-blue-700 underline" href="mailto:hello@First Aid Kit Spot">hello@First Aid Kit Spot</a></p>
    </div>
  );
}

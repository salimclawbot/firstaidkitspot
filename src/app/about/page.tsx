import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "First Aid Kit Spot is your practical guide to evidence-forward product comparisons, buying support, and transparent recommendations.",
  alternates: { canonical: "https://firstaidkitspot.com/about" },
  openGraph: {
    title: "About",
    description: "First Aid Kit Spot is your practical guide to evidence-forward product comparisons, buying support, and transparent recommendations.",
    url: "https://firstaidkitspot.com/about",
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
    title: "About",
    description: "First Aid Kit Spot is your practical guide to evidence-forward product comparisons, buying support, and transparent recommendations.",
    images: ["https://firstaidkitspot.com/editorial-hero.png"],
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-4">
      <h1 className="text-3xl font-bold">About First Aid Kit Spot</h1>
      <p>First Aid Kit Spot publishes practical buying guides and comparisons for people trying to reduce back pain, improve posture, and sit more comfortably through long workdays.</p>
      <p>Our editorial team compares published research, manufacturer specifications, and independent owner feedback. We do not claim individual clinical credentials or first-hand testing.</p>
    </div>
  );
}

export const metadata = { title: "Privacy Policy", alternates: { canonical: "https://firstaidkitspot.com/privacy" } };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-4">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p><strong>Last updated:</strong> March 11, 2026</p>
      <p>First Aid Kit Spot (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates this website. This policy explains how we collect, use, and protect your information.</p>

      <h2 className="text-xl font-semibold">Information We Collect</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Contact details you submit (name/email)</li>
        <li>Newsletter subscription email (if opted in)</li>
        <li>Analytics/log data: page views, device/browser, referral, approximate location</li>
      </ul>

      <h2 className="text-xl font-semibold">How We Use Data</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Improve site content and user experience</li>
        <li>Respond to user inquiries</li>
        <li>Send newsletters with consent</li>
        <li>Meet legal obligations</li>
      </ul>

      <h2 className="text-xl font-semibold">Cookies</h2>
      <p>We use essential cookies and analytics cookies (Google Analytics). You can manage cookies through browser settings.</p>

      <h2 className="text-xl font-semibold">Third-Party Services</h2>
      <p>We use Google Analytics and Vercel hosting. Retailers and affiliate networks may process click-through events on their own platforms.</p>

      <h2 className="text-xl font-semibold">Your Rights</h2>
      <p>You may request access, correction, or deletion of your personal data where applicable law provides such rights.</p>

      <h2 className="text-xl font-semibold">Contact</h2>
      <p>Email: <a className="text-blue-700 underline" href="mailto:privacy@First Aid Kit Spot">privacy@First Aid Kit Spot</a></p>
    </div>
  );
}

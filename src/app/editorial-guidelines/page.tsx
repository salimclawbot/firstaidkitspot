export const metadata = { title: "Editorial Guidelines | First Aid Kit Spot" };

export default function EditorialGuidelinesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Editorial Guidelines</h1>
      <p className="text-lg text-gray-600">How we research, write, and review content at First Aid Kit Spot.</p>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Our Commitment to Accuracy</h2>
        <p>Every guide and review published on First Aid Kit Spot is thoroughly researched before publication. Our writers draw on peer-reviewed research, expert interviews, and hands-on product testing to ensure the information we provide about first aid preparedness and emergency supplies is accurate, up-to-date, and genuinely useful.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Editorial Independence</h2>
        <p>Our editorial team operates independently of our commercial relationships. While we may earn affiliate commissions when readers purchase products through our links, this never influences which products we recommend or how we rate them. Recommendations are based solely on research merit and reader benefit.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Review and Update Process</h2>
        <p>We review our articles regularly and update them when new products launch, research changes, or prices shift. Every article displays a &quot;Last Updated&quot; date so you always know how current the information is.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Corrections Policy</h2>
        <p>If you spot an error in our content, please <a href="/contact" className="text-blue-600 hover:underline">contact us</a>. We take accuracy seriously and will investigate and correct verified errors promptly.</p>
      </section>

      <p><a href="/" className="text-blue-600 hover:underline">← Back to First Aid Kit Spot</a></p>
    </div>
  );
}

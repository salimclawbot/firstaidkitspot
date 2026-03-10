export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-4">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p>Questions, corrections, or partnership inquiries:</p>
      <p><a className="text-blue-700 underline" href="mailto:hello@officechairpicks.vercel.app">hello@officechairpicks.vercel.app</a></p>
    </div>
  );
}

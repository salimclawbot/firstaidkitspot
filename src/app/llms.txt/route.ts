export async function GET() {
  const body = `# First Aid Kit Spot

> Product-focused first-aid guides and preparedness content with clear affiliate disclosures.

## Editorial signals
- Site: https://firstaidkitspot.com
- About: https://firstaidkitspot.com/about
- Affiliate Disclosure: https://firstaidkitspot.com/affiliate-disclosure
- Editorial Guidelines: https://firstaidkitspot.com/editorial-guidelines
- Privacy Policy: https://firstaidkitspot.com/privacy
- Contact: https://firstaidkitspot.com/contact

## Contact
- hello@firstaidkitspot.com
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

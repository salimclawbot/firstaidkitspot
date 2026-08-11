export type AmazonProductRecord = { id: string; asin: string; label: string };
export type AmazonProductGroup = { heading: string; similarQuery: string; products: AmazonProductRecord[] };

export const allowedAmazonProducts: Record<string, AmazonProductRecord> = {
  "FA-PROD-MYMEDIC-SIDEKICK-RED-STANDARD": {
    "id": "FA-PROD-MYMEDIC-SIDEKICK-RED-STANDARD",
    "asin": "B0C84FTL1G",
    "label": "MyMedic Sidekick Standard, red"
  },
  "FA-PROD-FAO-428": {
    "id": "FA-PROD-FAO-428",
    "asin": "B000YME6WC",
    "label": "First Aid Only FAO-428, fabric case"
  }
};

const groups: Record<string, AmazonProductGroup> = {
  "best-portable-first-aid-kits-2026": {
    "heading": "Portable kits referenced in this guide",
    "similarQuery": "portable first aid kit",
    "products": [
      {
        "id": "FA-PROD-MYMEDIC-SIDEKICK-RED-STANDARD",
        "asin": "B0C84FTL1G",
        "label": "MyMedic Sidekick Standard, red"
      },
      {
        "id": "FA-PROD-FAO-428",
        "asin": "B000YME6WC",
        "label": "First Aid Only FAO-428, fabric case"
      }
    ]
  }
};

export function getAmazonProductGroup(slug: string): AmazonProductGroup | null {
  const exact = groups[slug];
  if (exact) return exact;

  const allowed = /(best-first-aid-kit|first-aid-kit-checklist|what-every-first-aid-kit-should-contain|first-aid-kids)/i.test(slug);
  const denied = /(cpr|choking|burn|allergic|head-injur|snake|heimlich|treat)/i.test(slug);
  if (!allowed || denied) return null;

  return {
    heading: "First-aid kit listings related to this guide",
    similarQuery: "first aid kit",
    products: [],
  };
}

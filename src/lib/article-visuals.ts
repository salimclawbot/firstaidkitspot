type ArticleVisual = {
  src: string;
  alt: string;
};

const visuals: Record<string, ArticleVisual> = {
  "best-first-aid-kids": {
    src: "/images/articles/best-first-aid-kids-hero.webp",
    alt: "Compact youth sports first-aid kit arranged on a sideline bench",
  },
  "best-first-aid-kit-for-car": {
    src: "/images/articles/best-first-aid-kit-for-car-hero.webp",
    alt: "Vehicle first-aid and emergency supplies secured in an open car trunk",
  },
  "best-first-aid-kits-for-home": {
    src: "/images/articles/best-first-aid-kits-for-home-hero.webp",
    alt: "Organized home first-aid kit stored on a linen closet shelf",
  },
  "best-first-aid-kits-for-kids-2026": {
    src: "/images/articles/best-first-aid-kits-for-kids-2026-hero.webp",
    alt: "Child-focused first-aid supplies arranged beside a small backpack",
  },
  "choking-first-aid-heimlich": {
    src: "/images/articles/choking-first-aid-heimlich-hero.webp",
    alt: "First-aid trainer demonstrating abdominal hand placement on a training mannequin",
  },
  "cpr-guide-adults-step-by-step": {
    src: "/images/articles/cpr-guide-adults-step-by-step-hero.webp",
    alt: "Adult CPR chest-compression practice on a training mannequin beside a training AED",
  },
  "first-aid-kit-checklist-2026": {
    src: "/images/articles/first-aid-kit-checklist-2026-hero.webp",
    alt: "Essential first-aid supplies organized in a clear overhead checklist layout",
  },
  "how-to-treat-burns-at-home": {
    src: "/images/articles/how-to-treat-burns-at-home-hero.webp",
    alt: "Cool running tap water with sterile non-stick dressings and a clean towel",
  },
  "what-every-first-aid-kit-should-contain": {
    src: "/images/articles/what-every-first-aid-kit-should-contain-hero.webp",
    alt: "Open portable first-aid organizer with gauze, gloves, tape, and scissors",
  },
};

export function getArticleVisual(slug: string, title: string): ArticleVisual {
  return visuals[slug] || {
    src: "/editorial-hero.png",
    alt: `${title} from First Aid Kit Spot`,
  };
}

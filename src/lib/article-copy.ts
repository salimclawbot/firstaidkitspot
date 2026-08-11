const SMALL_WORDS = new Set(["a", "an", "and", "at", "by", "for", "from", "in", "of", "on", "or", "the", "to", "vs", "with"]);
const SPECIAL_WORDS: Record<string, string> = { ai: "AI", cts: "CTS", faq: "FAQ", adhd: "ADHD", dht: "DHT", diy: "DIY", mac: "Mac", macbook: "MacBook", usb: "USB" };

function cleanText(value: unknown): string {
  return String(value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function isSlugShaped(value: string, slug: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === slug.toLowerCase() || /^[a-z0-9]+(?:-[a-z0-9]+){1,}$/.test(normalized);
}

function titleCaseSlug(slug: string): string {
  let words = slug.replace(/-+/g, "-").split("-").filter(Boolean);
  const conditionTails = [["carpal", "tunnel"], ["plantar", "fasciitis"], ["wrist", "pain"], ["coccyx", "pain"], ["sciatica"]];
  if (words[0] === "best" && !words.includes("for")) {
    for (const tail of conditionTails) {
      const startsAt = words.length - tail.length;
      if (startsAt > 1 && tail.every((word, index) => words[startsAt + index] === word)) {
        words = [...words.slice(0, startsAt), "for", ...tail];
        break;
      }
    }
  }
  return words.map((word, index) => {
    if (SPECIAL_WORDS[word]) return SPECIAL_WORDS[word];
    if (word === "c" && words[index + 1] === "section") return "C";
    if (index > 0 && SMALL_WORDS.has(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(" ").replace(/\bC Section\b/g, "C-Section");
}

function markdownParagraphs(markdown: string): string[] {
  return String(markdown || "").split(/\n\s*\n/).map((block) => block
    .replace(/^---[\s\S]*?---\s*/, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_~`>#]/g, " ")
    .replace(/^\s*(?:[-+]|\d+\.)\s+/gm, " ")
    .replace(/\{#[^}]+\}/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ").trim())
    .filter((text) => text.length >= 90 && !/^(affiliate disclosure|amazon associate|medical disclaimer|table of contents)/i.test(text));
}

function concise(value: string, max = 158): string {
  const text = cleanText(value);
  if (text.length <= max) return text;
  const clipped = text.slice(0, max + 1);
  const sentence = clipped.match(/^.{100,157}[.!?](?=\s|$)/)?.[0];
  if (sentence) return sentence;
  return clipped.slice(0, clipped.lastIndexOf(" ")).replace(/[,:;\-]+$/, "") + ".";
}

export function resolveArticleTitle(value: unknown, slug: string): string {
  const supplied = cleanText(value);
  return supplied && !isSlugShaped(supplied, slug) && !/(?:\.\.\.|…)$/.test(supplied) ? supplied : titleCaseSlug(slug);
}

export function resolveArticleDescription(value: unknown, markdown: string, title: string): string {
  const supplied = cleanText(value);
  const unusable = !supplied || isSlugShaped(supplied, title.toLowerCase().replace(/[^a-z0-9]+/g, "-")) || supplied === title || supplied.length < 105 || /(?:\.\.\.|…)$/.test(supplied) || /\b(?:the|for|and|of|to|with)\.$/i.test(supplied) || /practical, evidence-aware guidance from|office chair buying guide article|\barticle\.$/i.test(supplied);
  if (!unusable) return concise(supplied);
  const contextual = markdownParagraphs(markdown)[0];
  if (contextual) return concise(contextual.length < 115 ? contextual + " This guide explains the key considerations, practical next steps, and important limits." : contextual);
  return concise("Learn about " + title.toLowerCase() + ", the key options to consider, practical next steps, important limitations, and when professional guidance may be appropriate.");
}

export function normalizeArticleHeadings(html: string): string {
  let previous = 1;
  const stack: number[] = [];
  const withoutDuplicateH1 = String(html || "").replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi, "");
  return withoutDuplicateH1.replace(/<(\/?h)([2-6])(\b[^>]*)>/gi, (tag, prefix, rawLevel, attrs) => {
    if (prefix.startsWith("/")) {
      const level = stack.pop();
      return level ? "</h" + level + ">" : tag;
    }
    const requested = Number(rawLevel);
    const level = Math.min(requested, previous + 1);
    previous = level;
    stack.push(level);
    return "<h" + level + attrs + ">";
  });
}

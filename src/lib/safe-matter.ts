import matter from "gray-matter";

export type SafeMatterResult = { data: Record<string, unknown>; content: string };

function scalar(value: string): string | boolean | number {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  if (trimmed === "true" || trimmed === "false") return trimmed === "true";
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}

export function safeMatter(raw: string): SafeMatterResult {
  const normalized = raw.replace(/^---(?=[^\r\n])/, "---\n");
  try {
    const parsed = matter(normalized);
    return { data: parsed.data as Record<string, unknown>, content: parsed.content };
  } catch {
    const match = normalized.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
    if (!match) return { data: {}, content: normalized };
    const data: Record<string, unknown> = {};
    let activeKey = "";
    for (const line of match[1].split(/\r?\n/)) {
      const field = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
      if (field) {
        activeKey = field[1];
        const value = field[2];
        if (value && !value.startsWith("[") && activeKey !== "faq_schema" && activeKey !== "article_schema") data[activeKey] = scalar(value);
        continue;
      }
      if (activeKey && /^\s+\S/.test(line) && typeof data[activeKey] === "string") {
        data[activeKey] = `${data[activeKey]} ${line.trim()}`.trim();
      }
    }
    return { data, content: normalized.slice(match[0].length) };
  }
}

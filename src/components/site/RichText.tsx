import { Fragment, type ReactNode } from "react";
import { cn, isSafeHref } from "@/lib/utils";

/**
 * Renders a small, safe markdown subset as React elements (never raw HTML):
 * "## Heading", "### Sub-heading", "- bullet", "1. numbered", paragraphs,
 * **bold**, _italic_ / *italic*, [text](https://link).
 */
type Block = { type: "h2" | "h3" | "p"; text: string } | { type: "ul" | "ol"; items: string[] };

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;
  const flushPara = () => { if (para.length) { blocks.push({ type: "p", text: para.join(" ") }); para = []; } };
  const flushList = () => { if (list) { blocks.push(list); list = null; } };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    const h2 = /^##\s+(.*)/.exec(line);
    const h3 = /^###\s+(.*)/.exec(line);
    const ul = /^[-*•]\s+(.*)/.exec(line);
    const ol = /^\d+[.)]\s+(.*)/.exec(line);
    if (h3) { flushPara(); flushList(); blocks.push({ type: "h3", text: h3[1] }); continue; }
    if (h2) { flushPara(); flushList(); blocks.push({ type: "h2", text: h2[1] }); continue; }
    if (ul || ol) {
      flushPara();
      const type = ul ? "ul" : "ol";
      if (!list || list.type !== type) { flushList(); list = { type, items: [] }; }
      list.items.push((ul ?? ol)![1]);
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return blocks;
}

function renderInline(text: string): ReactNode {
  const tokens = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|_[^_]+_|\*[^*]+\*)/g).filter(Boolean);
  return tokens.map((t, i) => {
    if (t.startsWith("**") && t.endsWith("**")) return <strong key={i}>{t.slice(2, -2)}</strong>;
    if ((t.startsWith("_") && t.endsWith("_")) || (t.startsWith("*") && t.endsWith("*"))) return <em key={i}>{t.slice(1, -1)}</em>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(t);
    if (link) {
      const href = link[2].trim();
      if (!isSafeHref(href)) return <Fragment key={i}>{link[1]}</Fragment>;
      const external = /^https?:\/\//.test(href);
      return <a key={i} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{link[1]}</a>;
    }
    return <Fragment key={i}>{t}</Fragment>;
  });
}

export function RichText({ content, className }: { content: string; className?: string }) {
  if (!content?.trim()) return null;
  const blocks = parseBlocks(content);
  return (
    <div className={cn("prose-tt", className)}>
      {blocks.map((b, i) => {
        if (b.type === "h2") return <h2 key={i}>{renderInline(b.text)}</h2>;
        if (b.type === "h3") return <h3 key={i}>{renderInline(b.text)}</h3>;
        if (b.type === "ul") return <ul key={i}>{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ul>;
        if (b.type === "ol") return <ol key={i}>{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ol>;
        if (b.type === "p") return <p key={i}>{renderInline(b.text)}</p>;
        return null;
      })}
    </div>
  );
}

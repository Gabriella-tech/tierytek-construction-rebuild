import Link from "next/link";
import { JsonLd } from "@/components/site/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export function Breadcrumbs({ items, dark }: { items: Array<{ name: string; path: string }>; dark?: boolean }) {
  return (
    <nav aria-label="Breadcrumb" className={`text-[12px] ${dark ? "text-white/55" : "text-ink/55"}`}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {last ? <span aria-current="page" className={dark ? "text-white/85" : "text-ink/85"}>{item.name}</span> : <Link href={item.path} className="hover:text-brand">{item.name}</Link>}
              {!last && <span aria-hidden>/</span>}
            </li>
          );
        })}
      </ol>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </nav>
  );
}

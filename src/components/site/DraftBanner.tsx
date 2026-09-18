export function DraftBanner({ editHref }: { editHref: string }) {
  return (
    <div className="bg-amber-400 text-ink">
      <div className="container-x flex flex-wrap items-center justify-between gap-2 py-2 text-sm font-medium">
        <span>Draft preview — this content is not visible to the public.</span>
        <a href={editHref} className="underline underline-offset-4">Edit in admin</a>
      </div>
    </div>
  );
}

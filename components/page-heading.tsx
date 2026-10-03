import type { ReactNode } from "react";

/** Page title block from the Lovable prototype: small eyebrow, large serif title, optional actions. */
export function PageHeading({ eyebrow, title, children }: { eyebrow?: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end md:mb-10">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2 text-sm text-muted-foreground">{eyebrow}</div>}
        <h1 className="text-3xl leading-tight sm:text-4xl md:text-5xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

/** Section eyebrow + title (terracotta eyebrow, earth title), as in the Lovable profile page. */
export function SectionHeading({ eyebrow, title, id, aside }: { eyebrow: ReactNode; title: ReactNode; id?: string; aside?: ReactNode }) {
  return (
    <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-xs font-bold text-terracotta uppercase">{eyebrow}</p>
        <h2 id={id} className="mt-1 text-2xl text-earth sm:text-3xl dark:text-foreground">
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}

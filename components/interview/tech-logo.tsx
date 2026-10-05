import { Binary, Boxes, Cloud, Code2, Cpu, FlaskConical, Kanban, Layers, Monitor, Network, Plug, ShieldCheck, Sparkles } from "lucide-react";
import type { TechLogo as Logo } from "@/lib/interview/tech-logos";
import { cn } from "@/lib/utils";

// A technology's logo in a round badge: the brand mark (Simple Icons) in its colour, or a generic icon
// for notions without a logo. Display only.

const ICONS = {
  cloud: Cloud, network: Network, plug: Plug, cpu: Cpu, binary: Binary, boxes: Boxes, shield: ShieldCheck, flask: FlaskConical, kanban: Kanban, code: Code2,
  layers: Layers, sparkles: Sparkles, monitor: Monitor,
};

export function TechLogo({ logo, className }: { logo: Logo; className?: string }) {
  if (logo.kind === "brand") {
    // Very dark brand colours (Next.js, Rust…) would vanish on dark backgrounds: use the text colour.
    const dark = parseInt(logo.hex.slice(0, 2), 16) + parseInt(logo.hex.slice(2, 4), 16) + parseInt(logo.hex.slice(4, 6), 16) < 120;
    return (
      <span className={cn("grid size-12 shrink-0 place-items-center rounded-full bg-card shadow-soft", className)} aria-hidden="true">
        <svg viewBox="0 0 24 24" className="size-1/2" fill={dark ? "currentColor" : `#${logo.hex}`}>
          <path d={logo.path} />
        </svg>
      </span>
    );
  }
  const Icon = ICONS[logo.icon as keyof typeof ICONS] ?? Code2;
  return (
    <span className={cn("grid size-12 shrink-0 place-items-center rounded-full bg-card text-ink shadow-soft", className)} aria-hidden="true">
      <Icon className="size-1/2" />
    </span>
  );
}

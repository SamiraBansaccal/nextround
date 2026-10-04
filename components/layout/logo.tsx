import Image from "next/image";
import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} aria-label="NextRound home" className="inline-flex items-center">
      <Image
        src="/brand/nextround-logo.png"
        width={1108}
        height={258}
        alt="NextRound"
        priority
        className="h-8 w-auto max-w-[160px] object-contain dark:brightness-0 dark:invert"
      />
    </Link>
  );
}

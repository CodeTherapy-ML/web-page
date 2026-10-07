"use client";

import { useState } from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Team-member portrait with a built-in fallback: when no photo URL is set, or
 * the URL 404s, the slot renders the brand avatar placeholder (person glyph on
 * an azure-soft disc) instead of a broken image.
 *
 * Tracks which src errored, so pasting a corrected URL resets the fallback.
 */
export default function MemberAvatar({
  name,
  src,
  className,
  imgClassName,
  iconClassName,
}: {
  name: string;
  src?: string | null;
  className?: string;
  /** Applied to the <Image> — the About page passes its crop here. */
  imgClassName?: string;
  /** Sizes the placeholder glyph for larger wells. */
  iconClassName?: string;
}) {
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const show = src && brokenSrc !== src;

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-azure-soft",
        className,
      )}
    >
      {show ? (
        <Image
          src={src}
          alt={name || ""}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={cn("object-cover", imgClassName)}
          onError={() => setBrokenSrc(src)}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center"
          role="img"
          aria-label={name ? `${name} — photo placeholder` : "Photo placeholder"}
        >
          <UserRound
            className={cn("size-5 text-azure/50", iconClassName)}
            strokeWidth={1.5}
          />
        </span>
      )}
    </span>
  );
}

import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * The CodeTherapy logo — the script wordmark from `public/logo.jpeg`, split out
 * of its black field into two transparent PNGs:
 *
 *   wordmark-light.png  "Code" in ink  #0d1117  + "Therapy" in #00aeef
 *   wordmark-dark.png   "Code" in white        + "Therapy" in #00aeef
 *
 * The white half of the artwork disappears on a pale ground, so the `tone` prop
 * picks the variant rather than relying on a filter. Aspect is fixed by the
 * source artwork (180 × 49 at native size).
 *
 * Deliberately free of "use client" so server components can render it without
 * pulling the client navigation bundle along.
 */

const RATIO = 180 / 49

export default function BrandMark({
  size = 30,
  tone = "light",
  label = true,
  className,
}: {
  /** Height of the lockup in px (the wordmark's cap-to-descender box). */
  size?: number
  /** Which ground it sits on — `dark` keeps "Code" white. */
  tone?: "light" | "dark"
  /** `false` renders the square CT monogram tile instead of the wordmark. */
  label?: boolean
  className?: string
}) {
  if (!label) return <Monogram size={size} className={className} />

  return (
    <span
      className={cn("relative block shrink-0", className)}
      style={{ height: size, width: Math.round(size * RATIO) }}
    >
      <Image
        src={tone === "dark" ? "/brand/wordmark-dark.png" : "/brand/wordmark-light.png"}
        alt="CodeTherapy"
        fill
        sizes={`${Math.round(size * RATIO)}px`}
        className="object-contain object-left"
        priority
      />
    </span>
  )
}

/**
 * The square mark — the script "C" of *Code* and the "T" of *Therapy* lifted
 * from the logo itself, on the brand's black tile. Used as the app icon and
 * wherever CodeTherapy needs a byline avatar: at 28px the full wordmark is
 * unreadable, while the two letterforms still carry the brand.
 */
export function Monogram({
  size = 28,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn("relative block shrink-0 overflow-hidden rounded-full", className)}
      style={{ width: size, height: size }}
    >
      <Image src="/brand/monogram.png" alt="" fill sizes={`${size}px`} className="object-cover" />
    </span>
  )
}

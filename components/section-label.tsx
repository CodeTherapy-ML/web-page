import { cn } from "@/lib/utils";

/**
 * Dot + uppercase eyebrow used above every section heading in the v2 design.
 * `sm` is the 12px/0.18px variant (landing page); `md` is 14px/0.21px (interior pages).
 */
export default function SectionLabel({
  children,
  tone = "sage",
  size = "sm",
  className,
}: {
  children: React.ReactNode;
  /** Legacy keys kept because they are persisted on Post/Project rows:
   *  `sage` = azure, `clay` = navy. */
  tone?: "sage" | "clay";
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "size-2 shrink-0 rounded",
          tone === "sage" ? "bg-azure-bright" : "bg-navy",
        )}
      />
      <span
        className={cn(
          "font-bold uppercase",
          size === "sm"
            ? "text-xs tracking-[0.18px]"
            : "text-sm tracking-[0.21px]",
          tone === "sage" ? "text-azure" : "text-navy",
        )}
      >
        {children}
      </span>
    </div>
  );
}

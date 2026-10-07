import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/projects";

/**
 * `project-card` in Figma.
 * - `compact` — landing page: 220px image, 24px title, "Read more" only.
 * - `detailed` — projects index: 260px image, 26px title, hairline above the action.
 */
export default function ProjectCard({
  project,
  variant = "compact",
}: {
  project: Project;
  variant?: "compact" | "detailed";
}) {
  const detailed = variant === "detailed";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0px_12px_32px_0px_rgba(30,34,41,0.03)] transition-shadow hover:shadow-[0px_12px_32px_0px_rgba(30,34,41,0.1)]",
        detailed && "border border-line",
      )}
    >
      <div
        className={cn(
          "relative w-full shrink-0 overflow-hidden",
          detailed ? "h-[260px]" : "h-[220px]",
        )}
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "rounded px-[10px] py-1 text-[11px] font-bold uppercase",
              project.tagTone === "clay"
                ? "bg-navy-soft text-navy"
                : "bg-azure-soft text-azure",
            )}
          >
            {project.tag}
          </span>
          <span
            className={cn(
              "text-ink-soft opacity-60",
              detailed ? "text-[13px]" : "text-xs",
            )}
          >
            {project.date}
          </span>
        </div>

        <h3
          className={cn(
            "font-serif font-semibold text-ink",
            detailed ? "text-[26px]" : "text-2xl",
          )}
        >
          {project.title}
        </h3>

        <p className="text-sm leading-[1.5] text-ink-soft">
          {project.description}
        </p>

        {detailed ? (
          <div className="mt-auto flex flex-col gap-4">
            <span className="block h-px w-full bg-line" />
            <span className="flex items-center gap-1 text-[13px] font-semibold text-azure">
              Read more
              <ArrowRight className="size-[14px] transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        ) : (
          <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-semibold text-azure">
            Read more
            <ArrowRight className="size-[14px] transition-transform group-hover:translate-x-1" />
          </span>
        )}
      </div>
    </Link>
  );
}

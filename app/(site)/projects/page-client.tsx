"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import SectionLabel from "@/components/section-label";
import ProjectCard from "@/components/project-card";
import { projectFilters } from "@/lib/projects";
import { getPublishedProjects } from "@/lib/content-queries";
import { cn } from "@/lib/utils";

export default function ProjectsPage({
  projects,
}: {
  projects: Awaited<ReturnType<typeof getPublishedProjects>>;
}) {
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState("All");

  const visible = useMemo(
    () =>
      filter === "All" ? projects : projects.filter((p) => p.tag === filter),
    [filter],
  );

  return (
    <main className="bg-cream">
      {/* -------------------------------------------------- page header */}
      <section className="shell flex flex-col gap-6 pb-10 pt-20">
        <SectionLabel size="md">Our Work</SectionLabel>
        <h1 className="font-serif text-[38px] font-semibold text-ink md:text-[56px]">
          Research &amp; Projects
        </h1>
        <p className="max-w-[720px] text-[18px] leading-[1.6] text-ink-soft">
          Discover open-source, clinically-validated AI diagnostics designed to
          execute locally, built in continuous co-creation with health
          researchers globally.
        </p>
      </section>

      {/* ------------------------------------------------------- filters */}
      <section className="shell flex flex-wrap gap-3 pb-12">
        {projectFilters.map((chip) => {
          const active = chip === filter;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => setFilter(chip)}
              aria-pressed={active}
              className={cn(
                "rounded-[30px] border px-5 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "border-azure bg-azure text-white"
                  : "border-line bg-white text-ink-soft hover:border-azure hover:text-azure",
              )}
            >
              {chip}
            </button>
          );
        })}
      </section>

      {/* ------------------------------------------------------ projects */}
      <section className="shell pb-20">
        {visible.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((project) => (
                <motion.div
                  key={project.slug}
                  layout={!reduceMotion}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }
                  }
                  transition={{
                    duration: reduceMotion ? 0 : 0.24,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <ProjectCard project={project} variant="detailed" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <p className="rounded-2xl border border-line bg-white p-10 text-center text-ink-soft">
            No projects in this category yet — check back soon.
          </p>
        )}
      </section>

      {/* ----------------------------------------------------------- cta */}
      <section className="shell pb-20">
        <div className="flex flex-col items-center gap-8 rounded-3xl bg-navy-soft p-8 text-center md:p-16">
          <SectionLabel tone="clay" size="md">
            Collaboration
          </SectionLabel>
          <h2 className="max-w-[800px] font-serif text-[30px] font-semibold text-ink md:text-[40px]">
            Interested in collaborating on health research?
          </h2>
          <p className="max-w-[640px] text-base leading-[1.6] text-ink-soft">
            Our group partners with universities and clinical networks to
            thoroughly test, refine, and deliver secure open-source diagnostic
            systems.
          </p>
          <Link
            href="/contact"
            className="btn-v2 group border-navy bg-navy text-white hover:border-[#072b43] hover:bg-[#072b43]"
          >
            Propose a Collaboration
            <ArrowRight className="size-[14px] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  );
}

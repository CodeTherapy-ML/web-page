import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FileText } from "lucide-react";

import SectionLabel from "@/components/section-label";
import { Monogram } from "@/components/brand-mark";
import ProjectCard from "@/components/project-card";
import {
  bodyRender,
  getProjectBySlug,
  getPublishedProjects,
} from "@/lib/content-queries";
import { projectDetails } from "@/lib/projects";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: "Project not found — CodeTherapy" };
  return {
    title: `${project.title} — CodeTherapy`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [project, allProjects] = await Promise.all([
    getProjectBySlug(params.slug),
    getPublishedProjects(),
  ]);
  if (!project) notFound();

  const related = allProjects.filter((p) => p.slug !== project.slug);
  const details = projectDetails(project);
  const body = bodyRender(project.body);

  return (
    <main className="bg-cream">
      <div className="flex flex-col gap-12 pb-24 pt-14 shell">
        {/* ---------------------------------------------------- breadcrumb */}
        <Link
          href="/projects"
          className="self-start text-sm font-semibold text-azure hover:underline"
        >
          ← Back to Research
        </Link>

        {/* ------------------------------------------------ article header */}
        <header className="flex flex-col gap-6">
          <span
            className={cn(
              "self-start rounded-md py-1.5 pl-3.5 pr-2.5 text-xs font-bold uppercase",
              project.tagTone === "clay" ? "bg-navy-soft text-navy" : "bg-azure-soft text-azure",
            )}
          >
            {project.tag}
          </span>
          <h1 className="font-serif text-[34px] font-semibold leading-[1.15] text-ink md:text-[52px]">
            {project.headline}
          </h1>
          <div className="flex items-center gap-4">
            <Monogram />
            <p className="text-sm text-ink-soft">
              {project.byline} <span className="text-line">|</span>{" "}
              {project.publishedOn} <span className="text-line">|</span>{" "}
              {project.readTime}
            </p>
          </div>
        </header>

        {/* -------------------------------------------------- hero image */}
        <div className="relative h-[280px] w-full overflow-hidden rounded-3xl md:h-[480px]">
          <Image
            src={project.heroImage}
            alt={project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* --------------------------------------------- body + details */}
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="flex flex-1 flex-col gap-6">
            {body.html ? (
              <div
                className="flex flex-col gap-4 text-[17px] leading-[1.75] text-ink-soft [&_h1]:font-serif [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:text-ink [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink [&_ul]:list-disc [&_ul]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:border-azure [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:max-w-full [&_img]:rounded-xl [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-xl [&_video]:w-full [&_video]:rounded-xl [&_table]:w-full [&_table]:border-collapse [&_table]:my-2 [&_th]:border [&_th]:border-line [&_th]:bg-azure-soft [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_td]:border [&_td]:border-line [&_td]:px-3 [&_td]:py-1.5"
                dangerouslySetInnerHTML={{ __html: body.html }}
              />
            ) : (
              body.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="text-[17px] leading-[1.75] text-ink-soft"
                >
                  {paragraph}
                </p>
              ))
            )}

            {/* `publication-link` — only rendered for published work. */}
            {project.paperUrl && (
              <a
                href={project.paperUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 text-sm font-semibold text-azure transition-colors hover:text-ink"
              >
                <FileText className="size-4 shrink-0" />
                <span className="underline underline-offset-2">
                  Read the published paper: {project.paperJournal ?? "Published paper"} →
                </span>
              </a>
            )}
          </div>

          <aside className="w-full shrink-0 rounded-3xl border border-line bg-white p-8 drop-shadow-[0px_8px_12px_rgba(30,34,41,0.04)] lg:w-[380px]">
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Project Details
            </h2>
            <dl className="mt-6 flex flex-col gap-4">
              {details.map((detail, i) => (
                <div
                  key={detail.label}
                  className={cn(
                    "flex flex-col gap-1.5 pb-3",
                    i < details.length - 1 && "border-b border-line",
                  )}
                >
                  <dt className="text-xs font-bold uppercase text-ink-soft opacity-60">
                    {detail.label}
                  </dt>
                  <dd className="text-[15px] font-semibold text-ink">{detail.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        {/* ----------------------------------------------------- related */}
        <section className="flex flex-col gap-8 pt-12">
          <h2 className="font-serif text-[26px] font-semibold text-ink md:text-[32px]">
            Related Projects
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {related.map((item) => (
              <ProjectCard key={item.slug} project={item} />
            ))}
          </div>
        </section>

        {/* --------------------------------------------------------- cta */}
        <section className="flex flex-col items-center gap-8 rounded-3xl bg-azure-soft px-8 py-20 text-center md:px-16">
          <SectionLabel>Interested in this research?</SectionLabel>
          <h2 className="max-w-[843px] font-serif text-[34px] font-semibold leading-[1.15] text-ink md:text-[48px]">
            Let&rsquo;s co-create pathways for diagnostic equity.
          </h2>
          <p className="max-w-[843px] text-base leading-[1.6] text-ink-soft">
            We partner with medical practitioners, academic institutions, and funding groups to
            refine, validate, and deploy open-source healthcare technologies where they are needed
            most.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-ink">
              Get Involved
            </Link>
            <Link href="/contact" className="btn-outline-ink">
              Contact Our Team
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

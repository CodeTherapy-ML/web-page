import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import SectionLabel from "@/components/section-label";
import Reveal from "@/components/reveal";
import NewsletterForm from "@/components/newsletter-form";
import { getPublishedPosts } from "@/lib/content-queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "News & Insights — CodeTherapy",
  description:
    "Technical breakthroughs, clinical trial data from partner clinics, regional field updates, and open-source release notes.",
};

function CategoryPill({
  category,
  tone,
  className,
}: {
  category: string;
  tone: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded px-[10px] py-1 font-bold uppercase",
        tone === "clay" ? "bg-navy-soft text-navy" : "bg-azure-soft text-azure",
        className,
      )}
    >
      {category}
    </span>
  );
}

export const revalidate = 60;

export default async function BlogPage() {
  const all = await getPublishedPosts();
  const featuredPost = all[0] ?? null;
  const posts = all.slice(1);

  if (!featuredPost) {
    return (
      <main className="bg-cream">
        <div className="flex flex-col items-center gap-4 py-24 text-center shell">
          <h1 className="font-serif text-4xl font-semibold text-ink">News &amp; Insights</h1>
          <p className="text-ink-soft">No published articles yet — check back soon.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-cream">
      {/* -------------------------------------------------------- header */}
      <section className="shell flex flex-col gap-6 pb-12 pt-20">
        <SectionLabel tone="clay" size="md">
          From the Lab
        </SectionLabel>
        <h1 className="font-serif text-[40px] font-semibold leading-[1.1] text-ink md:text-[64px]">
          News &amp; Insights
        </h1>
        <p className="max-w-[720px] text-[18px] leading-[1.6] text-ink-soft">
          Deep dive into technical breakthroughs, clinical trial data from
          partner clinics, regional field updates, and our open-source release
          notes.
        </p>
      </section>

      {/* ------------------------------------------------------ featured */}
      <section className="shell pb-20">
        <Link
          href={`/blog/${featuredPost.slug}`}
          className="group flex flex-col items-center gap-10 rounded-2xl bg-white p-6 drop-shadow-[0px_12px_16px_rgba(30,34,41,0.02)] md:p-8 lg:flex-row"
        >
          <div className="relative h-[240px] w-full shrink-0 overflow-hidden rounded-xl md:h-[360px] lg:w-[600px]">
            <Image
              src={featuredPost.image}
              alt={featuredPost.title}
              fill
              priority
              sizes="(min-width: 1024px) 600px, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <div className="flex flex-1 flex-col gap-5">
            <div className="flex items-center gap-3">
              <CategoryPill
                category={featuredPost.category}
                tone={featuredPost.categoryTone}
                className="text-[11px]"
              />
              <span className="text-sm text-ink-soft opacity-60">
                {featuredPost.date}
              </span>
            </div>
            <h2 className="font-serif text-[28px] font-semibold leading-[1.2] text-ink md:text-[36px]">
              {featuredPost.title}
            </h2>
            <p className="text-[15px] leading-[1.6] text-ink-soft">
              {featuredPost.excerpt}
            </p>
            <span className="flex items-center gap-2 text-[15px] font-semibold text-azure">
              Read full article
              <ArrowRight className="size-[14px] transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </section>

      {/* --------------------------------------------------------- grid */}
      <section className="shell grid grid-cols-1 gap-8 pb-24 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <Reveal key={post.slug} delay={(i % 3) * 80}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex h-full flex-col gap-5 rounded-2xl bg-white p-6 drop-shadow-[0px_8px_12px_rgba(30,34,41,0.02)]"
            >
              <div className="relative h-[200px] w-full shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-center gap-3">
                <CategoryPill
                  category={post.category}
                  tone={post.categoryTone}
                  className="text-[10px]"
                />
                <span className="text-[13px] text-ink-soft opacity-60">
                  {post.date}
                </span>
              </div>
              <h2 className="font-serif text-[22px] font-semibold text-ink">
                {post.title}
              </h2>
              <p className="text-sm leading-[1.5] text-ink-soft">
                {post.excerpt}
              </p>
              <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-azure">
                Read more
                <ArrowRight className="size-[14px] transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        ))}
      </section>

      {/* --------------------------------------------------- newsletter */}
      <section className="bg-azure-soft">
        <div className="shell pb-32 pt-20">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-8 text-center md:p-12">
            <h2 className="font-serif text-[28px] font-semibold text-ink md:text-[36px]">
              Stay in the Loop
            </h2>
            <p className="max-w-[560px] text-base text-ink-soft">
              Subscribe to get immediate email alerts for open-source diagnostic
              updates, field trial findings, and technical research whitepapers.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </main>
  );
}

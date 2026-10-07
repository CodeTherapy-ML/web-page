import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import SectionLabel from "@/components/section-label";
import { Monogram } from "@/components/brand-mark";
import { bodyRender, getPostBySlug, getPublishedPosts } from "@/lib/content-queries";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Article not found — CodeTherapy" };
  return { title: `${post.title} — CodeTherapy`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, allPosts] = await Promise.all([
    getPostBySlug(params.slug),
    getPublishedPosts(),
  ]);
  if (!post) notFound();

  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const body = bodyRender(post.body);

  return (
    <main className="bg-cream">
      <article className="shell flex flex-col gap-12 pb-24 pt-14">
        <Link
          href="/blog"
          className="self-start text-sm font-semibold text-azure hover:underline"
        >
          ← Back to News
        </Link>

        <header className="flex flex-col gap-6">
          <span
            className={cn(
              "self-start rounded-md py-1.5 pl-3.5 pr-2.5 text-xs font-bold uppercase",
              post.categoryTone === "clay"
                ? "bg-navy-soft text-navy"
                : "bg-azure-soft text-azure",
            )}
          >
            {post.category}
          </span>
          <h1 className="max-w-[1000px] font-serif text-[34px] font-semibold leading-[1.15] text-ink md:text-[52px]">
            {post.title}
          </h1>
          <div className="flex items-center gap-4">
            <Monogram />
            <p className="text-sm text-ink-soft">
              CodeTherapy <span className="text-line">|</span> {post.date}
            </p>
          </div>
        </header>

        <div className="relative h-[280px] w-full overflow-hidden rounded-3xl md:h-[480px]">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="flex max-w-[820px] flex-col gap-6">
          <p className="text-[19px] leading-[1.7] text-ink">{post.excerpt}</p>
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
        </div>

        <section className="flex flex-col gap-8 border-t border-line pt-12">
          <h2 className="font-serif text-[26px] font-semibold text-ink md:text-[32px]">
            More from the Lab
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/blog/${item.slug}`}
                className="group flex flex-col gap-4 rounded-2xl bg-white p-6 drop-shadow-[0px_8px_12px_rgba(30,34,41,0.02)]"
              >
                <div className="relative h-[160px] w-full shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <span className="text-[13px] text-ink-soft opacity-60">
                  {item.date}
                </span>
                <h3 className="font-serif text-xl font-semibold text-ink group-hover:text-azure">
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-center gap-8 rounded-3xl bg-azure-soft px-8 py-20 text-center md:px-16">
          <SectionLabel>Collaboration</SectionLabel>
          <h2 className="max-w-[843px] font-serif text-[34px] font-semibold leading-[1.15] text-ink md:text-[48px]">
            Join us in transforming healthcare.
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-ink">
              Get Involved
            </Link>
            <Link href="/projects" className="btn-outline-ink">
              Explore Our Research
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}

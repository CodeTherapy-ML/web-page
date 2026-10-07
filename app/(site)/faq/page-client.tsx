"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";

import SectionLabel from "@/components/section-label";
import { cn } from "@/lib/utils";
import { faqList as faqs } from "@/lib/content";

type Faq = (typeof faqs)[number];
const withKeys = (f: { category: string; question: string; answer: string }) => ({
  category: f.category,
  q: f.question,
  a: f.answer,
});
const qa = faqs.map(withKeys);

const categories = [
  "All",
  "General",
  "Research",
  "Partnerships",
  "Careers",
  "Technical",
];

/**
 * Questions come from the `v2-faq-page` frame, where every row is drawn collapsed.
 * The answer copy is not in the Figma — it is drafted from the site's own
 * mission/partnership/ethics copy and should be reviewed before launch.
 */
export default function FaqPageClient({
  faqs,
}: {
  faqs: Awaited<ReturnType<typeof import("@/lib/content-queries").getPublishedFaqs>>;
}) {
  const reduceMotion = useReducedMotion();
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState<string | null>(faqs[0]?.question ?? null);

  const visible = useMemo(
    () =>
      category === "All" ? faqs : faqs.filter((f) => f.category === category),
    [category],
  );

  return (
    <main className="bg-cream">
      {/* -------------------------------------------------------- header */}
      <section className="shell flex flex-col gap-6 pb-12 pt-20">
        <SectionLabel tone="clay" size="md">
          Questions &amp; Answers
        </SectionLabel>
        <h1 className="font-serif text-[38px] font-semibold leading-[1.1] text-ink md:text-[64px]">
          Frequently Asked Questions
        </h1>
        <p className="max-w-[720px] text-[18px] leading-[1.6] text-ink-soft">
          Find detailed information regarding our open-source research
          methodologies, partnership validation programs, operational scale, and
          data security models.
        </p>
      </section>

      {/* ---------------------------------------------------- categories */}
      <section className="shell flex flex-wrap gap-3 pb-12">
        {categories.map((chip) => {
          const active = chip === category;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => setCategory(chip)}
              aria-pressed={active}
              className={cn(
                "rounded-[20px] border px-5 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "border-azure bg-azure text-white"
                  : "border-line bg-white text-ink hover:border-azure hover:text-azure",
              )}
            >
              {chip}
            </button>
          );
        })}
      </section>

      {/* ----------------------------------------------------- accordion */}
      <section className="shell flex flex-col gap-4 pb-20">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((faq) => {
            const isOpen = open === faq.question;
            return (
              <motion.div
                key={faq.id}
                layout={reduceMotion ? false : "position"}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.22,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-xl border border-line bg-white"
              >
                <h2>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : faq.question)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-6 text-left"
                  >
                    <span className="font-serif text-lg font-semibold text-ink md:text-[22px]">
                      {faq.question}
                    </span>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cream">
                      <Plus
                        className={cn(
                          "size-4 text-azure transition-transform duration-200",
                          isOpen && "rotate-45",
                        )}
                      />
                    </span>
                  </button>
                </h2>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={
                        reduceMotion
                          ? { opacity: 0 }
                          : { height: 0, opacity: 0 }
                      }
                      animate={
                        reduceMotion
                          ? { opacity: 1 }
                          : { height: "auto", opacity: 1 }
                      }
                      exit={
                        reduceMotion
                          ? { opacity: 0 }
                          : { height: 0, opacity: 0 }
                      }
                      transition={{
                        duration: reduceMotion ? 0 : 0.28,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[900px] px-6 pb-6 text-[15px] leading-[1.7] text-ink-soft">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </section>

      {/* ----------------------------------------------------------- cta */}
      <section className="shell pb-32 pt-20">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-azure-soft p-8 text-center md:p-16">
          <h2 className="font-serif text-[28px] font-semibold text-ink md:text-[36px]">
            Still Have Questions?
          </h2>
          <p className="max-w-[600px] text-base text-ink-soft">
            Can&rsquo;t find the answers you are looking for? Reach out directly
            to our global coordination team for detailed programmatic requests.
          </p>
          <Link href="/contact" className="btn-ink">
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}

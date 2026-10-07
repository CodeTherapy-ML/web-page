import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Book, Globe, Plus } from "lucide-react";

import SectionLabel from "@/components/section-label";
import Reveal from "@/components/reveal";
import { getPartners } from "@/lib/content-queries";

export const metadata: Metadata = {
  title: "Partnerships — CodeTherapy",
  description:
    "We partner with academic research institutions, public clinical networks, and global health foundations to co-create, validate, and scale diagnostic intelligence.",
};

const collaborationTypes = [
  {
    icon: Book,
    title: "Research Partners",
    body: "Collaborating with premium medical schools and clinical AI teams to validate algorithmic accuracy under challenging, low-bandwidth environments.",
  },
  {
    icon: Plus,
    title: "Clinical Partners",
    body: "Deploying our offline-first diagnostics directly into primary care clinics, testing real-world deployment on mobile devices.",
  },
  {
    icon: Globe,
    title: "Strategic Partners",
    body: "Connecting with non-profit health organizations and philanthropic foundations to fund, support, and scale open-source medical access.",
  },
];

const pathway = [
  {
    n: "01",
    title: "Reach Out",
    body: "Submit an inquiry detailing your research focus, local clinical needs, or available testing infrastructure.",
  },
  {
    n: "02",
    title: "Co-Design",
    body: "Collaborate directly with our clinical and AI specialists to structure validation protocols and custom offline deployment configurations.",
  },
  {
    n: "03",
    title: "Launch & Scale",
    body: "Integrate model architectures, evaluate accuracy, and deploy validated diagnostic systems directly to frontline clinics.",
  },
];

export const revalidate = 60;

export default async function PartnershipsPage() {
  const partners = await getPartners();
  return (
    <main className="bg-cream">
      {/* ---------------------------------------------------------- hero */}
      <section className="shell flex flex-col items-center gap-8 py-16 lg:flex-row lg:py-20">
        <div className="flex w-full flex-col gap-6 lg:w-1/2">
          <SectionLabel size="md">Collaboration</SectionLabel>
          <h1 className="font-serif text-[40px] font-semibold leading-[1.1] text-ink md:text-[60px]">
            Our Global Partnerships
          </h1>
          <p className="text-[18px] leading-[1.6] text-ink-soft">
            We partner with leading academic research institutions, public
            clinical networks, and global health foundations to co-create,
            validate, and scale diagnostic intelligence.
          </p>
          <Link href="/contact" className="btn-azure group self-start">
            Become a Partner
            <ArrowRight className="size-[14px] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="relative h-[300px] w-full shrink-0 overflow-hidden rounded-bl-[24px] rounded-br-[180px] rounded-tl-[180px] rounded-tr-[24px] md:h-[420px] lg:w-1/2">
          <Image
            src="/v2/partnerships-hero.png"
            alt="CodeTherapy partners collaborating in a clinical setting"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* -------------------------------------------- how we collaborate */}
      <section className="bg-azure-soft">
        <div className="shell flex flex-col gap-12 py-16 lg:py-20">
          <header className="flex flex-col items-center gap-4 text-center">
            <SectionLabel size="md">Ecosystem</SectionLabel>
            <h2 className="font-serif text-[32px] font-semibold text-ink md:text-[44px]">
              How We Collaborate
            </h2>
          </header>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {collaborationTypes.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-white p-8">
                  <span className="flex h-11 w-12 items-center justify-center rounded-xl bg-azure-soft">
                    <Icon className="size-5 text-azure" />
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-ink">
                    {title}
                  </h3>
                  <p className="text-sm leading-[1.5] text-ink-soft">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ partners */}
      <section className="shell flex flex-col gap-12 py-16 lg:py-20">
        <header className="flex flex-col items-center gap-4 text-center">
          <SectionLabel tone="clay" size="md">
            Our Network
          </SectionLabel>
          <h2 className="font-serif text-[32px] font-semibold text-ink md:text-[44px]">
            Collaborative Alliances
          </h2>
        </header>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner, i) => (
            <Reveal key={partner.name} delay={(i % 3) * 80}>
              <article className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-white p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-azure-soft font-serif text-base font-bold text-azure">
                      {partner.initial}
                    </span>
                    <h3 className="font-serif text-xl font-semibold text-ink">
                      {partner.name}
                    </h3>
                  </span>
                  <span className="shrink-0 text-sm text-ink-soft opacity-60">
                    {partner.region}
                  </span>
                </div>
                <span className="self-start rounded bg-navy-soft px-2 py-0.5 text-[11px] font-bold uppercase text-navy">
                  {partner.type}
                </span>
                <p className="text-sm leading-[1.5] text-ink-soft">
                  {partner.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------- testimonial */}
      <section className="border-y border-line bg-white">
        <div className="shell flex flex-col items-center gap-8 py-24 text-center">
          <p
            className="font-serif text-[72px] font-bold leading-[0.5] text-navy"
            aria-hidden
          >
            &ldquo;
          </p>
          <blockquote className="max-w-[1000px] font-serif text-[26px] font-normal leading-[1.4] text-ink md:text-[36px]">
            CodeTherapy&rsquo;s clinical co-creation model has drastically
            improved our ability to validate algorithms. Their deep commitment
            to health equity ensures the software is customized to our exact
            clinical workflow from day one.
          </blockquote>
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-base font-bold text-ink">Dr. Ngozi Okafor</p>
            <p className="text-sm text-ink-soft opacity-80">
              Director of Public Health Integrations, Pan-African Alliance
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- pathway */}
      <section className="shell flex flex-col gap-16 py-16 lg:py-20">
        <header className="flex flex-col items-center gap-4 text-center">
          <SectionLabel size="md">The Process</SectionLabel>
          <h2 className="font-serif text-[32px] font-semibold text-ink md:text-[44px]">
            The Pathway to Impact
          </h2>
        </header>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {pathway.map((step, i) => (
            <Reveal key={step.n} delay={i * 80}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-white p-7">
                <span className="flex size-10 items-center justify-center rounded-[20px] bg-azure-soft text-sm font-bold text-azure">
                  {step.n}
                </span>
                <h3 className="font-serif text-[22px] font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="text-sm leading-[1.5] text-ink-soft">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="flex justify-center">
          <Link href="/contact" className="btn-ink group">
            Start a Conversation
            <ArrowRight className="size-[14px] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  );
}

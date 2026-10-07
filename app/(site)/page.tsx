import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Cpu,
  Globe,
  MessageSquare,
  Play,
  Shield,
  Users,
} from "lucide-react";

import SectionLabel from "@/components/section-label";
import Reveal from "@/components/reveal";
import ProjectCard from "@/components/project-card";
import StatsBand from "@/components/stats-band";
import { getPublishedPosts, getPublishedProjects } from "@/lib/content-queries";
import { values } from "@/lib/site-content";

const partners = [
  "WHO",
  "Gates Foundation",
  "Johns Hopkins",
  "MIT",
  "Addis Ababa University",
];

const steps = [
  {
    n: "01",
    icon: MessageSquare,
    title: "Listen",
    body: "Frontline health workers identify clinical bottlenecks in their workflows.",
  },
  {
    n: "02",
    icon: Users,
    title: "Co-Create",
    body: "Solutions are designed side-by-side with local biomedical engineers.",
  },
  {
    n: "03",
    icon: Cpu,
    title: "Build",
    body: "Appropriate models are optimized to run offline on highly accessible, sub-$50 devices.",
  },
  {
    n: "04",
    icon: Globe,
    title: "Scale",
    body: "Open-source, thoroughly validated systems are deployed across partner regions.",
  },
];

export default async function HomePage() {
  const [projects, posts] = await Promise.all([getPublishedProjects(), getPublishedPosts()]);
  const news = posts.slice(0, 3).map((post) => ({
    date: post.date,
    title: post.title,
    body: post.excerpt,
  }));

  return (
    <main className="bg-cream">
      {/* ---------------------------------------------------------- hero */}
      <section className="shell flex flex-col gap-20 py-16 lg:py-20">
        <div className="flex flex-col items-center gap-8 lg:flex-row">
          <div className="flex w-full flex-col gap-8 lg:w-1/2">
            <SectionLabel className="enter">
              Advancing Health Equity Through AI
            </SectionLabel>
            <h1
              className="enter font-serif text-[40px] font-semibold leading-[1.1] text-ink md:text-[52px] lg:text-[64px]"
              style={{ animationDelay: "60ms" }}
            >
              Technology that reaches the last mile first.
            </h1>
            <p
              className="enter text-[18px] leading-[1.6] text-ink-soft"
              style={{ animationDelay: "120ms" }}
            >
              Pioneering open-source AI diagnostics designed for and with
              frontline health workers in underserved communities across Africa
              and globally. Co-founded by leading clinical researchers and AI
              scientists.
            </p>
            <div
              className="enter flex flex-wrap gap-4"
              style={{ animationDelay: "180ms" }}
            >
              <Link href="/projects" className="btn-azure">
                Explore Our Research
              </Link>
              <Link href="/about" className="btn-outline-ink">
                Watch Our Story
                <Play className="size-4" />
              </Link>
            </div>
          </div>

          <div className="relative h-[320px] w-full shrink-0 overflow-hidden rounded-bl-[24px] rounded-br-[180px] rounded-tl-[180px] rounded-tr-[24px] md:h-[480px] lg:w-1/2">
            <Image
              src="/v2/hero.png"
              alt="A health worker using a CodeTherapy diagnostic tool on a smartphone"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="hero-settle object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-line pt-10">
          <p className="text-[11px] font-semibold uppercase text-ink-soft opacity-60">
            Our Collaborative Network &amp; Partners
          </p>
          <div className="flex flex-wrap items-center justify-between gap-6">
            {partners.map((partner) => (
              <div key={partner} className="flex items-center gap-2 opacity-40">
                <Shield className="size-5 text-ink" />
                <span className="font-serif text-lg font-bold uppercase text-ink">
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- impact */}
      <StatsBand />

      {/* ------------------------------------------------------- mission */}
      <section className="shell flex flex-col items-center gap-12 py-24 lg:flex-row lg:gap-20 lg:py-32">
        <div className="relative h-[340px] w-full shrink-0 overflow-hidden rounded-bl-[200px] rounded-br-[24px] rounded-tl-[24px] rounded-tr-[200px] md:h-[500px] lg:w-1/2">
          <Image
            src="/v2/mission.png"
            alt="CodeTherapy researchers and clinicians collaborating in a meeting room"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex w-full flex-col gap-8 lg:w-1/2">
          <SectionLabel tone="clay">Our Purpose</SectionLabel>
          <h2 className="font-serif text-[34px] font-semibold leading-[1.15] text-ink md:text-[48px]">
            Where humanity guides technology.
          </h2>
          <p className="text-[17px] leading-[1.7] text-ink-soft">
            We believe high-quality healthcare is a fundamental human right, not
            a privilege. By co-creating robust, clinically-validated AI models
            with local researchers, we ensure that diagnostic advancements
            benefit primary health workers where they are needed most.
          </p>
          <Link
            href="/about"
            className="group flex items-center gap-2 text-[15px] font-semibold text-azure"
          >
            Learn Our Story
            <ArrowRight className="size-[18px] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------- implementation */}
      <section className="shell flex flex-col gap-20 py-24 lg:py-32">
        <header className="flex flex-col items-center gap-4 text-center">
          <SectionLabel>Implementation Model</SectionLabel>
          <h2 className="font-serif text-[32px] font-semibold text-ink md:text-[44px]">
            From Research to Real-World Impact
          </h2>
        </header>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ n, icon: Icon, title, body }, i) => (
            <Reveal key={n} delay={i * 80}>
              <div className="flex h-full flex-col gap-5 rounded-2xl border border-line bg-white p-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-[22px] bg-azure-soft">
                    <Icon className="size-5 text-azure" />
                  </span>
                  <span className="font-serif text-2xl font-bold text-navy opacity-80">
                    {n}
                  </span>
                </div>
                <h3 className="font-serif text-[22px] font-semibold text-ink">
                  {title}
                </h3>
                <p className="text-sm leading-[1.5] text-ink-soft">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ research */}
      <section className="border-t border-line">
        <div className="shell flex flex-col gap-16 py-24 lg:py-32">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="flex flex-col gap-4">
              <SectionLabel tone="clay">Latest Research</SectionLabel>
              <h2 className="font-serif text-[32px] font-semibold text-ink md:text-[44px]">
                Featured Projects
              </h2>
            </div>
            <Link href="/projects" className="btn-outline-ink">
              View All Projects
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <Reveal key={project.slug} delay={i * 80}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- testimonial */}
      <section className="shell flex flex-col items-center gap-8 py-24 text-center lg:py-32">
        <p
          className="font-serif text-[72px] font-bold leading-[0.5] text-navy"
          aria-hidden
        >
          &ldquo;
        </p>
        <blockquote className="max-w-[1061px] font-serif text-[26px] font-normal leading-[1.4] text-ink md:text-[36px]">
          CodeTherapy&rsquo;s diagnostic tool has revolutionized how we screen
          for malaria in rural clinics. What used to take hours of manual slides
          now takes minutes on a handheld device.
        </blockquote>
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-base font-bold text-ink">Dr. Mulugeta Bekele</p>
          <p className="text-sm text-ink-soft opacity-80">
            Clinical Research Lead, Addis Ababa University
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------- values */}
      <section className="bg-azure-soft">
        <div className="shell flex flex-col gap-16 py-24 lg:py-32">
          <header className="flex flex-col items-center gap-4 text-center">
            <SectionLabel>What Drives Us</SectionLabel>
            <h2 className="font-serif text-[32px] font-semibold text-ink md:text-[44px]">
              Our Core Ideals
            </h2>
          </header>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="flex h-full flex-col gap-4 rounded-2xl bg-white p-6 drop-shadow-[0px_12px_12px_rgba(77,109,83,0.03)]">
                  <span className="flex size-10 items-center justify-center rounded-[20px] bg-navy-soft">
                    <Icon className="size-[18px] text-navy" />
                  </span>
                  <h3 className="font-serif text-[22px] font-semibold text-ink">
                    {title}
                  </h3>
                  <p className="text-sm leading-[1.5] text-ink-soft">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- news */}
      <section className="border-t border-line">
        <div className="shell flex flex-col gap-16 py-24 lg:py-32">
          <header className="flex flex-col gap-4">
            <SectionLabel tone="clay">From the Lab</SectionLabel>
            <h2 className="font-serif text-[32px] font-semibold text-ink md:text-[44px]">
              Latest Updates
            </h2>
          </header>
          <div className="flex flex-col">
            {news.map((item) => (
              <Link
                key={item.title}
                href="/blog"
                className="group flex flex-col gap-4 border-b border-line py-8 sm:flex-row sm:items-start sm:gap-10"
              >
                <p className="w-[150px] shrink-0 text-sm font-bold text-navy">
                  {item.date}
                </p>
                <div className="flex flex-1 flex-col gap-2">
                  <h3 className="font-serif text-2xl font-semibold text-ink group-hover:text-azure">
                    {item.title}
                  </h3>
                  <p className="text-[15px] leading-[1.5] text-ink-soft">
                    {item.body}
                  </p>
                </div>
                <span className="p-2">
                  <ChevronRight className="size-5 text-ink-soft transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- cta */}
      <section className="shell py-24 lg:py-32">
        <div className="flex flex-col items-center gap-8 rounded-3xl bg-azure-soft px-8 py-20 text-center md:px-16">
          <SectionLabel>Collaboration</SectionLabel>
          <h2 className="max-w-[843px] font-serif text-[34px] font-semibold leading-[1.15] text-ink md:text-[48px]">
            Join us in transforming healthcare.
          </h2>
          <p className="max-w-[843px] text-base leading-[1.6] text-ink-soft">
            Whether you are an AI researcher, medical practitioner, or funding
            institution, we can co-create pathways that bring appropriate
            diagnostic tools directly to the communities that need them most.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-ink">
              Get Involved
            </Link>
            <Link href="/contact" className="btn-outline-ink">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

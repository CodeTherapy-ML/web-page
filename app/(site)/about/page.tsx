import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"

import SectionLabel from "@/components/section-label"
import Reveal from "@/components/reveal"
import StatsBand from "@/components/stats-band"
import MemberAvatar from "@/components/member-avatar"
import { values } from "@/lib/site-content"
import { getTeamMembers } from "@/lib/content-queries"
import { teamMembers as team } from "@/lib/content"

export const metadata: Metadata = {
  title: "About — CodeTherapy",
  description:
    "Where humanity guides technology. The story, mission and global collective behind CodeTherapy.",
}

export const revalidate = 60;

export default async function AboutPage() {
  const team = await getTeamMembers();
  return (
    <main className="bg-cream">
      {/* ---------------------------------------------------------- hero */}
      <section className="flex flex-col items-center gap-12 py-16 shell lg:py-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <SectionLabel size="md">Our Story</SectionLabel>
          <h1 className="max-w-[900px] font-serif text-[40px] font-semibold leading-[1.1] text-ink md:text-[52px] lg:text-[64px]">
            Where Humanity Guides Technology
          </h1>
        </div>
        <div className="relative h-[320px] w-full overflow-hidden rounded-bl-[24px] rounded-br-[180px] rounded-tl-[180px] rounded-tr-[24px] md:h-[480px]">
          <Image
            src="/about-hero.png"
            alt="The CodeTherapy team at work"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* -------------------------------------------------- origin story */}
      <section className="flex flex-col items-center gap-12 pt-16 pb-24 shell lg:flex-row lg:gap-20 lg:pb-32">
        <div className="flex flex-col w-full gap-6 lg:w-1/2">
          <SectionLabel tone="clay" size="md">The Catalyst</SectionLabel>
          <h2 className="font-serif text-[30px] font-semibold leading-[1.2] text-ink md:text-[40px]">
            A preventable journey that changed everything.
          </h2>
          <Reveal className="text-base leading-[1.7] text-ink-soft">
            In 2019, while working with the World Health Organization in West Africa, Dr. Amara Diallo
            met Fatou. Heavily pregnant and facing severe complications, Fatou had walked over 50
            kilometers in the blistering heat to reach the nearest regional clinic.
          </Reveal>
          <Reveal delay={120} className="text-base leading-[1.7] text-ink-soft">
            Tragically, she arrived too late. Her complications were common, predictable, and
            completely manageable with early, localized ultrasound detection.
          </Reveal>
          <Reveal delay={240} className="text-base leading-[1.7] text-ink-soft">
            That evening, deeply shaken, Amara called her colleague and computational scientist,
            Shuaibu Shehu: &ldquo;We are designing incredible systems for massive hospitals, but the
            technology is simply not reaching the last mile. We need to flip the paradigm.&rdquo; Six
            months later, CodeTherapy was born.
          </Reveal>
        </div>

        <div className="flex flex-col w-full gap-4 lg:w-1/2">
          <div className="relative h-[300px] w-full overflow-hidden rounded-bl-[200px] rounded-br-[24px] rounded-tl-[24px] rounded-tr-[200px] md:h-[440px]">
            <Image
              src="/v2/about-origin.png"
              alt="Building the first CodeTherapy prototype in Bamako, 2020"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <p className="text-[13px] font-semibold text-ink-soft opacity-60">
            Building our first prototype, Bamako 2020.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------- mission / vision */}
      <section className="grid grid-cols-1 gap-8 py-16 shell lg:grid-cols-2 lg:py-20">
        <div className="flex flex-col gap-5 p-10 rounded-3xl bg-azure-soft">
          <SectionLabel size="md">Our Mission</SectionLabel>
          <h2 className="font-serif text-[26px] font-semibold text-ink md:text-[32px]">
            Harnessing AI for global health equity.
          </h2>
          <p className="text-base leading-[1.6] text-ink-soft">
            We are dedicated to building robust, clinically-validated diagnostic systems that run
            locally, ensuring world-class medical intelligence is present in every low-resource clinic
            across the globe.
          </p>
        </div>
        <div className="flex flex-col gap-5 p-10 rounded-3xl bg-navy-soft">
          <SectionLabel tone="clay" size="md">Our Vision</SectionLabel>
          <h2 className="font-serif text-[26px] font-semibold text-ink md:text-[32px]">
            A world where geography doesn&rsquo;t dictate care.
          </h2>
          <p className="text-base leading-[1.6] text-ink-soft">
            We envision an open healthcare ecosystem where advanced tools are shared freely,
            empowering frontline workers to make precise, early interventions regardless of their
            location or infrastructure.
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------- values */}
      <section className="flex flex-col gap-12 py-16 shell lg:py-20">
        <header className="flex flex-col items-center gap-4 text-center">
          <SectionLabel size="md">What Drives Us</SectionLabel>
          <h2 className="font-serif text-[32px] font-semibold text-ink md:text-[44px]">
            Our Core Ideals
          </h2>
        </header>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="flex flex-col h-full gap-4 bg-white border rounded-2xl border-line p-7">
                <span className="flex size-11 items-center justify-center rounded-[22px] bg-navy-soft">
                  <Icon className="size-5 text-navy" />
                </span>
                <h3 className="font-serif text-[22px] font-semibold text-ink">{title}</h3>
                <p className="text-sm leading-[1.5] text-ink-soft">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- team */}
      <section className="flex flex-col gap-12 py-16 shell lg:py-20">
        <header className="flex flex-col items-center gap-4 text-center">
          <SectionLabel size="md">The Team</SectionLabel>
          <h2 className="font-serif text-[32px] font-semibold text-ink md:text-[44px]">
            Our Global Collective
          </h2>
        </header>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, i) => (
            <Reveal key={member.name} delay={(i % 3) * 80}>
              <article className="flex flex-col h-full overflow-hidden bg-white border rounded-2xl border-line">
                {/*
                  A square well is the shape a headshot is already close to, so it
                  fills edge to edge with almost nothing lost: a 1:1 portrait keeps
                  every pixel, and a typical 4:5 loses ~9% off the bottom. The crop
                  sits high so the trim always comes off the chest, never the face.
                  Wide environmental shots give up side background instead.
                */}
                <MemberAvatar
                  name={member.name}
                  src={member.photo}
                  className="aspect-square w-full shrink-0 border-b border-line"
                  imgClassName="object-[center_25%]"
                  iconClassName="size-16 text-azure/40"
                />
                <div className="flex flex-col gap-2 px-5 pt-5 pb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl font-semibold text-ink">{member.name}</h3>
                    <span className="text-lg leading-none">{member.flag}</span>
                  </div>
                  <p className="text-[13px] font-semibold uppercase text-azure">{member.role}</p>
                  <p className="text-[13px] leading-[1.4] text-ink-soft">{member.bio}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- impact */}
      <StatsBand />

      {/* ----------------------------------------------------------- cta */}
      <section className="py-16 shell lg:py-20">
        <div className="flex flex-col items-center gap-8 px-8 py-20 text-center rounded-3xl bg-azure-soft md:px-16">
          <SectionLabel size="md">Get Involved</SectionLabel>
          <h2 className="max-w-[800px] font-serif text-[34px] font-semibold leading-[1.15] text-ink md:text-[48px]">
            Join our mission to democratize healthcare.
          </h2>
          <p className="max-w-[700px] text-base leading-[1.6] text-ink-soft">
            We&rsquo;re always seeking collaborators, research institutions, and medical workers
            passionate about expanding localized AI solutions. Let&rsquo;s make an impact together.
          </p>
          <Link href="/contact" className="btn-ink group">
            Start a Conversation
            <ArrowRight className="size-[14px] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  )
}

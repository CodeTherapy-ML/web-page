import Reveal from "@/components/reveal";
import { stats } from "@/lib/site-content";

/** `impact-section` in Figma — four white stat boxes on a hairline-bounded band. */
export default function StatsBand() {
  return (
    <section className="border-y border-line">
      <div className="shell grid grid-cols-1 gap-8 py-24 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 80}>
            <div className="flex h-full flex-col gap-4 rounded-2xl bg-white p-6 drop-shadow-[0px_8px_12px_rgba(11,60,93,0.06)]">
              <p className="font-serif text-[52px] font-bold leading-none text-azure">
                {stat.value}
              </p>
              <span className="stat-rule block h-0.5 w-10 bg-azure-bright" />
              <p className="text-sm font-semibold text-ink">{stat.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

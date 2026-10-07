"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Github, Globe, Linkedin, MapPin, Twitter } from "lucide-react";

import SectionLabel from "@/components/section-label";
import { useToast } from "@/components/ui/use-toast";
import { submitContact } from "./actions";

const inquiryTypes = [
  "Research Collaboration",
  "Clinical Deployment",
  "Funding & Philanthropy",
  "Careers & Fellowships",
  "Media & Press",
  "Something Else",
];

const offices = [
  { label: "Bamako, Mali (Headquarters)", primary: true },
  { label: "Addis Ababa, Ethiopia", primary: false },
  { label: "Lagos, Nigeria", primary: false },
];

const socials = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Github, href: "https://github.com/CodeTherapy-ML", label: "GitHub" },
];

const quickAnswers = [
  {
    q: "What is your typical response window?",
    a: "For direct form submissions, clinical research and engineering team members strive to respond within 48 business hours.",
  },
  {
    q: "How do we pitch a partnership program?",
    a: "Simply outline your clinical workflow challenges and geographical scope via the inquiry dropdown above to get routed directly.",
  },
  {
    q: "Looking for academic and career roles?",
    a: "All active residency, fellowship, and core developer postings are updated weekly on our LinkedIn organizational channel.",
  },
];

const fieldClass =
  "h-12 w-full rounded-lg border border-line bg-cream px-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-azure";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-azure w-full disabled:opacity-60">
      {pending ? "Sending…" : "Send Message"}
    </button>
  );
}

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    inquiry: inquiryTypes[0],
    message: "",
  });

  const [state, formAction] = useFormState(submitContact, { ok: true, emailed: false });

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <main className="bg-cream">
      {/* ---------------------------------------------------------- hero */}
      <section className="flex flex-col gap-6 pb-16 pt-20 shell">
        <SectionLabel tone="clay" size="md">
          Connect With Us
        </SectionLabel>
        <h1 className="max-w-[800px] font-serif text-[40px] font-semibold leading-[1.1] text-ink md:text-[64px]">
          Let&rsquo;s Build Something Together
        </h1>
        <p className="max-w-[720px] text-[18px] leading-[1.6] text-ink-soft">
          We welcome inquiries from global clinical research teams, local health
          ministries, biomedical innovators, and developers eager to collaborate
          on ethical AI solutions at the front lines of care.
        </p>
      </section>

      {/* -------------------------------------------------- form + panel */}
      <section className="flex flex-col gap-16 pb-24 shell lg:flex-row">
        <div className="flex-1 rounded-2xl bg-white p-6 drop-shadow-[0px_8px_12px_rgba(30,34,41,0.04)] md:p-10">
          <h2 className="font-serif text-[28px] font-semibold text-ink">
            Send a Message
          </h2>

          <form
            action={async (fd) => {
              formAction(fd);
              const res = await submitContact(state, fd);
              if (res.ok) {
                toast({
                  title: "Message sent",
                  description: res.emailed
                    ? "Thank you — our team will get back to you within 48 business hours."
                    : "Thank you — your message has been received.",
                });
                setForm({
                  name: "",
                  email: "",
                  organization: "",
                  inquiry: inquiryTypes[0],
                  message: "",
                });
              } else {
                toast({
                  title: "Message could not be sent",
                  description: res.error,
                  variant: "destructive",
                });
              }
            }}
            className="mt-6 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <label className="flex flex-1 flex-col gap-2">
                <span className="text-[13px] font-semibold text-ink">Full Name</span>
                <input
                  required
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={(e) => update("name")(e.target.value)}
                  placeholder="e.g. Dr. Amara Diallo"
                  className={fieldClass}
                />
              </label>
              <label className="flex flex-1 flex-col gap-2">
                <span className="text-[13px] font-semibold text-ink">Email Address</span>
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => update("email")(e.target.value)}
                  placeholder="e.g. amara@clinic.org"
                  className={fieldClass}
                />
              </label>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <label className="flex flex-1 flex-col gap-2">
                <span className="text-[13px] font-semibold text-ink">Organization</span>
                <input
                  type="text"
                  name="organization"
                  value={form.organization}
                  onChange={(e) => update("organization")(e.target.value)}
                  placeholder="e.g. West African Health Union"
                  className={fieldClass}
                />
              </label>
              <label className="flex flex-1 flex-col gap-2">
                <span className="text-[13px] font-semibold text-ink">How Can We Help?</span>
                <select
                  name="inquiry"
                  value={form.inquiry}
                  onChange={(e) => update("inquiry")(e.target.value)}
                  className={`${fieldClass} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="%23454d49" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,6 8,10 12,6"/></svg>')] bg-[right_1rem_center] bg-no-repeat`}
                >
                  {inquiryTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-ink">Message</span>
              <textarea
                required
                rows={5}
                name="message"
                value={form.message}
                onChange={(e) => update("message")(e.target.value)}
                placeholder="Tell us about your project, clinical context, or research goals..."
                className="min-h-[120px] w-full resize-y rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-azure"
              />
            </label>

            <SubmitButton />
          </form>
        </div>

        <div className="flex w-full flex-col gap-8 lg:w-[516px] lg:shrink-0">
          <div className="flex flex-col gap-7 rounded-2xl bg-azure-soft p-8">
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-bold uppercase text-azure">Email Inquiry</p>
              <a
                href="mailto:contact@codetherapy.ml"
                className="font-serif text-[22px] font-semibold text-ink hover:underline"
              >
                contact@codetherapy.ml
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold uppercase text-azure">Our Main Offices &amp; Presence</p>
              <ul className="flex flex-col gap-2">
                {offices.map((office) => (
                  <li key={office.label} className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0 text-azure" />
                    <span
                      className={
                        office.primary
                          ? "text-sm font-semibold text-ink"
                          : "text-sm text-ink-soft"
                      }
                    >
                      {office.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-bold uppercase text-azure">Office Hours</p>
              <p className="text-sm text-ink-soft">Monday – Friday, 9:00 AM – 6:00 PM WAT</p>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold uppercase text-azure">Follow Our Progress</p>
              <div className="flex gap-3">
                {socials.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex size-9 items-center justify-center rounded-[18px] bg-white text-azure transition-colors hover:text-ink"
                  >
                    <Icon className="size-[18px]" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex h-[180px] flex-col items-center justify-center gap-4 rounded-2xl bg-azure-soft p-6">
            <Globe className="size-11 text-azure" strokeWidth={1.5} />
            <p className="text-[13px] font-semibold text-ink">
              Mali • Ethiopia • Nigeria Locations
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- quick answers */}
      <section className="border-t border-line">
        <div className="flex flex-col gap-12 pb-24 pt-20 shell">
          <h2 className="font-serif text-[28px] font-semibold text-ink md:text-[36px]">
            Quick Answers
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {quickAnswers.map((item) => (
              <div key={item.q} className="flex flex-col gap-4 rounded-xl bg-white p-6">
                <h3 className="font-serif text-xl font-semibold text-navy">{item.q}</h3>
                <p className="text-sm leading-[1.5] text-ink-soft">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

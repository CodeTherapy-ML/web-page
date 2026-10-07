"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useToast } from "@/components/ui/use-toast";
import { submitNewsletter } from "@/app/(site)/contact/actions";

/** `newsletter-box` input + pill button from the v2 blog page. */
export default function NewsletterForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData();
    formData.append("email", email);

    const result = await submitNewsletter({ ok: true, emailed: false }, formData);
    setPending(false);

    if (result.ok) {
      toast({
        title: "You're subscribed",
        description: result.emailed
          ? "We'll send research updates straight to your inbox."
          : "You're on the list — research updates will arrive once email is configured.",
      });
      setEmail("");
    } else {
      toast({
        title: "Subscription failed",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-[500px] flex-col gap-4 sm:flex-row sm:items-center"
    >
      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        aria-label="Email address"
        className="h-12 flex-1 rounded-[30px] border border-line bg-cream px-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-azure"
      />
      <button type="submit" disabled={pending} className="btn-azure shrink-0 disabled:opacity-60">
        {pending ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import BrandMark from "@/components/brand-mark";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign in — CodeTherapy Admin",
  robots: { index: false, follow: false },
};

/**
 * `cms-admin-login` — split screen: dark Geist branding panel (left) and the
 * credentials form (right).
 *
 * Lives in its own route group ((auth)) OUTSIDE the (portal) shell layout —
 * the shell's requireAdmin() would otherwise redirect this page back to itself.
 * Already-signed-in visitors go straight to the dashboard.
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-screen bg-white font-admin">
      {/* ------------------------------------------------ left branding panel */}
      <div className="relative hidden w-[648px] shrink-0 overflow-hidden bg-ink-deep lg:flex">
        {/* decorative 2px brand-cyan dot grid at ~7% opacity, per the design */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #00aeef 1px, transparent 1px)",
            backgroundSize: "72px 50px",
          }}
        />
        <div className="flex w-full flex-col items-center justify-between px-10 py-16">
          <span className="size-px" />
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center gap-3">
              <BrandMark size={44} tone="dark" />
              <span className="font-geist-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-azure-bright">
                Admin Portal
              </span>
            </div>
          </div>
          <div className="w-full">
            <span className="mb-3 block h-px w-full bg-white/10" />
            <p className="font-geist text-[13px] leading-[1.5] text-[#8aa0b0]">
              Building resilient clinical diagnostics for the last mile.
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------- right form panel */}
      <div className="flex min-w-0 flex-1 items-center justify-center px-8 py-20 lg:px-16">
        <LoginForm next={searchParams.next} />
      </div>
    </div>
  );
}

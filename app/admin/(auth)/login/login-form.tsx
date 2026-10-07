"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Eye, EyeOff, XCircle } from "lucide-react";
import { signIn } from "@/app/admin/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center rounded-lg bg-admin-azure text-sm font-semibold text-white transition-colors hover:bg-azure-deep disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign In"}
    </button>
  );
}

const fieldClass =
  "h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-[#7d8c99] focus:border-admin-azure";

export default function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useFormState(signIn, { error: null });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  return (
    <form action={formAction} className="flex w-full max-w-[440px] flex-col gap-6">
      <input type="hidden" name="next" value={next ?? "/admin"} />

      <header className="flex flex-col gap-2">
        <h1 className="font-geist text-[32px] font-bold text-[#0d1117]">
          Welcome back
        </h1>
        <p className="text-[15px] text-[#4b5563]">
          Sign in to your CodeTherapy admin account
        </p>
      </header>

      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-[#0d1117]">
            Email Address
          </span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@codetherapy.ml"
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-[#0d1117]">
            Password
          </span>
          <span className="relative block">
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className={`${fieldClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ink"
            >
              {showPassword ? (
                <Eye className="size-[18px]" />
              ) : (
                <EyeOff className="size-[18px]" />
              )}
            </button>
          </span>
        </label>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-4 rounded border-gray-300 accent-admin-azure"
            />
            <span className="text-[13px] text-[#4b5563]">Remember me</span>
          </label>
          <button
            type="button"
            className="text-[13px] font-medium text-admin-azure hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {state.error && (
          <p role="alert" className="text-[13px] font-semibold text-red-600">
            {state.error}
          </p>
        )}

        <SubmitButton />
      </div>

      <footer className="flex items-center justify-center gap-1.5 pt-2">
        <XCircle className="size-3 text-[#7d8c99]" />
        <p className="font-geist-mono text-[11px] text-[#7d8c99]">
          Protected by 2FA · Need help? Contact IT support
        </p>
      </footer>
    </form>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

import BrandMark from "@/components/brand-mark";
import { projects } from "@/lib/projects";
import { cn } from "@/lib/utils";

export const navLinks = [
  { label: "Research", href: "/projects", panel: true },
  { label: "Partnerships", href: "/partnerships", panel: false },
  { label: "About", href: "/about", panel: false },
  { label: "News", href: "/blog", panel: false },
  { label: "FAQ", href: "/faq", panel: false },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure focus-visible:ring-offset-4 focus-visible:ring-offset-cream rounded-sm";

/**
 * Research disclosure. Surfaces each programme's location and clinical stage —
 * facts that otherwise only appear on the detail pages.
 */
function ResearchPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="w-[600px] overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-[0_16px_40px_rgba(30,34,41,0.10)]">
      <p className="px-4 pb-2 pt-3 text-[11px] font-bold uppercase tracking-[0.18px] text-ink-soft/60">
        Active programs
      </p>

      {projects.map((project) => (
        <Link
          key={project.slug}
          href={`/projects/${project.slug}`}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-cream",
            focusRing,
          )}
        >
          <span className="flex-1">
            <span className="block font-serif text-[17px] font-semibold text-ink">
              {project.title}
            </span>
            <span className="mt-0.5 block text-[13px] text-ink-soft">
              {project.location}
            </span>
          </span>
          <span
            className={cn(
              "shrink-0 text-[11px] font-bold uppercase tracking-[0.18px]",
              project.statusTone === "clay" ? "text-navy" : "text-azure",
            )}
          >
            {project.status}
          </span>
        </Link>
      ))}

      <div className="mt-1 flex items-center justify-between gap-4 border-t border-line px-4 pb-3 pt-3">
        <span className="text-[13px] text-ink-soft">
          Every model is open-source and publicly auditable
        </span>
        <Link
          href="/projects"
          onClick={onNavigate}
          className={cn(
            "group flex shrink-0 items-center gap-1 text-[13px] font-semibold text-azure",
            focusRing,
          )}
        >
          All research
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileResearchOpen, setMobileResearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  // Hairline + condensed height appear only once the page has moved.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Route change closes everything.
  useEffect(() => {
    setPanelOpen(false);
    setMenuOpen(false);
    setMobileResearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setPanelOpen(false);
      setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Lock the page behind the mobile sheet.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const openPanel = () => {
    clearTimeout(closeTimer.current);
    setPanelOpen(true);
  };
  const schedulePanelClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setPanelOpen(false), 120);
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-cream transition-shadow duration-300",
        scrolled ? "border-b border-line" : "border-b border-transparent",
      )}
    >
      <div
        className={cn(
          "shell flex items-center justify-between transition-[height] duration-300 ease-out",
          scrolled ? "h-16" : "h-[88px]",
        )}
      >
        <Link href="/" aria-label="CodeTherapy home" className={focusRing}>
          <BrandMark size={scrolled ? 26 : 30} />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={link.panel ? openPanel : undefined}
                onMouseLeave={link.panel ? schedulePanelClose : undefined}
              >
                <Link
                  href={link.href}
                  aria-haspopup={link.panel || undefined}
                  aria-expanded={link.panel ? panelOpen : undefined}
                  onFocus={link.panel ? openPanel : undefined}
                  className={cn(
                    "relative block py-1 text-[15px] transition-colors",
                    active
                      ? "font-bold text-azure"
                      : "font-medium text-ink-soft hover:text-azure",
                    focusRing,
                  )}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-azure"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 34 }
                      }
                    />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        <Link
          href="/contact"
          className={cn("btn-azure hidden md:inline-flex", focusRing)}
        >
          Get Involved
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className={cn("text-ink md:hidden", focusRing)}
        >
          <Menu className="size-6" />
        </button>
      </div>

      {/* -------------------------------------------------- research panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
            onMouseEnter={openPanel}
            onMouseLeave={schedulePanelClose}
            className="absolute left-0 top-full hidden w-full md:block"
          >
            <div className="shell pt-2">
              <ResearchPanel onNavigate={() => setPanelOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- mobile sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-cream md:hidden"
          >
            <div className="shell flex h-[88px] shrink-0 items-center justify-between">
              <BrandMark size={28} />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className={cn("text-ink", focusRing)}
              >
                <X className="size-6" />
              </button>
            </div>

            <nav className="shell flex flex-1 flex-col gap-1 overflow-y-auto pb-10">
              {navLinks.map((link) =>
                link.panel ? (
                  <div key={link.href} className="border-b border-line py-2">
                    <div className="flex items-center justify-between">
                      <Link
                        href={link.href}
                        className={cn(
                          "py-2 font-serif text-2xl font-semibold",
                          isActive(link.href) ? "text-azure" : "text-ink",
                          focusRing,
                        )}
                      >
                        {link.label}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setMobileResearchOpen((v) => !v)}
                        aria-label={
                          mobileResearchOpen
                            ? "Hide research programs"
                            : "Show research programs"
                        }
                        aria-expanded={mobileResearchOpen}
                        className={cn(
                          "flex size-9 items-center justify-center rounded-full bg-white",
                          focusRing,
                        )}
                      >
                        <span
                          className={cn(
                            "block text-lg leading-none text-azure transition-transform duration-200",
                            mobileResearchOpen && "rotate-45",
                          )}
                        >
                          +
                        </span>
                      </button>
                    </div>

                    {mobileResearchOpen && (
                      <ul className="flex flex-col gap-3 pb-3 pl-1 pt-2">
                        {projects.map((project) => (
                          <li key={project.slug}>
                            <Link
                              href={`/projects/${project.slug}`}
                              className={cn("block", focusRing)}
                            >
                              <span className="block text-[15px] font-semibold text-ink">
                                {project.title}
                              </span>
                              <span className="mt-0.5 flex items-center gap-2 text-[13px] text-ink-soft">
                                {project.location}
                                <span
                                  className={cn(
                                    "text-[11px] font-bold uppercase",
                                    project.statusTone === "clay"
                                      ? "text-navy"
                                      : "text-azure",
                                  )}
                                >
                                  {project.status}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "border-b border-line py-4 font-serif text-2xl font-semibold",
                      isActive(link.href) ? "text-azure" : "text-ink",
                      focusRing,
                    )}
                  >
                    {link.label}
                  </Link>
                ),
              )}

              <Link
                href="/contact"
                className={cn("btn-azure mt-8 self-start", focusRing)}
              >
                Get Involved
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

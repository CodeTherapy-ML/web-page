import Link from "next/link";
import BrandMark from "@/components/brand-mark";

const footerColumns = [
  {
    title: "Research",
    links: [
      { label: "Diagnostic Models", href: "/projects" },
      { label: "Clinical Trials", href: "/projects" },
      { label: "Open Source Tools", href: "/projects" },
      { label: "Publications", href: "/blog" },
    ],
  },
  {
    title: "Organization",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Team", href: "/about" },
      { label: "Core Values", href: "/about" },
      { label: "Careers", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Whitepapers", href: "/blog" },
      { label: "Datasets", href: "/projects" },
      { label: "Tutorials", href: "/blog" },
      { label: "Community Forum", href: "/contact" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Email Updates", href: "/contact" },
      { label: "Twitter / X", href: "https://twitter.com" },
      { label: "LinkedIn", href: "https://linkedin.com" },
      { label: "GitHub", href: "https://github.com/CodeTherapy-ML" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-ink-deep">
      <div className="shell flex flex-col gap-16 pb-12 pt-24">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-8">
          <div className="flex w-full max-w-[405px] flex-col gap-6">
            <BrandMark size={30} tone="dark" />
            <p className="text-sm leading-[1.6] text-[#c3d2dd] opacity-80">
              Developing globally trusted, clinically sound artificial
              intelligence diagnostics with a specific dedication to health
              equity across Africa and remote regions.
            </p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-8 lg:grid-cols-4">
            {footerColumns.map((col) => (
              <div key={col.title} className="flex flex-col gap-5">
                <p className="text-xs font-bold uppercase text-white">
                  {col.title}
                </p>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#c3d2dd] opacity-70 transition-opacity hover:opacity-100"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#45586a] pt-8 text-[13px] text-[#8aa0b0] sm:flex-row sm:items-start sm:justify-between">
          <p>© 2026 CodeTherapy Research Group. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#c3d2dd]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#c3d2dd]">
              Terms of Use
            </Link>
            <Link href="/license" className="hover:text-[#c3d2dd]">
              Open-Source License
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

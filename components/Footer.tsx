import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const columns = {
  Marketplace: [
    { label: "Browse tasks", href: "/tasks" },
    { label: "Post a task", href: "/post" },
    { label: "Become a freelancer", href: "/signup" },
    { label: "Your dashboard", href: "/dashboard" },
  ],
  "Get started": [
    { label: "AI Skill Check", href: "/interview" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Learning center", href: "/#learn" },
    { label: "FAQs", href: "/#faq" },
  ],
  Support: [
    { label: "Safety & trust", href: "/#trust" },
    { label: "Workly Protect", href: "/#trust" },
    { label: "Private fulfilment", href: "/#trust" },
    { label: "Help centre", href: "/messages" },
  ],
};

export default function Footer() {
  return (
    <footer className="mt-12 bg-deep text-white">
      <div className="page-shell">
        <div className="grid grid-cols-2 gap-10 py-14 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <BrandLogo inverted compact />
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/60">
              Pakistan&apos;s beginner-first freelancing platform — helping new freelancers land their first job with confidence.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/70">
              <ShieldCheck className="h-4 w-4 text-mint" /> Escrow-protected payments
            </div>
          </div>

          {Object.entries(columns).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/40">{title}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="group inline-flex items-center gap-1 text-sm font-bold text-white/70 transition hover:text-white">
                      {link.label}<ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/40">Made for beginners</h3>
            <p className="mt-4 text-sm leading-6 text-white/60">Local pricing in PKR. AI guidance at every step. Support that understands the market.</p>
            <Link href="/interview" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-mint px-4 py-3 text-sm font-extrabold text-white transition hover:bg-mint-dark">
              <Sparkles className="h-4 w-4" /> Try the AI Skill Check
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Workly. All rights reserved.</span>
          <span>Pakistan&apos;s beginner-first freelancing platform.</span>
        </div>
      </div>
    </footer>
  );
}

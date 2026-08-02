"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ShieldCheck,
  CreditCard,
  UserCheck,
  FileText,
  AlertCircle,
  ChevronDown,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const CATEGORIES = [
  {
    slug: "posting-a-task",
    icon: FileText,
    title: "Posting a Task",
    desc: "How to post tasks, set realistic budgets, and manage offers.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    slug: "taskers-and-offers",
    icon: UserCheck,
    title: "Taskers & Offers",
    desc: "Making offers, building trust scores, and completing work.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    slug: "payments-and-escrow",
    icon: CreditCard,
    title: "Payments & Escrow",
    desc: "Protected funds, platform fees, requesting and releasing payments.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    slug: "safety-and-verification",
    icon: ShieldCheck,
    title: "Safety & Verification",
    desc: "Workly Protect, identity checks, and fraud prevention.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    slug: "disputes-and-refunds",
    icon: AlertCircle,
    title: "Disputes & Refunds",
    desc: "Resolving task issues, cancellation policy, and claims.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    slug: "communication",
    icon: MessageSquare,
    title: "Communication",
    desc: "In-app chat guidelines, off-platform warnings, and privacy.",
    color: "bg-indigo-50 text-indigo-600",
  },
];

const FAQS = [
  {
    q: "Is it free to post a task on Workly?",
    a: "Yes! Posting a task is completely free. You only pay when you choose a tasker and assign the task.",
  },
  {
    q: "How do protected payments work?",
    a: "When you select an offer, your payment is safely held on Workly. Funds are only released to the tasker after the work is completed to your satisfaction.",
  },
  {
    q: "How do I choose the best tasker for my task?",
    a: "Review their profile, trust score, completion rate, and ratings from past tasks. You can also read their offer message and compare prices.",
  },
  {
    q: "What happens if a task isn't completed?",
    a: "If a tasker cannot complete the task, you can request a cancellation and return the held funds back to your wallet.",
  },
  {
    q: "What is the platform commission fee?",
    a: "Workly charges a transparent 15% platform fee on completed tasks to cover payment processing, safety tools, and customer support.",
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Help Hero Header */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand/10 pointer-events-none" />
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-extrabold text-brand-light uppercase tracking-wider">
            <HelpCircle className="h-4 w-4" /> Workly Help Centre
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight">
            How can we help you today?
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Search our knowledge base or browse help topics below to get instant answers.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help articles (e.g. payments, posting a task, cancellation)..."
              className="w-full h-14 rounded-2xl bg-white pl-12 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand/30 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-12">
        {/* Help Topics Grid */}
        <section>
          <h2 className="text-xl font-black text-slate-900 mb-6">Browse Help Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.title}
                href={`/help/${cat.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-brand/40 hover:shadow-md cursor-pointer block"
              >
                <div className={`grid h-12 w-12 place-items-center rounded-xl ${cat.color}`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-brand transition">{cat.title}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQs Accordion */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-extrabold text-brand uppercase tracking-wider">
                Quick Answers
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Frequently Asked Questions
              </h2>
            </div>
            <Sparkles className="h-6 w-6 text-brand" />
          </div>

          <div className="divide-y divide-slate-100">
            {filteredFaqs.length === 0 ? (
              <p className="py-6 text-center text-sm font-semibold text-slate-500">
                No matching articles found for &quot;{search}&quot;.
              </p>
            ) : (
              filteredFaqs.map((faq, i) => (
                <div key={faq.q} className="py-4">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between text-left font-bold text-slate-900 text-sm sm:text-base hover:text-brand"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${
                        openFaq === i ? "rotate-180 text-brand" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed pr-6">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Contact Support Banner */}
        <section className="rounded-3xl bg-brand text-white p-8 sm:p-10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider">
              24/7 Customer Support
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black">Still need help?</h2>
            <p className="mt-1 text-xs sm:text-sm text-white/80 max-w-md">
              Our support team is available to assist you with active tasks, payment queries, or dispute resolution.
            </p>
          </div>
          <Link
            href="/messages"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-xs font-extrabold text-slate-900 shadow-md transition hover:bg-slate-100 shrink-0"
          >
            Contact Support <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}

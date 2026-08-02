"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface HelpTopic {
  slug: string;
  title: string;
  category: string;
  icon: any;
  desc: string;
  badgeColor: string;
  articles: { title: string; summary: string; steps?: string[] }[];
  faqs: { q: string; a: string }[];
}

const HELP_DATA: Record<string, HelpTopic> = {
  "posting-a-task": {
    slug: "posting-a-task",
    title: "Posting a Task",
    category: "Posters & Clients",
    icon: FileText,
    desc: "Learn how to post tasks, set fair budgets, compare offers, and select the right provider.",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    articles: [
      {
        title: "How to post a task step-by-step",
        summary:
          "Posting on Workly is quick and free. Fill out the task wizard with clear details to attract verified taskers.",
        steps: [
          "Click 'Post a task' in the main navigation.",
          "Enter a clear, descriptive title explaining what needs to be done.",
          "Select the category and provide detailed requirements or photos if needed.",
          "Choose location type (In-person with suburb or Online/Remote).",
          "Set your total budget and preferred completion date.",
        ],
      },
      {
        title: "Setting a fair and realistic budget",
        summary:
          "Setting an appropriate budget helps you receive higher-quality offers faster. Taskers can also send counter-offers if needed.",
      },
      {
        title: "Reviewing and accepting offers",
        summary:
          "When taskers submit bids, you can check their Trust Score, past reviews, and completed tasks before selecting the winner.",
      },
    ],
    faqs: [
      {
        q: "Is it free to post a task?",
        a: "Yes! Posting a task costs nothing. You are only charged when you accept an offer.",
      },
      {
        q: "Can I edit my task after posting?",
        a: "Yes, you can edit the task description or budget before assigning a provider.",
      },
    ],
  },

  "taskers-and-offers": {
    slug: "taskers-and-offers",
    title: "Taskers & Offers",
    category: "Freelancers & Taskers",
    icon: UserCheck,
    desc: "Everything taskers need to know about making offers, building trust, and getting hired.",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    articles: [
      {
        title: "How to submit a winning offer",
        summary:
          "Write a polite, professional message explaining your experience relevant to the task.",
        steps: [
          "Browse open tasks in your preferred category or location.",
          "Read the task requirements carefully.",
          "Enter your offer amount and a customized cover note.",
          "Submit your offer and wait for the client to review.",
        ],
      },
      {
        title: "Building your Trust Score & reputation",
        summary:
          "Your Trust Score starts at 70 and increases with 5-star reviews and completed jobs. High trust scores unlock more client invites.",
      },
      {
        title: "Fresh Talent Engine boost",
        summary:
          "New taskers (<14 days old) automatically receive a visibility boost to help them get their first review quickly.",
      },
    ],
    faqs: [
      {
        q: "How many bids can I send per day?",
        a: "There are no restrictions on open tasks, as long as you follow our community standards.",
      },
      {
        q: "When do I get paid?",
        a: "Once you complete the task and request payment, the client approves and funds transfer to your wallet.",
      },
    ],
  },

  "payments-and-escrow": {
    slug: "payments-and-escrow",
    title: "Payments & Escrow",
    category: "Finance & Wallet",
    icon: CreditCard,
    desc: "Understand how protected payments, wallet holds, platform fees, and payment releases work.",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    articles: [
      {
        title: "How protected payments work",
        summary:
          "When you accept an offer, payment is safely held by Workly until the task is completed.",
        steps: [
          "Poster selects a bid and funds are held in escrow.",
          "Tasker completes the task according to agreed details.",
          "Tasker requests payment in the task details screen.",
          "Poster approves completion and funds are released into the tasker's wallet.",
        ],
      },
      {
        title: "Platform fee structure",
        summary:
          "Workly charges a transparent 15% platform fee on completed tasks to maintain security, AI matching, and customer support.",
      },
      {
        title: "Wallet withdrawals & history",
        summary:
          "Taskers can track earnings in the Wallet tab and request direct payouts to verified bank accounts.",
      },
    ],
    faqs: [
      {
        q: "What if the client does not release payment?",
        a: "If work is delivered and the client is unresponsive for 7 days, our support team reviews the submission for manual release.",
      },
    ],
  },

  "safety-and-verification": {
    slug: "safety-and-verification",
    title: "Safety & Verification",
    category: "Workly Protect",
    icon: ShieldCheck,
    desc: "Our 4-layer trust system, identity badges, and automated fraud prevention features.",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    articles: [
      {
        title: "Workly Protect overview",
        summary:
          "Workly Protect safeguards both clients and taskers through payment holds, ID verification, and review history.",
      },
      {
        title: "Identity & Skill badges",
        summary:
          "Taskers with verified identities display a blue checkmark badge, boosting client confidence.",
      },
      {
        title: "AI Moderation & Spam detection",
        summary:
          "Hugging Face models automatically scan tasks and messages for inappropriate content or scams.",
      },
    ],
    faqs: [
      {
        q: "Is my personal information safe?",
        a: "Yes. Your address and private contact details are never shared publicly.",
      },
    ],
  },

  "disputes-and-refunds": {
    slug: "disputes-and-refunds",
    title: "Disputes & Refunds",
    category: "Support & Claims",
    icon: AlertCircle,
    desc: "How to resolve incomplete tasks, request cancellations, or open a support dispute.",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    articles: [
      {
        title: "Cancelling an uncompleted task",
        summary:
          "If a tasker cannot perform the work, mutual cancellation releases the held funds back to the poster's wallet.",
      },
      {
        title: "Filing a formal dispute",
        summary:
          "If there is a disagreement over work quality or scope, either party can open a support ticket for team arbitration.",
      },
    ],
    faqs: [
      {
        q: "How long do refunds take?",
        a: "Approved wallet refunds take effect instantly.",
      },
    ],
  },

  communication: {
    slug: "communication",
    title: "Communication & Messaging",
    category: "Platform Guidelines",
    icon: MessageSquare,
    desc: "In-app messaging rules, off-platform contact warnings, and privacy safety.",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    articles: [
      {
        title: "Workly Chat guidelines",
        summary:
          "All task discussions and agreement updates should take place inside Workly Chat for full dispute protection.",
      },
      {
        title: "Off-platform contact policy",
        summary:
          "Sharing personal phone numbers or bank details before hiring is flagged by fraud scanners and incurs a -20 Trust Score penalty.",
      },
    ],
    faqs: [
      {
        q: "Why should I keep chat on Workly?",
        a: "In-app chat records are the primary evidence used by support if a dispute arises.",
      },
    ],
  },
};

export default function HelpTopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const topic = HELP_DATA[slug];

  if (!topic) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-black text-slate-900">Topic Not Found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The help section you requested does not exist or has been moved.
        </p>
        <Link
          href="/help"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-dark"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Help Centre
        </Link>
      </div>
    );
  }

  const IconComp = topic.icon;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Back Link */}
        <Link
          href="/help"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Help Centre
        </Link>

        {/* Topic Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`grid h-12 w-12 place-items-center rounded-2xl ${topic.badgeColor}`}>
              <IconComp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                {topic.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{topic.title}</h1>
            </div>
          </div>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">{topic.desc}</p>
        </div>

        {/* Guides & Articles Section */}
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand" /> Detailed Guides & Articles
          </h2>

          {topic.articles.map((art, idx) => (
            <div
              key={art.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-900 text-xs font-black text-white">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-extrabold text-slate-900">{art.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {art.summary}
                  </p>

                  {art.steps && art.steps.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        Step-by-step Process:
                      </p>
                      {art.steps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Topic Specific FAQs */}
        {topic.faqs && topic.faqs.length > 0 && (
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-black text-slate-900 mb-4">Topic FAQs</h2>
            <div className="space-y-4">
              {topic.faqs.map((faq) => (
                <div key={faq.q} className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-sm font-extrabold text-slate-900">{faq.q}</p>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Support Footer */}
        <div className="mt-10 flex items-center justify-between rounded-3xl bg-slate-900 p-6 text-white shadow-md">
          <div>
            <p className="text-sm font-extrabold">Need custom assistance with this topic?</p>
            <p className="text-xs text-slate-400 mt-0.5">Our support desk can help review your active tasks.</p>
          </div>
          <Link
            href="/messages"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-xs font-extrabold text-white hover:bg-brand-dark transition shrink-0"
          >
            Contact Support <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

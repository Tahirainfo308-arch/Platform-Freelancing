"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Compass,
  GraduationCap,
  HandHeart,
  Laptop2,
  Lightbulb,
  MapPin,
  MessageSquareText,
  Paintbrush,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Truck,
  UserRoundCheck,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import { formatPKR } from "@/lib/format";

const categories = [
  { icon: Laptop2, name: "Web & App", count: "Build sites, apps & support", tone: "bg-mint-50 text-deep" },
  { icon: Paintbrush, name: "Design", count: "Logos, branding & creative", tone: "bg-mint-50 text-deep" },
  { icon: Wrench, name: "Handyman", count: "Fixing, assembly & maintenance", tone: "bg-mint-50 text-deep" },
  { icon: BriefcaseBusiness, name: "Virtual Assistant", count: "Admin & online support", tone: "bg-mint-50 text-deep" },
  { icon: Truck, name: "Delivery & Moving", count: "Errands, delivery & relocation", tone: "bg-mint-50 text-deep" },
  { icon: MessageSquareText, name: "Content & Writing", count: "Copy, blogs & translations", tone: "bg-mint-50 text-deep" },
];

const featuredJobs = [
  { title: "Shopify store speed optimisation", place: "Remote", bids: 8, price: 45000, match: 96, beginner: true },
  { title: "Social media kit for a new chai cafe", place: "Karachi", bids: 12, price: 22000, match: 91, beginner: true },
  { title: "Data entry for online store", place: "Remote", bids: 15, price: 15000, match: 89, beginner: true },
  { title: "Set up a WordPress portfolio site", place: "Lahore", bids: 6, price: 30000, match: 93, beginner: true },
  { title: "Logo + business card design", place: "Remote", bids: 9, price: 18000, match: 87, beginner: true },
  { title: "Translate documents Urdu to English", place: "Remote", bids: 4, price: 12000, match: 90, beginner: true },
];

const topFreelancers = [
  { name: "Ayesha R.", title: "Social Media Designer", city: "Lahore", score: 94, jobs: 12, rating: 4.9, avatar: "A", tag: "First job in 3 weeks" },
  { name: "Bilal K.", title: "Web Developer", city: "Islamabad", score: 92, jobs: 9, rating: 4.8, avatar: "B", tag: "First job in 2 weeks" },
  { name: "Mahnoor S.", title: "Virtual Assistant", city: "Karachi", score: 96, jobs: 15, rating: 5.0, avatar: "M", tag: "First job in 1 week" },
  { name: "Usman T.", title: "Content Writer", city: "Faisalabad", score: 90, jobs: 8, rating: 4.7, avatar: "U", tag: "First job in 4 weeks" },
];

const steps = [
  { icon: UserRoundCheck, step: "01", title: "Create your profile", body: "Sign up free and tell us what you're good at. No experience needed to start." },
  { icon: Sparkles, step: "02", title: "Take the AI Skill Check", body: "Answer a few simple questions. Get a skill score that helps clients trust you." },
  { icon: Target, step: "03", title: "Send offers on real jobs", body: "Browse beginner-friendly tasks and send your first offer with one click." },
  { icon: Wallet, step: "04", title: "Get paid safely", body: "Complete the job, get approved, and receive your payment through escrow." },
];

const stories = [
  { name: "Fatima", city: "Karachi", role: "Graphic Designer", quote: "I was scared to start freelancing. The AI Skill Check gave me a score, and my first client hired me the same week. It felt safe and simple.", jobs: "12 jobs completed", avatar: "F" },
  { name: "Hamza", city: "Lahore", role: "Web Developer", quote: "No portfolio, no connections — just the skill check and a beginner-friendly task. I landed my first paid project in 2 weeks.", jobs: "8 jobs completed", avatar: "H" },
  { name: "Zainab", city: "Rawalpindi", role: "Virtual Assistant", quote: "As a first-timer I loved that everything guided me step by step. The trust score made clients take me seriously right away.", jobs: "15 jobs completed", avatar: "Z" },
];

const lessons = [
  { icon: Lightbulb, title: "How to write your first winning offer", minutes: "5 min read", tag: "Beginners" },
  { icon: Star, title: "Building a trust score clients love", minutes: "4 min read", tag: "Reputation" },
  { icon: TrendingUp, title: "Pricing your first jobs in PKR", minutes: "6 min read", tag: "Pricing" },
  { icon: MessageSquareText, title: "Clear communication = more jobs", minutes: "4 min read", tag: "Skills" },
];

const faqs = [
  { q: "I have no experience. Can I still start freelancing?", a: "Yes. Workly is built for beginners. You can take the free AI Skill Check, apply for beginner-friendly tasks, and build trust with your first few small wins. Every professional started somewhere." },
  { q: "How does the AI Skill Score work?", a: "The AI Skill Check asks simple questions about your skills and work preferences. Our system estimates a score that helps clients understand your strengths — even before you have a long work history." },
  { q: "When and how do I get paid?", a: "Payments are protected by escrow. The client deposits the amount, you complete the task, and once the client approves, the money is released to your Workly wallet." },
  { q: "Is it really free to join?", a: "Yes. Creating an account, browsing jobs, and taking the AI Skill Check are completely free. We only charge a small platform fee when you successfully complete work." },
  { q: "How do I get my first client to trust me?", a: "Complete your profile, take the AI Skill Check, and start with tasks marked 'beginner friendly'. Small, well-scoped jobs are the fastest way to earn reviews and grow your trust score." },
];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/tasks?q=${encodeURIComponent(query.trim())}` : "/tasks");
  };

  return (
    <div className="overflow-hidden">
      <section className="relative bg-deep text-white">
        <div className="pointer-events-none absolute inset-0 soft-grid opacity-60" />
        <div className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-mint/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-mint/10 blur-3xl" />
        <div className="page-shell relative grid min-h-[680px] items-center gap-14 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-mint-300/30 bg-mint/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-mint">
              <Sparkles className="h-3.5 w-3.5" /> Pakistan&apos;s beginner-first freelancing platform
            </div>
            <h1 className="mt-7 max-w-3xl text-balance text-5xl font-black leading-[1.05] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Your first freelance job starts <span className="relative whitespace-nowrap text-mint">here.<span className="absolute -bottom-1 left-0 h-2 w-full -rotate-1 rounded-full bg-mint/40" /></span>
            </h1>
            <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-white/65">
              No experience? No problem. Build your AI skill score, apply to beginner-friendly jobs, and earn real money — with confidence from day one.
            </p>

            <form onSubmit={submitSearch} className="mt-9 flex max-w-xl flex-col gap-3 rounded-2xl bg-white p-2.5 shadow-elevated sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-deep/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search beginner-friendly jobs..."
                  className="min-h-14 w-full rounded-xl bg-canvas px-4 pl-12 text-sm font-semibold text-ink placeholder:text-ink-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-mint/40"
                />
              </div>
              <Link href="/post" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-mint px-6 text-sm font-extrabold text-white shadow-glow transition hover:bg-mint-dark">
                Post a job <ArrowRight className="h-4 w-4" />
              </Link>
            </form>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-extrabold text-white/70">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-mint" /> Free to join</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-mint" /> Escrow-protected</span>
              <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-mint" /> AI-guided onboarding</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-mint/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[28px] bg-white/95 p-4 shadow-elevated backdrop-blur sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">Work feed</p>
                  <p className="mt-1 text-xl font-black text-deep">Matched for you</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1.5 text-xs font-extrabold text-white"><Zap className="h-3.5 w-3.5" /> Live</span>
              </div>
              <div className="mt-6 space-y-3">
                {featuredJobs.slice(0, 3).map((task, index) => (
                  <div key={task.title} className={`rounded-2xl border p-4 transition ${index === 0 ? "border-mint-200 bg-white shadow-card" : "border-ink-100 bg-canvas/60"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`text-[10px] font-extrabold uppercase tracking-[0.14em] ${index === 0 ? "text-mint-700" : "text-ink-400"}`}>{task.match}% match · Beginner friendly</span>
                        <h3 className={`mt-1 text-sm font-extrabold ${index === 0 ? "text-ink" : "text-ink"}`}>{task.title}</h3>
                      </div>
                      <span className={`shrink-0 text-sm font-black ${index === 0 ? "text-deep" : "text-ink"}`}>{formatPKR(task.price, true)}</span>
                    </div>
                    <div className={`mt-3 flex items-center gap-4 text-xs font-bold ${index === 0 ? "text-ink-400" : "text-ink-400"}`}>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{task.place}</span>
                      <span className="flex items-center gap-1"><BriefcaseBusiness className="h-3 w-3" />{task.bids} offers</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/interview" className="relative mt-4 flex items-center justify-between rounded-2xl bg-deep px-4 py-3.5 text-white transition hover:bg-deep-800">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-mint"><Sparkles className="h-4 w-4" /></span>
                  <div><p className="text-xs font-black">Free AI Skill Check</p><p className="text-[10px] text-white/60">Get your score in 5 minutes</p></div>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-3 pr-5 shadow-card sm:-left-10">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-mint-50 text-mint-700"><BadgeCheck className="h-5 w-5" /></div>
              <div><div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-warning text-warning" />)}</div><p className="mt-1 text-xs font-extrabold text-ink">Trust-first hiring</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink-100 bg-white py-7">
        <div className="page-shell grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            ["1000+", "jobs posted weekly"],
            ["0 PKR", "to join & apply"],
            ["AI scores", "on every profile"],
            ["Escrow", "protects every job"],
          ].map(([value, label]) => (
            <div key={label} className="text-center sm:text-left"><p className="text-2xl font-black tracking-[-0.04em] text-deep">{value}</p><p className="mt-1 text-xs font-bold text-ink-400">{label}</p></div>
          ))}
        </div>
      </section>

      <section className="bg-canvas py-24">
        <div className="page-shell">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><span className="eyebrow">Explore work</span><h2 className="mt-5 max-w-xl text-4xl font-black tracking-[-0.045em] text-ink sm:text-5xl">Popular categories for first jobs.</h2></div>
            <Link href="/tasks" className="inline-flex items-center gap-2 text-sm font-extrabold text-deep">Browse all jobs <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.name} href={`/tasks?category=${encodeURIComponent(category.name)}`} className="group flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-mint-200 hover:shadow-card-hover">
                <span className={`grid h-14 w-14 place-items-center rounded-2xl ${category.tone}`}><category.icon className="h-6 w-6" /></span>
                <div className="flex-1"><h3 className="font-black text-ink">{category.name}</h3><p className="mt-1 text-xs font-semibold text-ink-400">{category.count}</p></div>
                <ChevronRight className="h-5 w-5 text-ink-300 transition group-hover:translate-x-1 group-hover:text-mint-600" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="page-shell">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><span className="eyebrow"><BriefcaseBusiness className="h-3.5 w-3.5" /> Featured beginner jobs</span><h2 className="mt-5 max-w-xl text-4xl font-black tracking-[-0.045em] text-ink sm:text-5xl">Perfect for your very first job.</h2></div>
            <Link href="/tasks" className="inline-flex items-center gap-2 text-sm font-extrabold text-deep">See all jobs <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((task) => (
              <Link key={task.title} href="/tasks" className="group rounded-2xl border border-ink-100 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-mint-200 hover:shadow-card-hover">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-50 px-3 py-1 text-[11px] font-extrabold text-deep"><Sparkles className="h-3 w-3" /> Beginner friendly</span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-mint-700">{task.match}% match</span>
                </div>
                <h3 className="mt-4 text-lg font-black text-ink">{task.title}</h3>
                <div className="mt-3 flex items-center gap-4 text-xs font-bold text-ink-400">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-mint-600" />{task.place}</span>
                  <span className="flex items-center gap-1"><BriefcaseBusiness className="h-3 w-3 text-mint-600" />{task.bids} offers</span>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
                  <p className="text-lg font-black text-ink">{formatPKR(task.price, true)}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-deep group-hover:text-mint-700">Apply now <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-canvas py-24">
        <div className="page-shell">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><span className="eyebrow"><BadgeCheck className="h-3.5 w-3.5" /> Top freelancers</span><h2 className="mt-5 max-w-xl text-4xl font-black tracking-[-0.045em] text-ink sm:text-5xl">Beginners clients already trust.</h2></div>
            <Link href="/tasks" className="inline-flex items-center gap-2 text-sm font-extrabold text-deep">Hire talent <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topFreelancers.map((person) => (
              <div key={person.name} className="rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-card transition hover:-translate-y-1 hover:shadow-card-hover">
                <div className="relative mx-auto h-16 w-16">
                  <span className="grid h-16 w-16 place-items-center rounded-2xl bg-deep text-xl font-black text-white">{person.avatar}</span>
                  <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-mint text-[10px] font-black text-white ring-2 ring-white">{person.score}</span>
                </div>
                <h3 className="mt-4 font-black text-ink">{person.name}</h3>
                <p className="mt-1 text-xs font-bold text-ink-400">{person.title} · {person.city}</p>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-ink-500">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" />{person.rating}</span>
                  <span>·</span>
                  <span>{person.jobs} jobs done</span>
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-mint-50 px-3 py-1.5 text-[11px] font-extrabold text-deep"><Sparkles className="h-3 w-3" /> {person.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-24">
        <div className="page-shell">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow"><Compass className="h-3.5 w-3.5" /> How it works</span>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] text-ink sm:text-5xl">From zero experience to first paycheck.</h2>
            <p className="mt-4 text-base font-medium leading-7 text-ink-500">Four simple steps. No portfolio required.</p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.title} className="relative rounded-2xl border border-ink-100 bg-canvas/60 p-7 transition hover:border-mint-200 hover:bg-white hover:shadow-card">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-mint-700">{step.step}</span>
                <span className="mt-5 grid h-12 w-12 place-items-center rounded-2xl bg-mint-50 text-mint-700"><step.icon className="h-6 w-6" /></span>
                <h3 className="mt-5 text-xl font-black text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-500">{step.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-mint px-6 text-sm font-extrabold text-white shadow-glow transition hover:bg-mint-dark">Start free today <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/interview" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-deep/20 bg-white px-6 text-sm font-extrabold text-deep transition hover:bg-mint-50"><Sparkles className="h-4 w-4" /> Try the AI Skill Check</Link>
          </div>
        </div>
      </section>

      <section className="bg-deep py-24 text-white">
        <div className="page-shell">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-mint-300/30 bg-mint/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-mint"><HandHeart className="h-3.5 w-3.5" /> Success stories</span>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] sm:text-5xl">They started exactly where you are.</h2>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {stories.map((story) => (
              <figure key={story.name} className="rounded-2xl border border-white/10 bg-white/[0.06] p-7 backdrop-blur transition hover:bg-white/[0.1]">
                <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}</div>
                <blockquote className="mt-4 text-sm leading-7 text-white/80">“{story.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-mint text-sm font-black text-white">{story.avatar}</span>
                  <div><p className="text-sm font-black text-white">{story.name} <span className="font-medium text-white/50">· {story.city}</span></p><p className="text-xs font-bold text-mint">{story.role} · {story.jobs}</p></div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="learn" className="bg-white py-24">
        <div className="page-shell">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><span className="eyebrow"><GraduationCap className="h-3.5 w-3.5" /> Learning center</span><h2 className="mt-5 max-w-xl text-4xl font-black tracking-[-0.045em] text-ink sm:text-5xl">Learn before you earn.</h2></div>
            <span className="inline-flex items-center gap-2 text-sm font-extrabold text-ink-400"><BookOpen className="h-4 w-4" /> Free guides, always</span>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {lessons.map((lesson) => (
              <Link key={lesson.title} href="/interview" className="group rounded-2xl border border-ink-100 bg-canvas/60 p-6 transition hover:-translate-y-1 hover:border-mint-200 hover:bg-white hover:shadow-card">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-mint-50 text-mint-700"><lesson.icon className="h-5 w-5" /></span>
                <h3 className="mt-4 font-black leading-snug text-ink">{lesson.title}</h3>
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-ink-400"><span className="rounded-full bg-mint-50 px-2.5 py-1 text-[10px] font-black uppercase text-deep">{lesson.tag}</span><span className="flex items-center gap-1"><Clock3 className="h-3 w-3" />{lesson.minutes}</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-canvas py-24">
        <div className="page-shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <span className="eyebrow">FAQs</span>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] text-ink sm:text-5xl">Questions every beginner asks.</h2>
            <p className="mt-4 max-w-md text-base font-medium leading-7 text-ink-500">Still unsure? Our support team is ready to help you take the first step.</p>
            <Link href="/messages" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-mint px-6 text-sm font-extrabold text-white shadow-glow transition hover:bg-mint-dark"><MessageSquareText className="h-4 w-4" /> Talk to support</Link>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={faq.q} className={`overflow-hidden rounded-2xl border transition ${openFaq === index ? "border-mint-200 bg-white shadow-card" : "border-ink-100 bg-white"}`}>
                <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                  <span className="font-black text-ink">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-mint-700 transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                </button>
                {openFaq === index && <p className="px-6 pb-6 text-sm leading-7 text-ink-500">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white pb-24">
        <div className="page-shell">
          <div className="relative overflow-hidden rounded-[28px] bg-deep p-10 text-center text-white shadow-elevated sm:p-16">
            <div className="pointer-events-none absolute inset-0 soft-grid opacity-50" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-mint-300/30 bg-mint/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-mint"><Zap className="h-3.5 w-3.5" /> Ready when you are</span>
              <h2 className="mx-auto mt-6 max-w-2xl text-balance text-4xl font-black tracking-[-0.045em] sm:text-6xl">Your first freelance job is <span className="text-mint">waiting.</span></h2>
              <p className="mx-auto mt-5 max-w-xl text-base font-medium text-white/65">Join free, get your AI skill score, and apply to beginner-friendly jobs today.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/signup" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-mint px-7 text-sm font-extrabold text-white shadow-glow transition hover:bg-mint-dark">Start free <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/tasks" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 text-sm font-extrabold text-white transition hover:bg-white/15">Browse jobs <Search className="h-4 w-4" /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

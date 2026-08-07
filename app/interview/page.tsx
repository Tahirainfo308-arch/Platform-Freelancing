"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Compass,
  GraduationCap,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Star,
  Target,
} from "lucide-react";
import { saveAiResult, getAiResult, type AiResult } from "@/lib/ai-score";

type Option = { label: string; points: number };
type Question = { title: string; body: string; icon: any; options: Option[] };

const questions: Question[] = [
  {
    title: "What type of work excites you most?",
    body: "There's no wrong answer — this helps us match you with the right first job.",
    icon: Compass,
    options: [
      { label: "Design & creative", points: 4 },
      { label: "Web & technical", points: 4 },
      { label: "Writing & content", points: 4 },
      { label: "Admin & support", points: 3 },
    ],
  },
  {
    title: "How comfortable are you with computers?",
    body: "Being honest gives you a score you can actually grow from.",
    icon: Sparkles,
    options: [
      { label: "Very comfortable", points: 4 },
      { label: "Somewhat comfortable", points: 3 },
      { label: "Still learning", points: 2 },
      { label: "Just getting started", points: 1 },
    ],
  },
  {
    title: "What does your schedule look like?",
    body: "Clients love knowing when you can deliver.",
    icon: Star,
    options: [
      { label: "Full time availability", points: 4 },
      { label: "Part time", points: 3 },
      { label: "Evenings & weekends", points: 3 },
      { label: "Flexible", points: 4 },
    ],
  },
  {
    title: "How would clients describe your communication?",
    body: "Clear communication is the #1 reason beginners get hired.",
    icon: Lightbulb,
    options: [
      { label: "Clear and fast", points: 4 },
      { label: "Friendly and polite", points: 3 },
      { label: "Good in writing", points: 3 },
      { label: "Still practicing", points: 2 },
    ],
  },
  {
    title: "What matters most for your first job?",
    body: "The right first project should feel achievable — not overwhelming.",
    icon: Target,
    options: [
      { label: "Small and simple", points: 4 },
      { label: "Learning a new skill", points: 3 },
      { label: "Building my reviews", points: 4 },
      { label: "Earning quickly", points: 3 },
    ],
  },
  {
    title: "Do you already have a skill you can practice today?",
    body: "You don't need years of experience — a skill you enjoy is enough to start.",
    icon: GraduationCap,
    options: [
      { label: "Yes, I'm confident", points: 4 },
      { label: "A few, still growing", points: 3 },
      { label: "Exploring options", points: 2 },
      { label: "Not sure yet", points: 1 },
    ],
  },
];

const learningByCategory: Record<string, string[]> = {
  "Web & App": ["Start with one small website build", "Learn the basics of responsive design", "Practice with free coding sandboxes"],
  "Content & Writing": ["Write one sample blog post this week", "Study short, clear copywriting examples", "Build a 3-post sample portfolio"],
  "Virtual Assistant": ["Learn calendar and email management", "Practice with a sample inbox task", "Master simple spreadsheet skills"],
  "Design": ["Create one logo concept daily", "Learn color and typography basics", "Publish 3 designs to your portfolio"],
};

export default function InterviewPage() {
  const [step, setStep] = useState<"welcome" | "quiz" | "processing" | "done">(() => (getAiResult() ? "done" : "welcome"));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<AiResult | null>(() => getAiResult());

  const choose = (points: number) => {
    const next = [...answers.slice(0, index), points];
    setAnswers(next);
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      runProcessing(next);
    }
  };

  const back = () => {
    if (index > 0) setIndex(index - 1);
  };

  const runProcessing = (finalAnswers: number[]) => {
    setStep("processing");
    const base = finalAnswers.reduce((s, p) => s + p, 0) / (finalAnswers.length * 4);
    const skillScore = Math.max(55, Math.min(97, Math.round(base * 100 + 8)));
    const confidence = Math.max(40, Math.min(92, Math.round(base * 88 + 12)));
    const topCategory = questions[0].options[0].label.split(" ")[0].toLowerCase();
    const category = topCategory === "design" || topCategory === "web" ? "Web & App" : topCategory === "writing" ? "Content & Writing" : "Virtual Assistant";
    const learning = learningByCategory[category];
    const built: AiResult = { skillScore, confidence, categories: [category, "Content & Writing", "Virtual Assistant"].filter((c, i, a) => a.indexOf(c) === i), learning, takenAt: new Date().toISOString() };
    setTimeout(() => {
      saveAiResult(built);
      setResult(built);
      setStep("done");
    }, 2600);
  };

  const restart = () => {
    setIndex(0);
    setAnswers([]);
    setResult(null);
    setStep("welcome");
  };

  if (step === "welcome") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-deep p-8 text-center text-white shadow-card sm:p-12">
          <div className="pointer-events-none absolute inset-0 soft-grid opacity-40" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-mint-300/30 bg-mint/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-mint"><Sparkles className="h-3.5 w-3.5" /> Free · 5 minutes</span>
            <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] sm:text-5xl">The AI Skill Check</h1>
            <p className="mx-auto mt-4 max-w-md text-base font-medium leading-7 text-white/65">
              Answer a few simple questions. Get your skill score and discover the jobs you&apos;re best suited for — with zero pressure.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[["01", "Simple questions"], ["02", "Instant AI score"], ["03", "Job matches"]].map(([num, label]) => (
                <div key={num} className="rounded-xl border border-white/10 bg-white/5 p-4"><p className="text-sm font-black text-mint">{num}</p><p className="mt-1 text-[11px] font-bold text-white/60">{label}</p></div>
              ))}
            </div>
            <button onClick={() => setStep("quiz")} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-mint px-7 text-sm font-extrabold text-white shadow-glow transition hover:bg-mint-dark">
              Start the check <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="mt-6 text-center text-xs font-medium text-ink-400">Already took it? <button onClick={() => { setResult(getAiResult()); setStep("done"); }} className="font-extrabold text-mint-700">View my result</button></p>
      </div>
    );
  }

  if (step === "quiz") {
    const q = questions[index];
    const progress = Math.round((index / questions.length) * 100);
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <div className="flex items-center justify-between text-xs font-bold text-ink-400">
          <button onClick={back} disabled={index === 0} className="flex items-center gap-1 transition hover:text-deep disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Back</button>
          <span>Question {index + 1} of {questions.length}</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-100">
          <div className="h-full rounded-full bg-mint transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div key={index} className="animate-fade-up mt-8 rounded-2xl border border-ink-100 bg-white p-7 shadow-card sm:p-9">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint-50 text-mint-700"><q.icon className="h-6 w-6" /></span>
          <h1 className="mt-5 text-2xl font-black tracking-[-0.03em] text-ink">{q.title}</h1>
          <p className="mt-2 text-sm font-medium leading-6 text-ink-400">{q.body}</p>
          <div className="mt-7 space-y-3">
            {q.options.map((option) => (
              <button key={option.label} onClick={() => choose(option.points)} className="group flex w-full items-center justify-between rounded-xl border border-ink-100 bg-canvas/50 px-5 py-4 text-left text-sm font-bold text-ink transition hover:border-mint-200 hover:bg-mint-50">
                <span>{option.label}</span>
                <span className="grid h-6 w-6 place-items-center rounded-full border border-ink-200 text-transparent transition group-hover:border-mint group-hover:bg-mint group-hover:text-white"><Check className="h-3.5 w-3.5" /></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <div className="relative mx-auto h-28 w-28">
          <div className="absolute inset-0 animate-breathe rounded-full bg-mint/25 blur-xl" />
          <div className="absolute inset-3 animate-spin rounded-full border-[3px] border-mint border-t-transparent" />
          <div className="absolute inset-0 grid place-items-center"><Sparkles className="h-9 w-9 text-mint-700" /></div>
        </div>
        <h1 className="mt-8 text-2xl font-black text-ink">Analysing your answers...</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-ink-400">Our AI is building your skill profile. This only takes a few seconds.</p>
        <div className="mx-auto mt-8 flex max-w-sm items-center justify-between text-xs font-bold text-ink-400">
          <span className="animate-pulse-soft">Reading answers</span>
          <span className="animate-pulse-soft" style={{ animationDelay: "0.5s" }}>Scoring skills</span>
          <span className="animate-pulse-soft" style={{ animationDelay: "1s" }}>Finding matches</span>
        </div>
      </div>
    );
  }

  const score = result?.skillScore ?? 70;
  const rating = score >= 85 ? "Excellent" : score >= 75 ? "Great" : score >= 65 ? "Good" : "A strong start";
  const message =
    score >= 85
      ? "You're ready to start applying today. Clients will see a confident, capable beginner."
      : score >= 75
        ? "You're close to ready. Follow the suggestions below and your score will climb fast."
        : "Every professional starts here. Small, beginner-friendly jobs will grow your confidence quickly.";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="animate-fade-up overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="bg-deep p-7 text-center text-white sm:p-9">
          <span className="inline-flex items-center gap-2 rounded-full border border-mint-300/30 bg-mint/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-mint"><BadgeCheck className="h-3.5 w-3.5" /> AI assessment complete</span>
          <h1 className="mt-5 text-3xl font-black tracking-[-0.03em] sm:text-4xl">Your Skill Score: {rating}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-white/65">{message}</p>
        </div>

        <div className="p-7 sm:p-9">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
            <div className="relative grid h-32 w-32 shrink-0 place-items-center">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="54" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                <circle cx="64" cy="64" r="54" fill="none" stroke="#00CB75" strokeWidth="10" strokeLinecap="round" strokeDasharray={2 * Math.PI * 54} strokeDashoffset={2 * Math.PI * 54 * (1 - score / 100)} />
              </svg>
              <span className="absolute text-4xl font-black text-ink">{score}</span>
            </div>
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-canvas px-4 py-3">
                <span className="text-sm font-bold text-ink-500">Confidence level</span>
                <span className="text-sm font-black text-mint-700">{result?.confidence ?? 75}%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-canvas px-4 py-3">
                <span className="text-sm font-bold text-ink-500">Recommended categories</span>
                <span className="max-w-[60%] truncate text-right text-sm font-black text-ink">{result?.categories.join(", ")}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-canvas px-4 py-3">
                <span className="text-sm font-bold text-ink-500">Best starting jobs</span>
                <span className="text-sm font-black text-mint-700">Beginner friendly</span>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-mint-200 bg-mint-50 p-6">
            <p className="flex items-center gap-2 text-sm font-black text-deep"><GraduationCap className="h-4 w-4" /> Learning suggestions</p>
            <ul className="mt-4 space-y-2.5">
              {(result?.learning ?? []).map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm font-medium leading-6 text-ink-600"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mint-700" />{tip}</li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button onClick={restart} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink-200 bg-white px-5 text-sm font-extrabold text-ink transition hover:bg-canvas"><RotateCcw className="h-4 w-4" /> Retake</button>
            <div className="flex flex-wrap gap-2">
              <Link href="/tasks" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-mint px-6 text-sm font-extrabold text-white shadow-glow transition hover:bg-mint-dark">Browse matched jobs <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-xs font-medium text-ink-400">Your score updates as you complete your profile and finish jobs. Keep growing!</p>
    </div>
  );
}

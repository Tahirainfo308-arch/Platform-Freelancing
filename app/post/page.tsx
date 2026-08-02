"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createTask, CATEGORIES } from "@/lib/tasks";
import { analyzeTask, type TaskSuggestion } from "@/lib/hf";
import { getAutoApprove } from "@/lib/admin";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  CircleDollarSign,
  FileText,
  MapPin,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { formatPKR } from "@/lib/format";

export default function PostTaskPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isRemote, setIsRemote] = useState(false);
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [budget, setBudget] = useState("50");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<TaskSuggestion | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/post");
    if (!loading && user && !["customer", "company_admin", "super_admin"].includes(role || ""))
      router.replace("/dashboard");
  }, [loading, user, role, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  const handleAiSuggest = async () => {
    if (!title.trim() || !description.trim()) return;
    setAiLoading(true);
    try {
      const res = await analyzeTask(title, description);
      if (res) setSuggestion(res);
    } finally {
      setAiLoading(false);
    }
  };

  const applySuggestion = () => {
    if (!suggestion) return;
    if (suggestion.category && CATEGORIES.includes(suggestion.category))
      setCategory(suggestion.category);
    if (suggestion.improvedDescription) setDescription(suggestion.improvedDescription);
    setSuggestion(null);
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const auto = await getAutoApprove();
      const moderation = auto ? suggestion || (await analyzeTask(title, description)) : null;
      const passedSmartReview = auto && moderation?.moderation === "approved";
      const finalLoc = isRemote ? "Remote / Online" : location.trim() || "Local";

      const id = await createTask({
        title: title.trim(),
        description: description.trim(),
        category,
        budget: Number(budget) || 50,
        location: finalLoc,
        deadline: deadline || undefined,
        posterId: user.uid,
        posterName: user.displayName || user.email || "User",
        status: passedSmartReview ? "open" : "pending",
        visibility: "public",
        approvalMode: passedSmartReview ? "auto" : "manual",
        moderation: moderation?.moderation || "review",
      });
      router.push(`/tasks/${id}`);
    } catch (err: any) {
      setError(err.message || "Could not post task");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-10">
      <div className="mx-auto max-w-2xl px-4">
        {/* Wizard Progress Bar */}
        <div className="mb-8 flex items-center justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-1 items-center">
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-black transition ${
                  step === s
                    ? "bg-brand text-white shadow-md"
                    : step > s
                    ? "bg-slate-900 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`h-1 flex-1 transition ${
                    step > s ? "bg-slate-900" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          {step === 1 && (
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand">
                Step 1 of 4
              </span>
              <h1 className="mt-2 text-2xl font-black text-slate-900">What do you need done?</h1>
              <p className="mt-1 text-sm text-slate-500">
                This will be the title and description of your task.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Task Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Transport a sofa, Desk build, Clean 3-bed house"
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 focus:bg-white focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-brand focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Details & Requirements
                  </label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what needs to be done, size, steps, or items needed..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-brand focus:outline-none"
                  />
                </div>

                {title.trim() && description.trim().length >= 15 && !suggestion && (
                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={aiLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-brand/20 bg-blue-50/50 px-4 py-3 text-xs font-extrabold text-brand hover:bg-blue-50"
                  >
                    <WandSparkles className="h-4 w-4" />{" "}
                    {aiLoading ? "Enhancing with AI..." : "Enhance details with AI"}
                  </button>
                )}

                {suggestion && (
                  <div className="rounded-2xl border border-brand/30 bg-blue-50 p-4 text-xs">
                    <p className="font-bold text-brand flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> AI Suggestion
                    </p>
                    <p className="mt-2 leading-relaxed text-slate-700">
                      {suggestion.improvedDescription}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={applySuggestion}
                        className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white"
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        onClick={() => setSuggestion(null)}
                        className="text-xs font-semibold text-slate-500"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  disabled={!title.trim() || !description.trim()}
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-brand-dark disabled:opacity-50"
                >
                  Next: Location <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand">
                Step 2 of 4
              </span>
              <h1 className="mt-2 text-2xl font-black text-slate-900">Where does it take place?</h1>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRemote(false)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      !isRemote
                        ? "border-brand ring-2 ring-brand/20 bg-blue-50/20"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <MapPin className="h-5 w-5 text-brand" />
                    <p className="mt-2 font-bold text-sm text-slate-900">In person</p>
                    <p className="text-xs text-slate-500">Requires physical presence</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRemote(true)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      isRemote
                        ? "border-brand ring-2 ring-brand/20 bg-blue-50/20"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <FileText className="h-5 w-5 text-brand" />
                    <p className="mt-2 font-bold text-sm text-slate-900">Online / Remote</p>
                    <p className="text-xs text-slate-500">Can be done from anywhere</p>
                  </button>
                </div>

                {!isRemote && (
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Suburb or City Location
                    </label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Randwick NSW, Bondi Beach, Lahore, Karachi"
                      className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 focus:bg-white focus:border-brand focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 rounded-full px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={!isRemote && !location.trim()}
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-brand-dark disabled:opacity-50"
                >
                  Next: Date <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand">
                Step 3 of 4
              </span>
              <h1 className="mt-2 text-2xl font-black text-slate-900">When do you need it done?</h1>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Date / Preferred timing
                  </label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="e.g. Tomorrow, Flexible, Midday, By Next Monday"
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 focus:bg-white focus:border-brand focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {["Today", "Tomorrow", "In 3 days", "Flexible timing"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDeadline(d)}
                      className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-brand hover:text-white"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 rounded-full px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-brand-dark"
                >
                  Next: Budget <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand">
                Step 4 of 4
              </span>
              <h1 className="mt-2 text-2xl font-black text-slate-900">What is your budget?</h1>
              <p className="mt-1 text-sm text-slate-500">
                Set a total budget for this task. You will review offers before accepting.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Budget Amount ($ / PKR)
                  </label>
                  <div className="relative mt-2">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-slate-500">
                      $
                    </span>
                    <input
                      type="number"
                      min={10}
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-xl font-extrabold text-slate-900 focus:bg-white focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Task Summary
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-900">{title}</p>
                  <p className="mt-0.5 text-xs text-slate-600 truncate">{description}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-xs font-bold">
                    <span className="text-slate-500">Total Budget:</span>
                    <span className="text-brand font-black text-sm">
                      {formatPKR(Number(budget) || 50)}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                    {error}
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 rounded-full px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={submit}
                  className="flex items-center gap-2 rounded-full bg-brand px-8 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-brand-dark disabled:opacity-50"
                >
                  {busy ? "Posting Task..." : "Post Task Now"}{" "}
                  {!busy && <Check className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

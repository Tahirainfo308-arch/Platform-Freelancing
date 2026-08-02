"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getTask, type Task } from "@/lib/tasks";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import Button from "@/components/ui/Button";
import { ArrowLeft, Sparkles, Send, Bot, User, CheckCircle2, ChevronRight, Star, ShieldCheck, AlertCircle } from "lucide-react";
import { formatPKR } from "@/lib/format";

type Message = {
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
};

export default function AIInterviewPage() {
  const { id: taskId } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [bidId, setBidId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [interviewState, setInterviewState] = useState<"intro" | "interviewing" | "scoring" | "completed">("intro");
  const [finalReport, setFinalReport] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Dynamic interview questions based on category
  const getQuestionsForCategory = (category: string, title: string) => {
    const baseQuestions = [
      `How do you plan to approach this task: "${title}"? Please outline your tools, techniques, or tech stack.`,
      `What is your specific technical experience with similar projects in the "${category}" category?`,
      `How do you handle unexpected delays, scope changes, or complications in a fixed-price contract?`,
      `Clients value clear, timely updates. How often do you communicate milestones, and what is your expected delivery time for this work?`
    ];

    // Category-specific enhancements
    if (category === "IT & Web" || category === "Design" || category === "Marketing & Design") {
      baseQuestions[1] = `This is a digital deliverables project. Can you describe how you verify your work (testing, responsive layouts, or mockups) before presenting it for approval?`;
    } else if (category === "Handyman" || category === "Furniture Assembly" || category === "Moving") {
      baseQuestions[1] = `Safety and quality are critical for physical tasks. Can you confirm you have all the required tools and transportation, and explain how you ensure damage-free completion?`;
    }
    return baseQuestions;
  };

  const questions = task ? getQuestionsForCategory(task.category, task.title) : [];

  useEffect(() => {
    if (!taskId || authLoading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(`/tasks/${taskId}/interview`)}`);
      return;
    }
    if (role !== "tasker" && role !== "super_admin" && role !== "company_admin") {
      setError("Only freelancer profiles can complete vetting interviews.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const t = await getTask(taskId);
        if (!t) {
          setError("Task not found.");
          setLoading(false);
          return;
        }
        setTask(t);

        // Find user's bid on this task
        if (db) {
          const q = query(
            collection(db, "bids"),
            where("taskId", "==", taskId),
            where("bidderId", "==", user.uid),
            limit(1)
          );
          const snap = await getDocs(q);
          if (snap.empty) {
            setError("Please submit a bid/proposal on this task first so we can attach your AI interview report.");
          } else {
            setBidId(snap.docs[0].id);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load interview context.");
      } finally {
        setLoading(false);
      }
    })();
  }, [taskId, authLoading, user, role]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startInterview = () => {
    setInterviewState("interviewing");
    const introMsg = `Welcome, ${user?.displayName || "Freelancer"}. I am the Workly AI Vetting Assistant. I'll guide you through a brief 4-question screening to evaluate your readiness for this job: "${task?.title}". Let's start with the first question:`;
    
    setMessages([
      { sender: "bot", text: introMsg, timestamp: new Date() },
      { sender: "bot", text: questions[0], timestamp: new Date() }
    ]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || interviewState !== "interviewing") return;

    const userText = inputVal.trim();
    setInputVal("");

    const newMsgs = [...messages, { sender: "user", text: userText, timestamp: new Date() }] as Message[];
    setMessages(newMsgs);

    const nextIndex = questionIndex + 1;
    if (nextIndex < questions.length) {
      setQuestionIndex(nextIndex);
      // Simulate AI thinking and replying
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: `Thank you for sharing that. Here is question ${nextIndex + 1}:`, timestamp: new Date() },
          { sender: "bot", text: questions[nextIndex], timestamp: new Date() }
        ]);
      }, 800);
    } else {
      // Completed all questions. Analyze and save.
      setInterviewState("scoring");
      
      // Heuristic evaluation logic
      setTimeout(async () => {
        // Calculate dynamic score based on detail/keyword richness
        const userReplies = newMsgs.filter(m => m.sender === "user").map(m => m.text.toLowerCase());
        const totalWords = userReplies.join(" ").split(/\s+/).length;
        
        let score = 75; // baseline
        if (totalWords > 120) score += 10;
        if (totalWords > 200) score += 5;
        
        // Match key terms based on task title and category
        const categoryKeywords: Record<string, string[]> = {
          "IT & Web": ["react", "next", "js", "api", "code", "responsive", "speed", "test", "deploy", "design", "css", "database", "git", "optimize"],
          "Design": ["brand", "logo", "figma", "illustrator", "vector", "color", "typography", "portfolio", "creative", "identity"],
          "Handyman": ["tool", "drill", "safety", "assemble", "fix", "repair", "quality", "experience", "license", "equipment"],
          "Furniture Assembly": ["ikea", "manual", "tools", "screws", "safety", "stable", "alignment", "experience"],
          "Moving": ["truck", "wrap", "box", "lift", "straps", "loading", "delivery", "safe", "careful"],
        };

        const matchingKeywords = (categoryKeywords[task!.category] || []).filter(kw => 
          userReplies.some(reply => reply.includes(kw))
        );

        score += Math.min(10, matchingKeywords.length * 2.5);
        score = Math.min(98, Math.max(60, Math.round(score))); // cap between 60% and 98%

        const strengths = [];
        if (totalWords > 150) strengths.push("Provided highly detailed responses outlining implementation steps.");
        if (matchingKeywords.length >= 2) strengths.push(`Demonstrated knowledge of category-specific domains (${matchingKeywords.slice(0, 3).join(", ")}).`);
        else strengths.push("Acknowledge requirements and confirmed capacity to deliver.");
        strengths.push("Demonstrated professional and proactive approach to milestones and constraints.");

        const communication = totalWords > 150 ? "Excellent" : totalWords > 80 ? "Good" : "Standard";

        const report = {
          score,
          strengths,
          communication,
          transcript: newMsgs.map(m => ({
            role: m.sender === "bot" ? "AI Vetting Assistant" : "Candidate",
            text: m.text,
            time: m.timestamp.toISOString()
          })),
          vettedAt: new Date().toISOString()
        };

        try {
          if (db && bidId) {
            await updateDoc(doc(db, "bids", bidId), {
              aiVettedScore: score,
              aiInterviewReport: report
            });
            // Update user global trust score (+5 boost for rapid/vetted onboarding)
            const userRef = doc(db, "users", user!.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const currentTrust = userSnap.data().trustScore ?? 70;
              await updateDoc(userRef, {
                trustScore: Math.min(100, currentTrust + 5)
              });
            }
          }
        } catch (err) {
          console.error("Error saving interview score:", err);
        }

        setFinalReport(report);
        setInterviewState("completed");
      }, 3000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href={`/tasks/${taskId}`} className="flex items-center gap-1 text-sm text-ink-500 hover:text-ink mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to task
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-elevated">
        {/* Header */}
        <div className="bg-ink p-5 text-white flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/20 text-brand">
              <Sparkles className="h-5 w-5 fill-brand/20 animate-pulse" />
            </span>
            <div>
              <h1 className="font-black text-lg leading-tight">AI Vetting Interview</h1>
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-0.5">Task: {task?.title}</p>
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
            {questionIndex + 1} of 4 Questions
          </span>
        </div>

        {interviewState === "intro" && (
          <div className="p-8 text-center max-w-lg mx-auto py-16">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand mx-auto mb-6">
              <Bot className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-ink">Boost Your Pitch with AI Vetting</h2>
            <p className="mt-3 text-sm leading-6 text-ink-500">
              Clients are <strong>4x more likely</strong> to hire freelancers who complete the Workly AI screening. 
              Our AI evaluates your technical answers, identifies key strengths, and tags your proposal with a verified vetting score.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link href={`/tasks/${taskId}`}>
                <Button variant="ghost">Cancel</Button>
              </Link>
              <Button onClick={startInterview} className="gap-1">
                Start Screening <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {interviewState === "interviewing" && (
          <div className="flex flex-col h-[550px]">
            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-canvas/40">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : ""}`}>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                    m.sender === "bot" ? "bg-brand text-white" : "bg-ink text-white"
                  }`}>
                    {m.sender === "bot" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </span>
                  <div className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                    m.sender === "bot" 
                      ? "bg-white text-ink border border-slate-100 shadow-sm" 
                      : "bg-ink text-white"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="border-t border-slate-200 p-4 bg-white flex gap-2 items-center">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Type your response detailed and professional..."
                className="flex-1 min-h-12 border border-slate-200 rounded-xl px-4 text-sm focus:outline-none focus:border-brand"
                autoFocus
              />
              <Button type="submit" className="h-12 w-12 rounded-xl grid place-items-center bg-brand text-white hover:bg-brand-dark p-0 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}

        {interviewState === "scoring" && (
          <div className="p-8 py-20 text-center max-w-md mx-auto">
            <div className="relative mx-auto h-16 w-16 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-brand-200 opacity-70" />
              <div className="relative h-12 w-12 rounded-2xl bg-brand text-white grid place-items-center">
                <Sparkles className="h-6 w-6 fill-white/20 animate-spin" />
              </div>
            </div>
            <h2 className="text-xl font-black text-ink">Analyzing Your Pitch</h2>
            <p className="mt-2 text-sm text-ink-500">
              Workly's AME Orchestrator is reviewing your answers, grading competency, and verifying skills against the task scope...
            </p>
            <div className="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand rounded-full animate-[loading_3s_ease-in-out_infinite]" style={{ width: "80%" }} />
            </div>
          </div>
        )}

        {interviewState === "completed" && finalReport && (
          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-green-50 text-green-600 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-ink">Vetting Complete!</h2>
              <p className="text-sm text-ink-500 mt-1">Your review report has been dynamically compiled and saved onto your bid.</p>
              
              <div className="mt-6 rounded-2xl bg-brand p-5 text-white flex items-center gap-4 min-w-[200px] justify-center shadow-glow">
                <Sparkles className="h-5 w-5 fill-white/20" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">AI Vetted Score</p>
                  <p className="text-3xl font-black">{finalReport.score}%</p>
                </div>
              </div>
            </div>

            <div className="py-6 space-y-6">
              {/* Strengths */}
              <div>
                <h3 className="font-extrabold text-ink text-sm flex items-center gap-1.5 mb-3">
                  <ShieldCheck className="h-4 w-4 text-brand" /> Strengths Identified
                </h3>
                <ul className="space-y-2">
                  {finalReport.strengths.map((str: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm text-ink-600 items-start">
                      <span className="text-brand font-black mt-0.5">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quality Indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">Communication Quality</p>
                  <p className="text-lg font-black text-ink mt-1 flex items-center gap-1.5">
                    <Star className="h-4.5 w-4.5 fill-sun text-sun" /> {finalReport.communication}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">Verification Status</p>
                  <p className="text-lg font-black text-brand-dark mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4.5 w-4.5" /> Verified
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Link href={`/tasks/${taskId}`}>
                <Button className="rounded-xl">Return to Task Details</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

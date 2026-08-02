"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Gavel,
  LayoutDashboard,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { listTasksByPoster, listBidsByUser, listPublicTasks, getTask, type Task, type Bid } from "@/lib/tasks";
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import { formatPKR } from "@/lib/format";
import { computeBidMatch, rankScore } from "@/lib/matching";

type BidWithTask = Bid & { task?: Task | null };
type View = "client" | "tasker";

export default function DashboardPage() {
  const { user, role, loading } = useAuth();
  const [posted, setPosted] = useState<Task[]>([]);
  const [opportunities, setOpportunities] = useState<Task[]>([]);
  const [myBids, setMyBids] = useState<BidWithTask[]>([]);
  const [recommendedTasks, setRecommendedTasks] = useState<(Task & { matchPercent: number })[]>([]);
  const [recommendedTalent, setRecommendedTalent] = useState<any[]>([]);
  const [wallet, setWallet] = useState(0);
  const [busy, setBusy] = useState(true);
  const [view, setView] = useState<View>("client");

  useEffect(() => {
    if (role === "tasker") setView("tasker");
    else setView("client");
  }, [role]);

  useEffect(() => {
    if (loading || !user || !role) return;
    (async () => {
      try {
        if (role === "tasker") {
          const [available, bids] = await Promise.all([listPublicTasks(), listBidsByUser(user.uid)]);
          const withTasks = await Promise.all(bids.map(async (bid) => ({ ...bid, task: await getTask(bid.taskId) })));
          const openOpportunities = available.filter((task) => task.status === "open");
          setOpportunities(openOpportunities);
          setMyBids(withTasks);
          setPosted([]);

          // AI recommended tasks based on freelancer skills
          if (db) {
            const userSnap = await getDoc(doc(db, "users", user.uid));
            const freelancerSkills = userSnap.exists() ? (userSnap.data().skills || []) : [];
            const trust = userSnap.exists() ? (userSnap.data().trustScore ?? 70) : 70;
            const success = userSnap.exists() ? (userSnap.data().successRate ?? 80) : 80;

            const scored = openOpportunities.map((task) => {
              const match = computeBidMatch(task, { trust, success, skills: freelancerSkills });
              return { ...task, matchPercent: match.percent };
            });
            scored.sort((a, b) => b.matchPercent - a.matchPercent);
            setRecommendedTasks(scored.slice(0, 5));
          }
        } else {
          const postedTasks = await listTasksByPoster(user.uid);
          setPosted(postedTasks);
          setOpportunities([]);
          setMyBids([]);

          // AI recommended talent matching the client's task categories
          if (db) {
            const clientCategories = Array.from(new Set(postedTasks.map((t) => t.category)));
            const q = query(collection(db, "users"), where("role", "==", "tasker"), limit(20));
            const snap = await getDocs(q);
            const allFreelancers = snap.docs
              .map((d) => ({ uid: d.id, ...d.data() } as any))
              .filter((f) => f.uid !== user.uid);

            const scored = allFreelancers.map((f) => {
              const overlappingSkills = (f.skills || []).filter((s: string) =>
                clientCategories.includes(s) ||
                clientCategories.some(
                  (cat) =>
                    s.toLowerCase().includes(cat.toLowerCase()) ||
                    cat.toLowerCase().includes(s.toLowerCase())
                )
              );
              const similarity = overlappingSkills.length > 0 ? 0.95 : 0.45;
              const trust = f.trustScore ?? 70;
              const success = f.successRate ?? 80;
              const score = rankScore({ similarity, trust, success });
              return { ...f, matchPercent: Math.round(score * 100) };
            });
            scored.sort((a, b) => b.matchPercent - a.matchPercent);
            setRecommendedTalent(scored.slice(0, 5));
          }
        }
      } catch (err) {
        console.error("Dashboard data load error", err);
        setPosted([]);
        setOpportunities([]);
        setMyBids([]);
      }
      try {
        if (db) {
          const s = await getDoc(doc(db, "users", user.uid));
          if (s.exists()) setWallet(s.data().wallet ?? 0);
        }
      } catch {}
      setBusy(false);
    })();
  }, [loading, user, role]);

  if (!loading && !user) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }
  if (loading || !user) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" /></div>;

  const isAdmin = role === "moderator" || role === "company_admin" || role === "super_admin";
  const canPost = role === "customer" || role === "company_admin" || role === "super_admin";
  const activePosted = posted.filter(t => ["open", "assigned", "in_progress"].includes(t.status));
  const selectedBids = myBids.filter(b => b.status === "selected");
  const clientSpent = posted.filter(t => t.paymentReleased).reduce((sum, task) => sum + (task.heldAmount || 0), 0);
  const taskerEarned = selectedBids.filter(b => b.task?.paymentReleased).reduce((sum, bid) => sum + Math.round(bid.amount * 0.85), 0);

  const clientStats = [
    { icon: BriefcaseBusiness, label: "Tasks posted", value: posted.length, tone: "bg-brand-50 text-brand" },
    { icon: Clock3, label: "Active now", value: activePosted.length, tone: "bg-blue-50 text-blue-600" },
    { icon: CheckCircle2, label: "Completed", value: posted.filter(t => t.status === "completed").length, tone: "bg-emerald-50 text-emerald-600" },
    { icon: Wallet, label: "Total released", value: formatPKR(clientSpent), tone: "bg-amber-50 text-amber-700" },
  ];
  const taskerStats = [
    { icon: Gavel, label: "Offers sent", value: myBids.length, tone: "bg-brand-50 text-brand" },
    { icon: BadgeCheck, label: "Jobs won", value: selectedBids.length, tone: "bg-blue-50 text-blue-600" },
    { icon: CheckCircle2, label: "Completed", value: selectedBids.filter(b => b.task?.status === "completed").length, tone: "bg-emerald-50 text-emerald-600" },
    { icon: Wallet, label: "Earned", value: formatPKR(taskerEarned), tone: "bg-amber-50 text-amber-700" },
  ];
  const stats = view === "client" ? clientStats : taskerStats;
  const rows = view === "client" ? posted : opportunities;

  return (
    <div className="bg-canvas py-8 sm:py-10">
      <div className="page-shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-brand-dark"><LayoutDashboard className="h-4 w-4" /> Workspace</div>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-ink sm:text-4xl">Good to see you, {(user.displayName || user.email || "there").split(" ")[0]}.</h1>
            <p className="mt-2 text-sm font-medium text-ink-500">Everything that needs your attention, in one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && <Link href="/admin"><Button variant="ghost" className="gap-2"><ShieldCheck className="h-4 w-4" /> Admin control</Button></Link>}
            {canPost && <Link href="/post"><Button className="gap-2"><Plus className="h-4 w-4" /> Post a task</Button></Link>}
          </div>
        </div>

        <div className="mt-7 inline-flex rounded-2xl border border-ink-100 bg-white px-5 py-3 text-sm font-extrabold text-ink shadow-card">
          {isAdmin ? "Operations workspace" : view === "client" ? "Client workspace" : "Freelancer workspace"}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="surface p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${stat.tone}`}><stat.icon className="h-5 w-5" /></span>
                <div className="min-w-0"><p className="truncate text-lg font-black tracking-[-0.025em] text-ink sm:text-xl">{stat.value}</p><p className="mt-0.5 text-[11px] font-bold text-ink-400">{stat.label}</p></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          <section className="surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-100 p-5 sm:p-6">
              <div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-ink-400">{view === "client" ? "Client workspace" : "Freelancer workspace"}</p><h2 className="mt-1 text-xl font-black text-ink">{view === "client" ? "Your tasks" : "Tasks you can bid on"}</h2></div>
              <Link href={view === "client" ? "/post" : "/tasks"} className="flex items-center gap-1.5 text-xs font-extrabold text-brand-dark">{view === "client" ? "Post new" : "Find work"} <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>

            {busy ? (
              <div className="space-y-3 p-6">{[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-2xl bg-ink-50" />)}</div>
            ) : rows.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink-50 text-ink-300">{view === "client" ? <BriefcaseBusiness className="h-5 w-5" /> : <Search className="h-5 w-5" />}</span>
                <h3 className="mt-4 font-black text-ink">{view === "client" ? "No tasks posted yet" : "No open tasks right now"}</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink-500">{view === "client" ? "Post your first task and let Workly route it to the right professionals." : "New client tasks will appear here as soon as they are approved."}</p>
                <Link href={view === "client" ? "/post" : "/tasks"} className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-dark">{view === "client" ? "Post a task" : "Browse work"} <ArrowRight className="h-4 w-4" /></Link>
              </div>
            ) : (
              <div className="divide-y divide-ink-100">
                {view === "client" ? posted.slice(0, 8).map(task => (
                  <Link key={task.id} href={`/tasks/${task.id}`} className="group flex items-center gap-4 p-5 transition hover:bg-ink-50/70 sm:p-6">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand"><BriefcaseBusiness className="h-5 w-5" /></span>
                    <div className="min-w-0 flex-1"><p className="truncate font-black text-ink group-hover:text-brand-dark">{task.title}</p><p className="mt-1 text-xs font-semibold text-ink-400">{formatPKR(task.budget)} - {task.bidsCount} offers</p></div>
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase ${task.status === "pending" ? "bg-amber-50 text-amber-700" : task.status === "completed" ? "bg-green-50 text-green-700" : "bg-brand-50 text-brand-dark"}`}>{task.status.replace("_", " ")}</span>
                    <ArrowRight className="hidden h-4 w-4 text-ink-300 transition group-hover:translate-x-1 group-hover:text-brand sm:block" />
                  </Link>
                )) : opportunities.slice(0, 8).map(task => (
                  <Link key={task.id} href={`/tasks/${task.id}`} className="group flex items-center gap-4 p-5 transition hover:bg-ink-50/70 sm:p-6">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><Gavel className="h-5 w-5" /></span>
                    <div className="min-w-0 flex-1"><p className="truncate font-black text-ink group-hover:text-brand-dark">{task.title}</p><p className="mt-1 truncate text-xs font-semibold text-ink-400">{task.category} · {task.location} · {task.bidsCount} offers</p></div>
                    <div className="text-right"><p className="text-sm font-black text-ink">{formatPKR(task.budget)}</p><p className="mt-1 text-[10px] font-black uppercase text-brand-dark">Bid now</p></div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-elevated">
              <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-brand"><Sparkles className="h-5 w-5" /></span><TrendingUp className="h-5 w-5 text-brand-light" /></div>
              <h2 className="mt-5 text-xl font-black">{view === "client" ? "Smarter hiring" : "Win better-fit work"}</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">{view === "client" ? "Workly ranks incoming offers using skill fit, trust and success history." : "Complete your skills and trust profile to improve your AI match position."}</p>
              <Link href={view === "client" ? "/post" : "/profile"} className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-brand-300">{view === "client" ? "Post a well-scoped task" : "Improve your profile"} <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            <Link href="/wallet" className="surface group flex items-center gap-4 p-5 transition hover:border-brand-200">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-700"><Wallet className="h-5 w-5" /></span>
              <div className="flex-1"><p className="text-xs font-bold text-ink-400">Available balance</p><p className="mt-1 text-lg font-black text-ink">{formatPKR(wallet)}</p></div>
              <ArrowRight className="h-4 w-4 text-ink-300 transition group-hover:translate-x-1 group-hover:text-brand" />
            </Link>
          </aside>
        </div>

        {/* AI Recommendations Section */}
        <div className="mt-8">
          {view === "tasker" ? (
            <section className="surface overflow-hidden">
              <div className="flex items-center justify-between border-b border-ink-100 p-5 sm:p-6 bg-gradient-to-r from-brand-50/40 to-transparent">
                <div>
                  <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] text-brand">
                    <Sparkles className="h-3.5 w-3.5 fill-brand/20" /> AI Recommended
                  </p>
                  <h2 className="mt-1 text-xl font-black text-ink">Handpicked tasks matching your skills</h2>
                </div>
                <Link href="/profile" className="text-xs font-extrabold text-brand-dark hover:underline">Update skills</Link>
              </div>
              {recommendedTasks.length === 0 ? (
                <p className="p-6 text-sm font-medium text-ink-500">No matching tasks found. Try adding more skills to your profile!</p>
              ) : (
                <div className="divide-y divide-ink-100">
                  {recommendedTasks.map((task) => (
                    <Link key={task.id} href={`/tasks/${task.id}`} className="group flex items-center gap-4 p-5 transition hover:bg-brand-50/20 sm:p-6">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand"><Sparkles className="h-5 w-5" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-black text-ink group-hover:text-brand-dark">{task.title}</p>
                        <p className="mt-1 truncate text-xs font-semibold text-ink-400">{task.category} · {task.location} · {task.bidsCount} offers</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-brand-dark">{task.matchPercent}% Match</p>
                        <p className="mt-0.5 text-xs font-semibold text-ink-500">{formatPKR(task.budget)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section className="surface overflow-hidden">
              <div className="flex items-center justify-between border-b border-ink-100 p-5 sm:p-6 bg-gradient-to-r from-brand-50/40 to-transparent">
                <div>
                  <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] text-brand">
                    <Sparkles className="h-3.5 w-3.5 fill-brand/20" /> AI Recommended
                  </p>
                  <h2 className="mt-1 text-xl font-black text-ink">Top talent matched for your projects</h2>
                </div>
                <Link href="/tasks" className="text-xs font-extrabold text-brand-dark hover:underline">Browse all tasks</Link>
              </div>
              {recommendedTalent.length === 0 ? (
                <p className="p-6 text-sm font-medium text-ink-500">Post a task first to get tailored talent recommendations!</p>
              ) : (
                <div className="divide-y divide-ink-100">
                  {recommendedTalent.map((freelancer) => (
                    <div key={freelancer.uid} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 hover:bg-brand-50/5 transition">
                      <div className="flex items-start gap-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand text-white font-black text-lg">
                          {freelancer.avatarUrl ? (
                            <img src={freelancer.avatarUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                          ) : (
                            (freelancer.name || "F")[0].toUpperCase()
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-extrabold text-ink">{freelancer.name}</h3>
                            {freelancer.trustScore >= 80 && <BadgeCheck className="h-4 w-4 text-brand" />}
                            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-dark">{freelancer.matchPercent}% AI Match</span>
                          </div>
                          <p className="text-xs font-semibold text-ink-400">{freelancer.professionalTitle || "Freelancer"}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {(freelancer.skills || []).slice(0, 3).map((s: string) => (
                              <span key={s} className="rounded-full bg-ink-50 px-2.5 py-1 text-[10px] font-extrabold text-ink-500">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 justify-between sm:justify-end shrink-0">
                        <div className="text-left sm:text-right">
                          <div className="flex items-center gap-1 text-sm font-bold text-ink">
                            <Star className="h-4 w-4 fill-sun text-sun" />
                            <span>{freelancer.trustScore ?? 70} Trust</span>
                          </div>
                          <p className="mt-0.5 text-xs text-ink-400">{freelancer.successRate ?? 80}% success rate</p>
                        </div>
                        <Link href={`/u/${freelancer.uid}`}>
                          <Button variant="ghost" className="text-xs h-9 rounded-xl border border-ink-100 hover:bg-ink-50">View Profile</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {view === "tasker" && (
          <section className="surface mt-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-100 p-5 sm:p-6">
              <div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-ink-400">Your activity</p><h2 className="mt-1 text-xl font-black text-ink">Offers you sent</h2></div>
              <Link href="/tasks" className="flex items-center gap-1.5 text-xs font-extrabold text-brand-dark">Find more work <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            {myBids.length === 0 ? <p className="p-6 text-sm font-medium text-ink-500">You have not sent an offer yet.</p> : (
              <div className="divide-y divide-ink-100">{myBids.slice(0, 8).map((bid) => (
                <Link key={bid.id} href={`/tasks/${bid.taskId}`} className="flex items-center gap-4 p-5 transition hover:bg-ink-50 sm:px-6">
                  <div className="min-w-0 flex-1"><p className="truncate font-black text-ink">{bid.task?.title || "Task"}</p><p className="mt-1 truncate text-xs text-ink-400">{bid.message || "Offer submitted"}</p></div>
                  <div className="text-right"><p className="text-sm font-black text-ink">{formatPKR(bid.amount)}</p><p className="mt-1 text-[10px] font-black uppercase text-ink-400">{bid.status}</p></div>
                </Link>
              ))}</div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

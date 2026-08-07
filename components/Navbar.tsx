"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LayoutGrid,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import BrandLogo from "@/components/BrandLogo";

export default function Navbar() {
  const { user, role, signOut } = useAuth();
  const router = useRouter();
  const isAdmin = role === "moderator" || role === "company_admin" || role === "super_admin";
  const canPost = role === "customer" || role === "company_admin" || role === "super_admin";
  const canFindWork = !user || role === "tasker";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/tasks?q=${encodeURIComponent(query.trim())}` : "/tasks");
    setMobileOpen(false);
  };

  const primaryLinks = (
    <>
      {canFindWork && (
        <Link href="/tasks" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white">
          <LayoutGrid className="h-4 w-4" /> Find work
        </Link>
      )}
      <Link href="/interview" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white">
        <Sparkles className="h-4 w-4" /> Skill Check
      </Link>
      {user ? (
        <>
          <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/messages" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white">
            <MessageSquare className="h-4 w-4" /> Messages
          </Link>
        </>
      ) : (
        <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white">
          <LogIn className="h-4 w-4" /> Log in
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-deep shadow-soft backdrop-blur-xl">
      <div className="page-shell flex h-[72px] items-center gap-4">
        <BrandLogo inverted compact />

        <form onSubmit={submitSearch} className="relative mx-auto hidden max-w-md flex-1 lg:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills, tasks or services..."
            className="min-h-11 w-full rounded-xl border border-white/15 bg-white/10 py-2.5 pl-11 pr-4 text-sm font-medium text-white placeholder:text-white/45 transition focus:border-mint-300 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-mint-300/30"
          />
        </form>

        <nav className="hidden items-center gap-1 xl:flex">{primaryLinks}</nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              {canPost && (
                <Link href="/post" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-mint px-5 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-mint-dark">
                  <Plus className="h-4 w-4" /> Post a task
                </Link>
              )}
              <Link href="/notifications" aria-label="Notifications" className="relative grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/10 text-white/75 transition hover:bg-white/15 hover:text-white">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-deep bg-mint" />
              </Link>
              <div className="relative">
                <button onClick={() => setAccountOpen(!accountOpen)} className="flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-2 pr-3 text-left transition hover:bg-white/15">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-mint text-xs font-black text-white">
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </span>
                  <span className="max-w-[100px] truncate text-xs font-extrabold text-white">{user.displayName || "Account"}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-white/50" />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-ink-100 bg-white p-2 shadow-elevated">
                    {isAdmin && <Link href="/admin" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-600 hover:bg-mint-50"><ShieldCheck className="h-4 w-4" /> Admin control</Link>}
                    <Link href="/wallet" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-600 hover:bg-mint-50"><Wallet className="h-4 w-4" /> Wallet</Link>
                    <Link href="/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-600 hover:bg-mint-50"><User className="h-4 w-4" /> Profile</Link>
                    <button onClick={() => { signOut(); setAccountOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" /> Sign out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/signup" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-mint px-5 text-sm font-extrabold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-mint-dark">
                <UserPlus className="h-4 w-4" /> Join Workly
              </Link>
              <Link href="/login" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-bold text-white transition hover:bg-white/10">
                Log in
              </Link>
            </>
          )}
        </div>

        <button className="grid h-11 w-11 place-items-center rounded-xl text-white transition hover:bg-white/10 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-deep px-4 pb-5 pt-3 lg:hidden">
          <form onSubmit={submitSearch} className="relative mb-3">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills, tasks or services..."
              className="min-h-11 w-full rounded-xl border border-white/15 bg-white/10 py-2.5 pl-11 pr-4 text-sm font-medium text-white placeholder:text-white/45 focus:border-mint-300 focus:outline-none"
            />
          </form>
          <nav className="flex flex-col gap-1">
            {primaryLinks}
            {user ? (
              <>
                {canPost && <Link href="/post" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl bg-mint px-3 py-3 text-sm font-extrabold text-white"><Plus className="h-4 w-4" /> Post a task</Link>}
                <Link href="/wallet" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white/75"><Wallet className="h-4 w-4" /> Wallet</Link>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white/75"><User className="h-4 w-4" /> Profile</Link>
                {canFindWork && <Link href="/interview" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white/75"><Sparkles className="h-4 w-4" /> AI Skill Check</Link>}
                {isAdmin && <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white/75"><ShieldCheck className="h-4 w-4" /> Admin control</Link>}
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-400"><LogOut className="h-4 w-4" /> Sign out</button>
              </>
            ) : (
              <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl bg-mint px-3 py-3 text-sm font-extrabold text-white"><UserPlus className="h-4 w-4" /> Join Workly</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

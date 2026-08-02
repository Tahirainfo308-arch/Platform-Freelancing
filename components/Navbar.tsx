"use client";

import { useState } from "react";
import Link from "next/link";
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
  ShieldCheck,
  User,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import BrandLogo from "@/components/BrandLogo";

export default function Navbar() {
  const { user, role, signOut } = useAuth();
  const isAdmin = role === "moderator" || role === "company_admin" || role === "super_admin";
  const canPost = role === "customer" || role === "company_admin" || role === "super_admin";
  const canFindWork = !user || role === "tasker";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const navLinks = (
    <div className="flex items-center gap-2">
      {canPost && (
        <Link href="/post" onClick={() => setMobileOpen(false)} className="inline-flex h-10 items-center justify-center rounded-full bg-brand px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-brand-dark">
          Post a task
        </Link>
      )}
      <Link href="/tasks" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-ink-700 transition hover:bg-slate-100 hover:text-brand">
        Browse tasks
      </Link>
      {user && (
        <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-ink-700 transition hover:bg-slate-100 hover:text-brand">
          My tasks
        </Link>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <BrandLogo compact />
          <nav className="hidden items-center lg:flex">{navLinks}</nav>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/help" className="text-xs font-bold text-ink-500 hover:text-brand">Help</Link>
          {user ? (
            <>
              <Link href="/notifications" aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full text-ink-600 transition hover:bg-slate-100">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand" />
              </Link>
              <Link href="/messages" aria-label="Messages" className="grid h-10 w-10 place-items-center rounded-full text-ink-600 transition hover:bg-slate-100">
                <MessageSquare className="h-4 w-4" />
              </Link>
              <div className="relative">
                <button onClick={() => setAccountOpen(!accountOpen)} className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 transition hover:bg-slate-100">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs font-black text-white">
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    {isAdmin && <Link href="/admin" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-600 hover:bg-slate-50"><ShieldCheck className="h-4 w-4" /> Admin control</Link>}
                    <Link href="/wallet" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-600 hover:bg-slate-50"><Wallet className="h-4 w-4" /> Wallet</Link>
                    <Link href="/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-600 hover:bg-slate-50"><User className="h-4 w-4" /> Profile</Link>
                    <button onClick={() => { signOut(); setAccountOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" /> Sign out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-sm font-bold text-ink-700 hover:text-brand">Log in</Link>
              <Link href="/signup" className="inline-flex h-9 items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-extrabold text-white transition hover:bg-brand">Join Workly</Link>
            </div>
          )}
        </div>

        <button className="grid h-11 w-11 place-items-center rounded-xl text-ink-500 transition hover:bg-ink-50 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 lg:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks}
            {user ? (
              <div className="flex flex-col gap-1 border-t border-slate-100 pt-2">
                <Link href="/wallet" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-ink-600"><Wallet className="h-4 w-4" /> Wallet</Link>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-ink-600"><User className="h-4 w-4" /> Profile</Link>
                {isAdmin && <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-ink-600"><ShieldCheck className="h-4 w-4" /> Admin control</Link>}
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-600"><LogOut className="h-4 w-4" /> Sign out</button>
              </div>
            ) : (
              <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex items-center justify-center rounded-full bg-slate-900 px-3 py-2.5 text-sm font-extrabold text-white">Join Workly</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

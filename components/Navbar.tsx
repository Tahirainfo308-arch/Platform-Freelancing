"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  ShieldCheck,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import BrandLogo from "@/components/BrandLogo";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Find Talent", href: "/#talent" },
  { label: "Find Jobs", href: "/tasks" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "AI Features", href: "/#ai" },
  { label: "Categories", href: "/#categories" },
  { label: "About Us", href: "/#why" },
];

export default function Navbar() {
  const { user, role, signOut } = useAuth();
  const isAdmin = role === "moderator" || role === "company_admin" || role === "super_admin";
  const canPost = role === "customer" || role === "company_admin" || role === "super_admin";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const close = () => {
    setMobileOpen(false);
    setAccountOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-deep shadow-soft backdrop-blur-xl">
      <div className="page-shell flex h-[72px] items-center gap-4">
        <BrandLogo inverted compact />

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} onClick={close} className="rounded-xl px-3 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              {canPost && (
                <Link href="/post" onClick={close} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-mint px-5 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-mint-dark">
                  <Plus className="h-4 w-4" /> Post a Job
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
                    {isAdmin && <Link href="/admin" onClick={close} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-600 hover:bg-mint-50"><ShieldCheck className="h-4 w-4" /> Admin control</Link>}
                    <Link href="/wallet" onClick={close} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-600 hover:bg-mint-50"><Wallet className="h-4 w-4" /> Wallet</Link>
                    <Link href="/profile" onClick={close} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-600 hover:bg-mint-50"><User className="h-4 w-4" /> Profile</Link>
                    <button onClick={() => { signOut(); close(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" /> Sign out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" onClick={close} className="inline-flex min-h-11 items-center rounded-xl border border-white/20 px-5 text-sm font-bold text-white transition hover:bg-white/10">Log In</Link>
              <Link href="/signup" onClick={close} className="inline-flex min-h-11 items-center rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15">Sign Up</Link>
              <Link href="/post" onClick={close} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-mint px-5 text-sm font-extrabold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-mint-dark"><Plus className="h-4 w-4" /> Post a Job</Link>
            </>
          )}
        </div>

        <button className="grid h-11 w-11 place-items-center rounded-xl text-white transition hover:bg-white/10 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-deep px-4 pb-5 pt-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} onClick={close} className="rounded-xl px-3 py-2.5 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white">
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <Link href="/dashboard" onClick={close} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-white/75"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                <Link href="/messages" onClick={close} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-white/75"><MessageSquare className="h-4 w-4" /> Messages</Link>
                {isAdmin && <Link href="/admin" onClick={close} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-white/75"><ShieldCheck className="h-4 w-4" /> Admin control</Link>}
              </>
            )}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
            {user ? (
              <>
                {canPost && <Link href="/post" onClick={close} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-mint px-5 text-sm font-extrabold text-white"><Plus className="h-4 w-4" /> Post a Job</Link>}
                <Link href="/wallet" onClick={close} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-5 text-sm font-bold text-white">Wallet</Link>
                <Link href="/profile" onClick={close} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-5 text-sm font-bold text-white">Profile</Link>
                <button onClick={() => { signOut(); close(); }} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-5 text-sm font-bold text-red-300">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={close} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-5 text-sm font-bold text-white">Log In</Link>
                <Link href="/signup" onClick={close} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-bold text-white">Sign Up</Link>
                <Link href="/post" onClick={close} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-mint px-5 text-sm font-extrabold text-white"><Plus className="h-4 w-4" /> Post a Job</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

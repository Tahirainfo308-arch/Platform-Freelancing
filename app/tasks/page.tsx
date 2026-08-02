"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  ChevronDown,
  List,
  Map as MapIcon,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { listPublicTasks, CATEGORIES, type Task } from "@/lib/tasks";
import TaskCard from "@/components/TaskCard";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

// Dynamic import for client-only Leaflet map component
const TaskMap = dynamic(() => import("@/components/TaskMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-sm font-bold">
      Loading Task Map...
    </div>
  ),
});

const DEMO_TASKS: Task[] = [
  {
    id: "demo-1",
    title: "Transport a sofa",
    description: "Need help moving a 3-seater sofa from Randwick to Maroubra.",
    category: "Moving",
    budget: 50,
    location: "Randwick NSW",
    deadline: "Tomorrow • Midday",
    posterId: "poster-1",
    posterName: "Sarah M.",
    status: "open",
    visibility: "public",
    approvalMode: "auto",
    bidsCount: 0,
    createdAt: new Date(),
  },
  {
    id: "demo-2",
    title: "Desk build",
    description: "Assemble IKEA Bekant standing desk in apartment.",
    category: "Furniture Assembly",
    budget: 50,
    location: "Bondi Beach, NSW",
    deadline: "Tomorrow • Anytime",
    posterId: "poster-2",
    posterName: "David K.",
    status: "open",
    visibility: "public",
    approvalMode: "auto",
    bidsCount: 2,
    createdAt: new Date(),
  },
  {
    id: "demo-3",
    title: "AI Software Development for Custom Business Automation Solutions",
    description: "Build Python/Next.js script to automate invoice processing and data extraction.",
    category: "IT & Web",
    budget: 30,
    location: "Remote / Anywhere",
    deadline: "Flexible timing",
    posterId: "poster-3",
    posterName: "Alex R.",
    status: "open",
    visibility: "public",
    approvalMode: "auto",
    bidsCount: 5,
    createdAt: new Date(),
  },
  {
    id: "demo-4",
    title: "House cleaning 3 bedrooms 2 bathrooms",
    description: "Deep clean needed including kitchen counters and bathrooms.",
    category: "Cleaning",
    budget: 140,
    location: "Sydney NSW",
    deadline: "This weekend",
    posterId: "poster-4",
    posterName: "Emma W.",
    status: "open",
    visibility: "public",
    approvalMode: "auto",
    bidsCount: 3,
    createdAt: new Date(),
  },
  {
    id: "demo-5",
    title: "Fix leaking kitchen sink pipe",
    description: "Handyman or plumber needed to replace leaking rubber gasket.",
    category: "Handyman",
    budget: 80,
    location: "Parramatta NSW",
    deadline: "Today",
    posterId: "poster-5",
    posterName: "John D.",
    status: "open",
    visibility: "public",
    approvalMode: "auto",
    bidsCount: 1,
    createdAt: new Date(),
  },
];

export default function TasksPage() {
  const { role } = useAuth();
  const canPost = role === "customer" || role === "company_admin" || role === "super_admin";
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [locationType, setLocationType] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const load = async (cat?: string, q?: string) => {
    setLoading(true);
    try {
      const fetched = await listPublicTasks(cat ?? category, q ?? search);
      if (fetched && fetched.length > 0) {
        setTasks(fetched);
      } else {
        setTasks(DEMO_TASKS);
      }
    } catch {
      setTasks(DEMO_TASKS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialCategory = params.get("category") || "all";
    setCategory(CATEGORIES.includes(initialCategory) ? initialCategory : "all");
    load(CATEGORIES.includes(initialCategory) ? initialCategory : "all", "");
  }, []);

  const clearFilters = () => {
    setCategory("all");
    setSearch("");
    setPriceFilter("all");
    setLocationType("all");
    setSortOrder("newest");
    load("all", "");
  };

  const filteredTasks = tasks
    .filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchLoc = t.location.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc) return false;
      }
      if (priceFilter === "under50" && t.budget > 50) return false;
      if (priceFilter === "50to100" && (t.budget < 50 || t.budget > 100)) return false;
      if (priceFilter === "over100" && t.budget < 100) return false;
      if (locationType === "remote" && !t.location.toLowerCase().includes("remote")) return false;
      if (locationType === "in_person" && t.location.toLowerCase().includes("remote")) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "price_high") return b.budget - a.budget;
      if (sortOrder === "price_low") return a.budget - b.budget;
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-slate-100 overflow-hidden">
      {/* Top Filter Bar (Airtasker exact header structure) */}
      <div className="sticky top-0 z-30 flex shrink-0 items-center border-b border-slate-200 bg-white px-4 py-2.5 shadow-xs sm:px-6">
        <div className="flex w-full items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Search Box */}
          <div className="relative shrink-0 w-64 sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search for a task"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-full bg-slate-100 pl-9 pr-4 text-xs font-semibold text-slate-900 placeholder:text-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Category Pill */}
          <div className="relative shrink-0">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 appearance-none rounded-full border border-slate-200 bg-white pl-4 pr-8 text-xs font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
            >
              <option value="all">Category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          </div>

          {/* Location & Remote Pill */}
          <div className="relative shrink-0">
            <select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value)}
              className="h-10 appearance-none rounded-full border border-slate-200 bg-white pl-4 pr-8 text-xs font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
            >
              <option value="all">Location & remotely</option>
              <option value="in_person">In-person only</option>
              <option value="remote">Remotely only</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          </div>

          {/* Price Pill */}
          <div className="relative shrink-0">
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="h-10 appearance-none rounded-full border border-slate-200 bg-white pl-4 pr-8 text-xs font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
            >
              <option value="all">Any price</option>
              <option value="under50">Under $50</option>
              <option value="50to100">$50 to $100</option>
              <option value="over100">$100+</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          </div>

          {/* Sort Pill */}
          <div className="relative shrink-0">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="h-10 appearance-none rounded-full border border-slate-200 bg-white pl-4 pr-8 text-xs font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_high">Sort: Highest price</option>
              <option value="price_low">Sort: Lowest price</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          </div>

          {/* Reset Filters */}
          {(category !== "all" || search || priceFilter !== "all" || locationType !== "all") && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 shrink-0 rounded-full px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear
            </button>
          )}

          <div className="ml-auto hidden sm:block shrink-0">
            {canPost && <Link href="/post" className="inline-flex h-9 items-center justify-center rounded-full bg-brand px-4 text-xs font-extrabold text-white shadow-xs transition hover:bg-brand-dark">
              <Plus className="mr-1 h-3.5 w-3.5" /> Post a task
            </Link>}
          </div>
        </div>
      </div>

      {/* Main Split Screen Body */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Column: Task List */}
        <div
          className={`w-full lg:w-[440px] xl:w-[480px] shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col ${
            mobileView === "map" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-3">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"} available
            </p>
          </div>

          {/* Task Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-36 rounded-2xl border border-slate-200 bg-white animate-pulse"
                  />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm font-extrabold text-slate-800">No tasks found</p>
                <p className="mt-1 text-xs text-slate-500">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center text-xs font-extrabold text-brand hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  isSelected={t.id === selectedTaskId}
                  onHover={() => setSelectedTaskId(t.id || null)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Interactive Map */}
        <div
          className={`flex-1 relative ${
            mobileView === "list" ? "hidden lg:block" : "block"
          }`}
        >
          <TaskMap
            tasks={filteredTasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={(id) => setSelectedTaskId(id)}
          />
        </div>
      </div>

      {/* Floating Mobile Toggle Button */}
      <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 lg:hidden">
        <button
          onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-black text-white shadow-xl transition hover:bg-brand"
        >
          {mobileView === "list" ? (
            <>
              <MapIcon className="h-4 w-4" /> Map view
            </>
          ) : (
            <>
              <List className="h-4 w-4" /> List view
            </>
          )}
        </button>
      </div>
    </div>
  );
}

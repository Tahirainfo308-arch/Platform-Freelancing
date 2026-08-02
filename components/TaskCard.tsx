import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin, MessageCircle, ShieldCheck, Tag } from "lucide-react";
import type { Task } from "@/lib/tasks";
import { formatPKR } from "@/lib/format";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  open: "bg-brand-50 text-brand-dark border-brand-200",
  assigned: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const catColors: Record<string, string> = {
  Cleaning: "bg-blue-50 text-blue-600",
  Handyman: "bg-orange-50 text-orange-600",
  Delivery: "bg-purple-50 text-purple-600",
  Gardening: "bg-green-50 text-green-600",
  "IT & Web": "bg-indigo-50 text-indigo-600",
  Design: "bg-pink-50 text-pink-600",
  Moving: "bg-amber-50 text-amber-600",
  "Pet Care": "bg-teal-50 text-teal-600",
  Tutoring: "bg-cyan-50 text-cyan-600",
  Other: "bg-gray-50 text-gray-600",
};

export default function TaskCard({
  task,
  isSelected,
  onHover,
}: {
  task: Task;
  isSelected?: boolean;
  onHover?: () => void;
}) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      onMouseEnter={onHover}
      className={`group block rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 ${
        isSelected
          ? "border-brand ring-2 ring-brand/20 bg-blue-50/20"
          : "border-slate-200 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-brand transition-colors line-clamp-2">
          {task.title}
        </h3>
        <div className="shrink-0 text-right">
          <span className="text-xl font-extrabold text-slate-900">
            {formatPKR(task.budget)}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{task.location || "Remote / Anywhere"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>{task.deadline || "Flexible timing"}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs capitalize text-brand">
            {task.status === "open" ? "Open" : task.status.replace("_", " ")}
          </span>
          {task.bidsCount > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-semibold">
                {task.bidsCount} {task.bidsCount === 1 ? "offer" : "offers"}
              </span>
            </>
          )}
        </div>
        <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
          {(task.posterName || "U")[0].toUpperCase()}
        </div>
      </div>
    </Link>
  );
}

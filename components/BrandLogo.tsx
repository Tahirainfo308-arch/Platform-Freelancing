import Link from "next/link";

export default function BrandLogo({
  href = "/",
  inverted = false,
  compact = false,
  className = "",
}: {
  href?: string;
  inverted?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} aria-label="Workly home" className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className={`grid shrink-0 place-items-center rounded-xl overflow-hidden ${compact ? "h-9 w-9 text-lg" : "h-10 w-10 text-xl"} ${inverted ? "bg-white text-brand" : "bg-brand shadow-sm"}`}>
        <img src="/workly-mark.png" alt="" className="h-[80%] w-[80%] object-contain" />
      </span>
      <span className={`font-black leading-none tracking-tight ${compact ? "text-xl" : "text-2xl"} ${inverted ? "text-white" : "text-brand"}`}>
        Workly
      </span>
    </Link>
  );
}

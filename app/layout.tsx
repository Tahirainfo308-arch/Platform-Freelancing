import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import AppShell from "@/components/AppShell";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const description = "Pakistan's beginner-first freelancing platform. Get your first freelance job, build trust, and grow with confidence.";

  return {
    metadataBase: new URL(origin),
    title: {
      default: "Workly - Pakistan's beginner-first freelancing platform",
      template: "%s | Workly",
    },
    description,
    icons: {
      icon: "/workly-mark.png",
      shortcut: "/workly-mark.png",
      apple: "/workly-mark.png",
    },
    openGraph: {
      type: "website",
      siteName: "Workly",
      title: "Your first freelance job starts here.",
      description,
      images: [{ url: `${origin}/og.png`, width: 1731, height: 909, alt: "Workly - Pakistan's beginner-first freelancing platform" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Your first freelance job starts here.",
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-canvas font-sans text-ink">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}

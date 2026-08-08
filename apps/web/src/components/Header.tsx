"use client";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-transparent">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo-horizontal.png"
              alt="Virlio"
              width={160}
              height={32}
              priority
            />
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted hover:underline">
              Features
            </Link>
            <Link href="/templates" className="text-sm text-muted hover:underline">
              Templates
            </Link>
            <Link href="/explore" className="text-sm text-muted hover:underline">
              Explore
            </Link>
            <Link href="/leaderboard" className="text-sm text-muted hover:underline">
              Leaderboard
            </Link>
            <Link href="/pricing" className="text-sm text-muted hover:underline">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted hover:underline">
              Sign In
            </Link>
            <Link
              href="/generate"
              className="rounded-full px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
            >
              Generate Free Meme
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

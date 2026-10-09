
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type NavbarProps = {
  email?: string;
  companyName?: string;
};

type NavIcon = "home" | "search" | "bookmark";

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: NavIcon;
  className?: string;
}) {
  const paths = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    bookmark: (
      <path d="M6 4h12a2 2 0 0 1 2 2v15l-8-5-8 5V6a2 2 0 0 1 2-2Z" />
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const links: {
  href: string;
  label: string;
  icon: NavIcon;
}[] = [
  { href: "/", label: "Dashboard", icon: "home" },
  { href: "/search", label: "Candidate Search", icon: "search" },
  { href: "/shortlists", label: "Shortlists", icon: "bookmark" },
];

export default function Navbar({
  email = "",
  companyName = "",
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const recruiterName = email
    ? email.split("@")[0].replace(/[._-]/g, " ")
    : "Recruiter";

  function isActive(href: string) {
    if (href === "/") return pathname === "/";

    if (href === "/search") {
      return (
        pathname === "/search" ||
        pathname.startsWith("/candidates/")
      );
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign out."
      );
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-indigo-100/50 bg-[#f7f8fc]/95 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-[24px] border border-indigo-100 bg-white px-5 py-3 shadow-[0_12px_40px_rgba(79,70,229,0.09)] lg:flex-nowrap lg:px-7">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xl font-extrabold text-white shadow-lg shadow-indigo-200">
            R
          </div>
          <div>
            <p className="text-base font-extrabold tracking-tight text-slate-900">
              Rotto Recruiter
            </p>
            <p className="text-xs font-medium text-slate-400">
              Talent Acquisition Platform
            </p>
          </div>
        </Link>

        <nav
          aria-label="Main navigation"
          className="order-3 flex w-full items-center gap-1 overflow-x-auto border-t border-slate-100 pt-3 lg:order-2 lg:w-auto lg:border-0 lg:pt-0"
        >
          {links.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm transition ${
                  active
                    ? "bg-indigo-50 font-bold text-indigo-700"
                    : "font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                <Icon name={link.icon} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="order-2 flex shrink-0 items-center gap-3 lg:order-3">
          <div className="hidden items-center gap-3 border-r border-slate-200 pr-4 sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600">
              {email ? email.charAt(0).toUpperCase() : "R"}
            </div>

            <div className="max-w-28">
              <p className="truncate text-sm font-bold capitalize text-slate-900">
                {recruiterName}
              </p>
              <p className="truncate text-xs text-slate-400">
                {companyName || "Recruiter Workspace"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm font-bold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5M21 12H9" />
            </svg>
            <span className="hidden sm:inline">
              {loggingOut ? "Signing out..." : "Sign Out"}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mx-auto mt-2 max-w-7xl rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}
    </header>
  );
}

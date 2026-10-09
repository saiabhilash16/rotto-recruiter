
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Company = {
  id: string;
  slug: string;
  plan: string;
  searches_used: number;
};

type DashboardStats = {
  shortlists: number | null;
  shortlistedCandidates: number | null;
};

type IconName =
  | "building"
  | "credit-card"
  | "users"
  | "search"
  | "bookmark"
  | "arrow-right"
  | "log-out"
  | "briefcase"
  | "sparkles"
  | "shield"
  | "check"
  | "chevron-right";

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const icons: Record<IconName, React.ReactNode> = {
    building: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 21V9h6v12M7 7h.01M17 7h.01" />
      </>
    ),
    "credit-card": (
      <>
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <path d="M2 10h20M6 15h4" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
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
    "arrow-right": <path d="M5 12h14m-6-6 6 6-6 6" />,
    "log-out": (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5M21 12H9" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9L12 3Z" />
        <path d="m19 18 .7 1.3L21 20l-1.3.7L19 22l-.7-1.3L17 20l1.3-.7L19 18Z" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    "chevron-right": <path d="m9 18 6-6-6-6" />,
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  accent = "indigo",
}: {
  title: string;
  value: string;
  description: string;
  icon: IconName;
  accent?: "indigo" | "violet" | "emerald" | "amber";
}) {
  const accentStyles = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>
          <p className="mt-3 break-words text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accentStyles[accent]}`}
        >
          <Icon name={icon} className="h-6 w-6" />
        </div>
      </div>

      <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  icon,
  action,
}: {
  href: string;
  title: string;
  description: string;
  icon: IconName;
  action: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/60"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
          <Icon name={icon} className="h-7 w-7" />
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
          <Icon name="arrow-right" className="h-4 w-4" />
        </div>
      </div>

      <h3 className="mt-7 text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-7 text-slate-500">
        {description}
      </p>

      <div className="mt-7 flex items-center gap-2 border-t border-slate-100 pt-5 text-sm font-semibold text-indigo-600">
        {action}
        <Icon name="chevron-right" className="h-4 w-4" />
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [company, setCompany] = useState<Company | null>(null);
  const [candidateCount, setCandidateCount] = useState<number | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    shortlists: null,
    shortlistedCandidates: null,
  });

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (!active) return;

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        setEmail(user.email ?? "");

        const { data: recruiter, error: recruiterError } =
          await supabase
            .from("recruiters")
            .select("company_id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (!active) return;

        if (recruiterError || !recruiter?.company_id) {
          throw new Error("Recruiter company not found.");
        }

        const { data: companyData, error: companyError } =
          await supabase
            .from("companies")
            .select("id,slug,plan,searches_used")
            .eq("id", recruiter.company_id)
            .maybeSingle();

        if (!active) return;

        if (companyError || !companyData) {
          throw new Error("Unable to load company information.");
        }

        setCompany(companyData as Company);

        const [
          candidateResult,
          shortlistResult,
        ] = await Promise.all([
          supabase
            .from("candidates")
            .select("id", { count: "exact", head: true }),

          supabase
            .from("shortlists")
            .select("id")
            .eq("recruiter_id", user.id),
        ]);

        if (!active) return;

        if (candidateResult.error) {
          console.error(
            "Candidate count error:",
            candidateResult.error.message
          );
          setCandidateCount(null);
        } else {
          setCandidateCount(candidateResult.count);
        }

        if (shortlistResult.error) {
          console.error(
            "Shortlist count error:",
            shortlistResult.error.message
          );
          setStats({
            shortlists: null,
            shortlistedCandidates: null,
          });
        } else {
          const lists = shortlistResult.data ?? [];
          const shortlistIds = lists.map((list) => list.id);

          if (shortlistIds.length === 0) {
            setStats({
              shortlists: 0,
              shortlistedCandidates: 0,
            });
          } else {
            const { data: people, error: peopleError } =
              await supabase
                .from("shortlist_people")
                .select("candidate_id")
                .in("shortlist_id", shortlistIds);

            if (!active) return;

            setStats({
              shortlists: lists.length,
              shortlistedCandidates: peopleError
                ? null
                : new Set(
                    (people ?? []).map(
                      (person) => person.candidate_id
                    )
                  ).size,
            });
          }
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: logoutError } =
        await supabase.auth.signOut();

      if (logoutError) {
        throw new Error(logoutError.message);
      }

      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign out."
      );
      setLoggingOut(false);
    }
  }

  const companyName = company?.slug
    ? company.slug
        .split("-")
        .map(
          (part) =>
            part.charAt(0).toUpperCase() + part.slice(1)
        )
        .join(" ")
    : "Your Company";

  const displayName = email
    ? email.split("@")[0].replace(/[._-]/g, " ")
    : "Recruiter";

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* Navigation */}
      
{/* Premium Floating Navbar */}
<header className="sticky top-0 z-50 border-b border-indigo-100/50 bg-[#f7f8fc]/90 px-4 py-4 backdrop-blur-xl sm:px-6">
  <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-[24px] border border-indigo-100 bg-white px-5 py-4 shadow-[0_12px_40px_rgba(79,70,229,0.09)] lg:flex-nowrap lg:px-7">
    {/* Brand */}
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

    {/* Navigation Links */}
    <nav
      aria-label="Main navigation"
      className="order-3 flex w-full items-center gap-1 overflow-x-auto border-t border-slate-100 pt-3 lg:order-2 lg:w-auto lg:border-0 lg:pt-0"
    >
      <Link
        href="/"
        aria-current="page"
        className="flex shrink-0 items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700 transition"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z"
          />
        </svg>
        Dashboard
      </Link>

      <Link
        href="/search"
        className="flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
      >
        <Icon name="search" className="h-5 w-5" />
        Candidate Search
      </Link>

      <Link
        href="/shortlists"
        className="flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
      >
        <Icon name="bookmark" className="h-5 w-5" />
        Shortlists
      </Link>
    </nav>

    {/* Recruiter Account */}
    <div className="order-2 flex shrink-0 items-center gap-3 lg:order-3">
      <div className="hidden items-center gap-3 border-r border-slate-200 pr-4 sm:flex">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600">
          {email?.charAt(0).toUpperCase() || "R"}
        </div>

        <div className="max-w-32">
          <p className="truncate text-sm font-bold capitalize text-slate-900">
            {displayName}
          </p>
          <p className="truncate text-xs text-slate-400">
            {companyName}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm font-bold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon name="log-out" className="h-4 w-4" />
        <span className="hidden sm:inline">
          {loggingOut ? "Signing out..." : "Sign Out"}
        </span>
      </button>
    </div>
  </div>
</header>


      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:py-12">
        {loading ? (
          <div className="space-y-7 animate-pulse">
            <div className="h-9 w-72 rounded-xl bg-slate-200" />
            <div className="h-5 w-96 max-w-full rounded-lg bg-slate-200" />
            <div className="h-64 rounded-3xl bg-slate-200" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-44 rounded-3xl bg-slate-200"
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Welcome heading */}
            <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="mb-4 flex items-center gap-2 text-sm">
                  <span className="text-slate-400">
                    Workspace
                  </span>
                  <span className="text-slate-300">/</span>
                  <span className="font-semibold text-indigo-600">
                    Dashboard
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Welcome back,{" "}
                  <span className="capitalize text-indigo-600">
                    {displayName}
                  </span>
                </h1>

                <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
                  Here&apos;s an overview of your recruitment
                  workspace and hiring activity.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Recruiter Workspace
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-7 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* Hero banner */}
            <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-indigo-100 sm:p-10">
              <div className="absolute -right-14 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-[-150px] right-44 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />

              <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-indigo-100">
                    <Icon name="sparkles" className="h-4 w-4" />
                    Your recruitment command center
                  </span>

                  <h2 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
                    Find talent. Build teams.
                    <span className="block text-indigo-200">
                      Hire with confidence.
                    </span>
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-indigo-100">
                    Discover qualified candidates, explore their
                    experience, and organize your hiring pipeline
                    in one streamlined workspace.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href="/search"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
                    >
                      <Icon name="search" className="h-4 w-4" />
                      Find Candidates
                      <Icon name="arrow-right" className="h-4 w-4" />
                    </Link>

                    <Link
                      href="/shortlists"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      <Icon name="bookmark" className="h-4 w-4" />
                      My Shortlists
                    </Link>
                  </div>
                </div>

                <div className="hidden shrink-0 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur md:block">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/15">
                    <Icon
                      name="briefcase"
                      className="h-12 w-12 text-white"
                    />
                  </div>
                  <p className="mt-4 text-center text-xs font-medium text-indigo-100">
                    Talent Workspace
                  </p>
                </div>
              </div>
            </section>

            {/* Statistics */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  Workspace Overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your organization and recruitment activity
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Company"
                value={companyName}
                description="Your current recruitment organization"
                icon="building"
                accent="indigo"
              />

              <StatCard
                title="Subscription Plan"
                value={
                  company?.plan
                    ? company.plan.charAt(0).toUpperCase() +
                      company.plan.slice(1)
                    : "Unavailable"
                }
                description="Current organization subscription"
                icon="credit-card"
                accent="violet"
              />

              <StatCard
                title="Talent Database"
                value={
                  candidateCount !== null
                    ? candidateCount.toLocaleString()
                    : "Unavailable"
                }
                description="Candidates available in the database"
                icon="users"
                accent="emerald"
              />

              <StatCard
                title="Searches Used"
                value={
                  company?.searches_used != null
                    ? company.searches_used.toLocaleString()
                    : "Unavailable"
                }
                description="Search usage recorded for your company"
                icon="search"
                accent="amber"
              />
            </div>

            {/* Shortlist overview */}
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Icon name="bookmark" className="h-7 w-7" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold sm:text-xl">
                      Your Talent Shortlists
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Keep track of candidates you&apos;ve selected.
                    </p>
                  </div>
                </div>

                <Link
                  href="/shortlists"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Manage Shortlists
                  <Icon name="arrow-right" className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-7 grid gap-4 border-t border-slate-100 pt-7 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">
                    My Shortlists
                  </p>
                  <p className="mt-2 text-3xl font-bold">
                    {stats.shortlists !== null
                      ? stats.shortlists
                      : "—"}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Lists created under your recruiter account
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">
                    Unique Shortlisted Candidates
                  </p>
                  <p className="mt-2 text-3xl font-bold">
                    {stats.shortlistedCandidates !== null
                      ? stats.shortlistedCandidates
                      : "—"}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Distinct candidates across your shortlists
                  </p>
                </div>
              </div>
            </section>

            {/* Quick actions */}
            <section className="mt-10">
              <div className="mb-6">
                <h2 className="text-xl font-bold sm:text-2xl">
                  Quick Actions
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Everything you need to move your hiring
                  process forward.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <ActionCard
                  href="/search"
                  title="Discover Candidates"
                  description="Search candidates by skills, job title, location, and experience. Review profiles to find the right match for your team."
                  icon="search"
                  action="Explore candidates"
                />

                <ActionCard
                  href="/shortlists"
                  title="Manage Shortlists"
                  description="Create organized candidate lists, review your saved talent, and manage your hiring pipeline from one place."
                  icon="bookmark"
                  action="Open shortlists"
                />
              </div>
            </section>

            {/* Account section */}
            <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Icon name="shield" className="h-6 w-6" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-bold">
                      Account & Organization
                    </h2>
                    <p className="mt-1 break-all text-sm text-slate-500">
                      Signed in as {email}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                  <Icon name="check" className="h-4 w-4" />
                  Authenticated Session
                </div>
              </div>
            </section>
          </>
        )}

        <footer className="mt-12 border-t border-slate-200 py-7 text-center text-xs text-slate-400">
          © {2026} Rotto Recruiter · Talent Acquisition Platform
        </footer>
      </div>
    </main>
  );
  


}

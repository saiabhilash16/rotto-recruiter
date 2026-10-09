
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

type Candidate = {
  id: string;
  name: string;
  headline: string | null;
  location: string | null;
  years_experience: number | null;
  skills: string[] | null;
  avatar_url: string | null;
};

function formatLocation(value: string | null) {
  if (!value) return "Not specified";

  try {
    const parsed = JSON.parse(value);

    if (typeof parsed === "object" && parsed !== null) {
      return (
        [parsed.city, parsed.state, parsed.country]
          .filter(Boolean)
          .join(", ") || "Not specified"
      );
    }
  } catch {
    // Location is already plain text.
  }

  return value;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function SearchIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </svg>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [experience, setExperience] = useState("");

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setSearched(false);
    setCandidates([]);

    try {
      const supabase = createClient();

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Please sign in first.");
      }

      const params = new URLSearchParams();

      if (query.trim()) params.set("q", query.trim());
      if (location.trim()) {
        params.set("location", location.trim());
      }
      if (title.trim()) params.set("title", title.trim());
      if (experience) {
        params.set("minExperience", experience);
      }

      const response = await fetch(
        `/api/candidates?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Search failed");
      }

      setCandidates(result.candidates ?? []);
      setSearched(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setQuery("");
    setLocation("");
    setTitle("");
    setExperience("");
  }

  const activeFilters = [
    query.trim(),
    location.trim(),
    title.trim(),
    experience,
  ].filter(Boolean).length;

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* Shared Professional Navbar */}
      <Navbar />

      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:py-12">
        {/* Page Heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="text-slate-400 transition hover:text-indigo-600"
              >
                Dashboard
              </Link>

              <span className="text-slate-300">/</span>

              <span className="font-medium text-indigo-600">
                Candidate Search
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Discover great talent
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Search your candidate database, explore skills and
              experience, and find the right people for your team.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Talent Discovery Workspace
          </div>
        </div>

        {/* Hero Banner */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-indigo-100 sm:p-9">
          <div className="absolute -right-10 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-[-130px] right-48 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100">
              Your next great hire starts here
            </span>

            <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
              Find the perfect match for your team.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-indigo-100">
              Use targeted filters to discover relevant candidates,
              review their profiles, and build your hiring shortlist.
            </p>
          </div>
        </section>

        {/* Candidate Search Form */}
        <form
          onSubmit={handleSearch}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <SearchIcon />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Search candidates
                </h2>
                <p className="text-xs text-slate-500">
                  Refine your search using the filters below
                </p>
              </div>
            </div>

            {activeFilters > 0 && (
              <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                {activeFilters} active filter
                {activeFilters !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            {/* Keyword Search */}
            <div>
              <label
                htmlFor="candidate-search"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Search by name, skills or keywords
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <SearchIcon />
                </div>

                <input
                  id="candidate-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try React, Python, Data Engineer..."
                  maxLength={100}
                  className={`${inputClass} pl-12`}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Location
                </label>

                <input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York"
                  maxLength={100}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="job-title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Job title
                </label>

                <input
                  id="job-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  maxLength={100}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="experience"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Minimum experience
                </label>

                <select
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Any experience</option>
                  <option value="1">1+ years</option>
                  <option value="3">3+ years</option>
                  <option value="5">5+ years</option>
                  <option value="8">8+ years</option>
                  <option value="10">10+ years</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}

                {error === "Please sign in first." && (
                  <Link
                    href="/login"
                    className="ml-2 font-semibold underline"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            )}

            {/* Search Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={clearFilters}
                disabled={loading || activeFilters === 0}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear all filters
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-w-48 items-center justify-center gap-3 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Searching...
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-4 w-4" />
                    Search candidates
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Candidate Results */}
        <section className="mt-10" aria-live="polite">
          {searched ? (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Search results
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {candidates.length} candidate
                    {candidates.length !== 1 ? "s" : ""} found
                  </p>
                </div>

                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
                  {candidates.length} results
                </span>
              </div>

              {candidates.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <SearchIcon className="h-8 w-8" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    No candidates found
                  </h3>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                    Try broader keywords or remove some filters
                    to find more candidates.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  {candidates.map((candidate) => (
                    <article
                      key={candidate.id}
                      className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/60 sm:p-7"
                    >
                      {/* Candidate Identity */}
                      <div className="flex items-start gap-4">
                        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-xl font-bold text-indigo-700">
                          {getInitials(candidate.name)}

                          {candidate.avatar_url && (
                            <img
                              src={candidate.avatar_url}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-indigo-700">
                            {candidate.name}
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {candidate.headline ||
                              "Professional Candidate"}
                          </p>
                        </div>

                        <span className="hidden shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
                          Candidate
                        </span>
                      </div>

                      {/* Location and Experience */}
                      <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="mt-0.5 text-indigo-500">
                            <LocationIcon />
                          </span>

                          <span className="break-words">
                            {formatLocation(candidate.location)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="text-indigo-500">
                            <BriefcaseIcon />
                          </span>

                          <span>
                            {candidate.years_experience !== null
                              ? `${candidate.years_experience} years experience`
                              : "Experience not specified"}
                          </span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mt-6 flex-1">
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                          Skills & Expertise
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(candidate.skills) &&
                          candidate.skills.length > 0 ? (
                            <>
                              {candidate.skills
                                .slice(0, 6)
                                .map((skill, index) => (
                                  <span
                                    key={`${skill}-${index}`}
                                    className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700"
                                  >
                                    {skill}
                                  </span>
                                ))}

                              {candidate.skills.length > 6 && (
                                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                                  +{candidate.skills.length - 6} more
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">
                              No skills listed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Profile Link */}
                      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                        <span className="text-xs text-slate-400">
                          Candidate profile
                        </span>

                        <Link
                          href={`/candidates/${encodeURIComponent(
                            candidate.id
                          )}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                          View full profile
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          ) : !loading ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <SearchIcon className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-xl font-bold">
                Ready to discover talent?
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                Enter your search criteria above and click
                Search candidates to explore available profiles.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
              <p className="mt-4 text-sm font-medium text-slate-500">
                Finding candidates...
              </p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 py-7 text-center text-xs text-slate-400">
          © 2026 Rotto Recruiter · Talent Acquisition Platform
        </footer>
      </div>
    </main>
  );
}

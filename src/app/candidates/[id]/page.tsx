
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Candidate = {
  id: string;
  name: string;
  headline: string | null;
  location: string | null;
  years_experience: number | null;
  skills: unknown;
  experience: unknown;
  education: unknown;
  avatar_url: string | null;
};

type Shortlist = {
  id: string;
  name: string;
};

type DetailRecord = Record<string, unknown>;

function formatLocation(location: string | null): string {
  if (!location) return "Not specified";

  try {
    const parsed = JSON.parse(location);

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      const parts = [
        parsed.city,
        parsed.state,
        parsed.country,
      ].filter(
        (part): part is string =>
          typeof part === "string" && part.trim().length > 0
      );

      return parts.join(", ") || "Not specified";
    }

    return location;
  } catch {
    return location;
  }
}

function asRecord(value: unknown): DetailRecord | null {
  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as DetailRecord;
  }
  return null;
}

function detailText(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(detailText).filter(Boolean).join(", ");
  }

  return "";
}

function getField(
  record: DetailRecord,
  ...keys: string[]
): string {
  for (const key of keys) {
    const value = detailText(record[key]);
    if (value) return value;
  }
  return "";
}

function normalizeDetails(value: unknown): unknown[] {
  if (value === null || value === undefined || value === "") {
    return [];
  }

  let parsed = value;

  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return typeof parsed === "string" && parsed.trim()
        ? [parsed]
        : [];
    }
  }

  if (Array.isArray(parsed)) return parsed;

  if (
    parsed &&
    typeof parsed === "object" &&
    Object.keys(parsed).length === 0
  ) {
    return [];
  }

  return [parsed];
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: "arrow" | "location" | "briefcase" | "bookmark" | "check";
  className?: string;
}) {
  const paths = {
    arrow: <path d="m15 18-6-6 6-6" />,
    location: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
      </>
    ),
    bookmark: (
      <path d="M6 4h12a2 2 0 0 1 2 2v15l-8-5-8 5V6a2 2 0 0 1 2-2Z" />
    ),
    check: <path d="m5 12 4 4L19 6" />,
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
      {paths[name]}
    </svg>
  );
}

function DetailSection({
  title,
  value,
  kind,
}: {
  title: string;
  value: unknown;
  kind: "experience" | "education";
}) {
  const entries = normalizeDetails(value);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-7 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon name="briefcase" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {title}
          </h2>
          <p className="text-xs text-slate-400">
            {kind === "experience"
              ? "Professional background"
              : "Academic qualifications"}
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
          Not specified
        </p>
      ) : (
        <div className="space-y-7">
          {entries.map((entry, index) => {
            const record = asRecord(entry);

            if (!record) {
              return (
                <div
                  key={index}
                  className="rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-700"
                >
                  <p className="whitespace-pre-wrap">
                    {detailText(entry) || "Not specified"}
                  </p>
                </div>
              );
            }

            if (kind === "education") {
              const degree = getField(
                record,
                "degree",
                "qualification"
              );
              const field = getField(
                record,
                "field",
                "field_of_study",
                "major"
              );
              const school = getField(
                record,
                "school",
                "institution",
                "university",
                "college"
              );
              const year = getField(
                record,
                "graduation_year",
                "year",
                "end_year"
              );

              const hasDetails = degree || field || school || year;

              return (
                <div
                  key={index}
                  className="relative border-l-2 border-indigo-100 pb-2 pl-6 last:pb-0"
                >
                  <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-indigo-500" />

                  <h3 className="text-base font-bold text-slate-900">
                    {degree || "Education"}
                  </h3>

                  {field && (
                    <p className="mt-2 text-sm text-slate-600">
                      {field}
                    </p>
                  )}

                  {school && (
                    <p className="mt-2 text-sm font-semibold text-indigo-600">
                      {school}
                    </p>
                  )}

                  {year && (
                    <p className="mt-2 text-xs font-medium text-slate-400">
                      Graduated: {year}
                    </p>
                  )}

                  {!hasDetails && (
                    <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm text-slate-600">
                      {JSON.stringify(record, null, 2)}
                    </pre>
                  )}
                </div>
              );
            }

            const role = getField(
              record,
              "title",
              "role",
              "position",
              "job_title"
            );
            const company = getField(
              record,
              "company",
              "employer",
              "organization"
            );
            const start = getField(
              record,
              "start_date",
              "start",
              "from"
            );
            const end = getField(
              record,
              "end_date",
              "end",
              "to"
            );
            const description = getField(
              record,
              "description",
              "summary",
              "responsibilities"
            );

            const hasDetails =
              role || company || start || end || description;

            return (
              <div
                key={index}
                className="relative border-l-2 border-indigo-100 pb-2 pl-6 last:pb-0"
              >
                <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-indigo-500" />

                <h3 className="text-base font-bold text-slate-900">
                  {role || company || "Work Experience"}
                </h3>

                {role && company && (
                  <p className="mt-2 text-sm font-semibold text-indigo-600">
                    {company}
                  </p>
                )}

                {(start || end) && (
                  <p className="mt-2 text-xs font-medium text-slate-400">
                    {[start, end].filter(Boolean).join(" - ")}
                  </p>
                )}

                {description && (
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {description}
                  </p>
                )}

                {!hasDetails && (
                  <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm text-slate-600">
                    {JSON.stringify(record, null, 2)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function CandidateProfileContent() {
  const params = useParams();
  const id = params.id as string;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [shortlists, setShortlists] = useState<Shortlist[]>([]);
  const [selectedShortlist, setSelectedShortlist] = useState("");
  const [shortlistLoading, setShortlistLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shortlistError, setShortlistError] = useState("");
  const [shortlistMessage, setShortlistMessage] = useState("");
  const [alreadyShortlisted, setAlreadyShortlisted] = useState(false);
  const [checkingShortlist, setCheckingShortlist] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");
      setCandidate(null);
      setShortlists([]);
      setSelectedShortlist("");
      setShortlistError("");
      setShortlistMessage("");
      setAlreadyShortlisted(false);

      try {
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("Please sign in first.");
        }

        const { data, error: queryError } = await supabase
          .from("candidates")
          .select(
            "id,name,headline,location,years_experience,skills,experience,education,avatar_url"
          )
          .eq("id", id)
          .maybeSingle();

        if (queryError) {
          throw new Error(queryError.message);
        }

        if (!active) return;

        setCandidate(data);

        if (!data) return;

        setShortlistLoading(true);

        const { data: lists, error: listError } =
          await supabase
            .from("shortlists")
            .select("id,name")
            .eq("recruiter_id", user.id)
            .order("created_at", { ascending: false });

        if (!active) return;

        if (listError) {
          setShortlistError(listError.message);
        } else {
          setShortlists(lists ?? []);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load candidate"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
          setShortlistLoading(false);
        }
      }
    }

    if (id) {
      loadData();
    } else {
      setLoading(false);
      setError("Invalid candidate ID.");
    }

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;

    async function checkShortlist() {
      setAlreadyShortlisted(false);
      setShortlistMessage("");
      setShortlistError("");

      if (!selectedShortlist || !candidate) {
        setCheckingShortlist(false);
        return;
      }

      setCheckingShortlist(true);

      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("shortlist_people")
          .select("candidate_id")
          .eq("shortlist_id", selectedShortlist)
          .eq("candidate_id", candidate.id)
          .maybeSingle();

        if (!active) return;

        if (error) {
          setShortlistError(error.message);
        } else {
          setAlreadyShortlisted(Boolean(data));
        }
      } finally {
        if (active) setCheckingShortlist(false);
      }
    }

    checkShortlist();

    return () => {
      active = false;
    };
  }, [selectedShortlist, candidate]);

  async function handleShortlist() {
    if (
      !candidate ||
      !selectedShortlist ||
      saving ||
      checkingShortlist
    ) {
      return;
    }

    setSaving(true);
    setShortlistError("");
    setShortlistMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in first.");
      }

      const { data: ownedList, error: ownerError } =
        await supabase
          .from("shortlists")
          .select("id")
          .eq("id", selectedShortlist)
          .eq("recruiter_id", user.id)
          .maybeSingle();

      if (ownerError) {
        throw new Error(ownerError.message);
      }

      if (!ownedList) {
        throw new Error(
          "You do not have access to this shortlist."
        );
      }

      const { data: existing, error: checkError } =
        await supabase
          .from("shortlist_people")
          .select("candidate_id")
          .eq("shortlist_id", selectedShortlist)
          .eq("candidate_id", candidate.id)
          .maybeSingle();

      if (checkError) {
        throw new Error(checkError.message);
      }

      if (existing) {
        setAlreadyShortlisted(true);
        setShortlistMessage(
          "This candidate is already shortlisted."
        );
        return;
      }

      const { error: insertError } = await supabase
        .from("shortlist_people")
        .insert({
          shortlist_id: selectedShortlist,
          candidate_id: candidate.id,
        });

      if (insertError) {
        if (insertError.code === "23505") {
          setAlreadyShortlisted(true);
          setShortlistMessage(
            "This candidate is already shortlisted."
          );
          return;
        }

        throw new Error(insertError.message);
      }

      setAlreadyShortlisted(true);
      setShortlistMessage(
        "Candidate added to shortlist successfully!"
      );
    } catch (err) {
      setShortlistError(
        err instanceof Error
          ? err.message
          : "Unable to shortlist candidate."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-extrabold text-white shadow-md shadow-indigo-200">
              R
            </div>
            <div>
              <p className="text-base font-bold tracking-tight">
                Rotto Recruiter
              </p>
              <p className="text-xs text-slate-400">
                Talent Acquisition Platform
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 sm:block"
            >
              Dashboard
            </Link>
            <Link
              href="/search"
              className="rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700"
            >
              Candidate Search
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:py-12">
        <div className="mb-7 flex flex-wrap items-center gap-2 text-sm">
          <Link href="/" className="text-slate-400 hover:text-indigo-600">
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/search" className="text-slate-400 hover:text-indigo-600">
            Candidate Search
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-indigo-600">
            Candidate Profile
          </span>
        </div>

        <Link
          href="/search"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <Icon name="arrow" className="h-4 w-4" />
          Back to candidate search
        </Link>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="animate-pulse space-y-5">
              <div className="h-20 w-20 rounded-2xl bg-slate-100" />
              <div className="h-6 w-64 rounded-lg bg-slate-100" />
              <div className="h-4 w-48 rounded-lg bg-slate-100" />
              <div className="h-24 rounded-xl bg-slate-100" />
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
            {error === "Please sign in first." && (
              <Link href="/login" className="ml-2 font-bold underline">
                Sign in
              </Link>
            )}
          </div>
        )}

        {!loading && !error && candidate && (
          <>
            {/* Profile hero */}
            <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="h-32 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 sm:h-40" />

              <div className="relative px-6 pb-7 sm:px-9">
                <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-6">
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-indigo-100 text-3xl font-bold text-indigo-700 shadow-lg sm:h-28 sm:w-28">
                    {getInitials(candidate.name)}
                    {candidate.avatar_url && (
                      <img
                        src={candidate.avatar_url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pb-1 sm:pt-14">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {candidate.name}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                      {candidate.headline || "Professional Candidate"}
                    </p>
                  </div>

                  <span className="self-start rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 sm:mb-2">
                    Candidate Profile
                  </span>
                </div>

                <div className="mt-7 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600">
                      <Icon name="location" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Location</p>
                      <p className="mt-1 text-sm font-semibold">
                        {formatLocation(candidate.location)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600">
                      <Icon name="briefcase" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">
                        Total experience
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {candidate.years_experience != null
                          ? `${candidate.years_experience} years`
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-7 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_350px]">
              {/* Main profile details */}
              <div className="space-y-7">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">
                        Skills & Expertise
                      </h2>
                      <p className="mt-1 text-xs text-slate-400">
                        Candidate technical and professional skills
                      </p>
                    </div>
                    <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                      {Array.isArray(candidate.skills)
                        ? candidate.skills.length
                        : 0}{" "}
                      skills
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {Array.isArray(candidate.skills) &&
                    candidate.skills.length > 0 ? (
                      candidate.skills.map((skill, index) => (
                        <span
                          key={`${String(skill)}-${index}`}
                          className="rounded-xl border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-sm font-medium text-indigo-700"
                        >
                          {String(skill)}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No skills available.
                      </p>
                    )}
                  </div>
                </section>

                <DetailSection
                  title="Work Experience"
                  value={candidate.experience}
                  kind="experience"
                />

                <DetailSection
                  title="Education"
                  value={candidate.education}
                  kind="education"
                />
              </div>

              {/* Shortlist sidebar */}
              <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon name="bookmark" className="h-6 w-6" />
                </div>

                <h2 className="text-xl font-bold">
                  Shortlist Candidate
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Save this candidate to one of your existing
                  recruiter shortlists.
                </p>

                <div className="mt-7 border-t border-slate-100 pt-6">
                  {shortlistLoading ? (
                    <p className="text-sm text-slate-500">
                      Loading shortlists...
                    </p>
                  ) : shortlists.length === 0 ? (
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                      No shortlists found. Create a shortlist
                      before adding candidates.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="shortlist"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Select shortlist
                        </label>

                        <select
                          id="shortlist"
                          value={selectedShortlist}
                          onChange={(e) =>
                            setSelectedShortlist(e.target.value)
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        >
                          <option value="">Choose a shortlist</option>
                          {shortlists.map((list) => (
                            <option key={list.id} value={list.id}>
                              {list.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleShortlist}
                        disabled={
                          saving ||
                          checkingShortlist ||
                          !selectedShortlist ||
                          alreadyShortlisted
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving
                          ? "Saving..."
                          : checkingShortlist
                            ? "Checking..."
                            : alreadyShortlisted
                              ? "Shortlisted"
                              : "Add to shortlist"}

                        {alreadyShortlisted && (
                          <Icon name="check" className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}

                  {shortlistMessage && (
                    <div
                      role="status"
                      className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-700"
                    >
                      {shortlistMessage}
                    </div>
                  )}

                  {shortlistError && (
                    <div
                      role="alert"
                      className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
                    >
                      {shortlistError}
                    </div>
                  )}
                </div>

                <div className="mt-7 border-t border-slate-100 pt-5">
                  <p className="text-xs leading-6 text-slate-400">
                    Candidate shortlisting is protected by your
                    organization&apos;s database access policies.
                  </p>
                </div>
              </aside>
            </div>

            <div className="mt-9">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-indigo-200 hover:text-indigo-600"
              >
                <Icon name="arrow" className="h-4 w-4" />
                Back to candidate search
              </Link>
            </div>
          </>
        )}

        {!loading && !error && !candidate && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold">
              Candidate Not Found
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              The requested candidate does not exist
              or is not accessible.
            </p>
            <Link
              href="/search"
              className="mt-5 inline-block font-semibold text-indigo-600 hover:underline"
            >
              Return to Candidate Search
            </Link>
          </div>
        )}

        <footer className="mt-12 border-t border-slate-200 py-7 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Rotto Recruiter · Talent Acquisition Platform
        </footer>
      </div>
    </main>
  );
}

export default function CandidateProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7f8fc] p-8">
          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8">
            <p className="text-slate-500">
              Loading candidate profile...
            </p>
          </div>
        </div>
      }
    >
      <CandidateProfileContent />
    </Suspense>
  );
}

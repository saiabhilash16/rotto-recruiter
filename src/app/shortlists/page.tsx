
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Shortlist = {
  id: string;
  name: string;
  created_at: string;
};

type ShortlistPerson = {
  candidate_id: string;
  created_at: string;
};

type Candidate = {
  id: string;
  name: string;
  headline: string | null;
  location: string | null;
  years_experience: number | null;
};

function formatLocation(value: string | null) {
  if (!value) return "Not specified";

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return (
        [parsed.city, parsed.state, parsed.country]
          .filter(Boolean)
          .join(", ") || "Not specified"
      );
    }
  } catch {
    // Plain text location.
  }

  return value;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function ShortlistsPage() {
  const router = useRouter();

  const [shortlists, setShortlists] = useState<Shortlist[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [people, setPeople] = useState<ShortlistPerson[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newName, setNewName] = useState("");

  const [loading, setLoading] = useState(true);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [removingId, setRemovingId] = useState("");
  const [error, setError] = useState("");
  const [peopleError, setPeopleError] = useState("");
  const [message, setMessage] = useState("");

  const loadShortlists = useCallback(async () => {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Please sign in first.");
    }

    const { data, error: listError } = await supabase
      .from("shortlists")
      .select("id,name,created_at")
      .eq("recruiter_id", user.id)
      .order("created_at", { ascending: false });

    if (listError) throw new Error(listError.message);

    return {
      user,
      lists: (data ?? []) as Shortlist[],
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      setLoading(true);
      setError("");

      try {
        const { lists } = await loadShortlists();

        if (!active) return;

        setShortlists(lists);
        setSelectedId((previous) =>
          lists.some((list) => list.id === previous)
            ? previous
            : lists[0]?.id || ""
        );
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load shortlists."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [loadShortlists]);

  useEffect(() => {
    let active = true;

    async function loadPeople() {
      setPeople([]);
      setCandidates([]);
      setPeopleError("");

      if (!selectedId) {
        setPeopleLoading(false);
        return;
      }

      setPeopleLoading(true);

      try {
        const supabase = createClient();

        const { data: rows, error: rowsError } = await supabase
          .from("shortlist_people")
          .select("candidate_id,created_at")
          .eq("shortlist_id", selectedId)
          .order("created_at", { ascending: false });

        if (rowsError) throw new Error(rowsError.message);

        if (!active) return;

        const selectedPeople = (rows ?? []) as ShortlistPerson[];
        setPeople(selectedPeople);

        if (selectedPeople.length === 0) return;

        const ids = selectedPeople.map((person) => person.candidate_id);

        const { data: profiles, error: profilesError } = await supabase
          .from("candidates")
          .select("id,name,headline,location,years_experience")
          .in("id", ids);

        if (profilesError) throw new Error(profilesError.message);

        if (!active) return;

        setCandidates((profiles ?? []) as Candidate[]);
      } catch (err) {
        if (active) {
          setPeopleError(
            err instanceof Error
              ? err.message
              : "Unable to load shortlisted candidates."
          );
        }
      } finally {
        if (active) setPeopleLoading(false);
      }
    }

    loadPeople();

    return () => {
      active = false;
    };
  }, [selectedId]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = newName.trim();

    if (!name || creating) return;

    setCreating(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();
      const { user } = await loadShortlists();

      const { data: recruiter, error: recruiterError } = await supabase
        .from("recruiters")
        .select("company_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (recruiterError) throw new Error(recruiterError.message);

      if (!recruiter?.company_id) {
        throw new Error("Recruiter company was not found.");
      }

      const { data: created, error: createError } = await supabase
        .from("shortlists")
        .insert({
          name,
          recruiter_id: user.id,
          company_id: recruiter.company_id,
        })
        .select("id,name,created_at")
        .single();

      if (createError) throw new Error(createError.message);

      setShortlists((previous) => [created as Shortlist, ...previous]);
      setSelectedId(created.id);
      setNewName("");
      setMessage("Shortlist created successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create shortlist."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleRemove(candidateId: string) {
    if (!selectedId || removingId) return;

    const confirmed = window.confirm(
      "Remove this candidate from the selected shortlist?"
    );

    if (!confirmed) return;

    setRemovingId(candidateId);
    setPeopleError("");
    setMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in first.");
      }

      const { data: ownedList, error: ownerError } = await supabase
        .from("shortlists")
        .select("id")
        .eq("id", selectedId)
        .eq("recruiter_id", user.id)
        .maybeSingle();

      if (ownerError) throw new Error(ownerError.message);

      if (!ownedList) {
        throw new Error("You do not have access to this shortlist.");
      }

      const { error: removeError } = await supabase
        .from("shortlist_people")
        .delete()
        .eq("shortlist_id", selectedId)
        .eq("candidate_id", candidateId);

      if (removeError) throw new Error(removeError.message);

      setPeople((previous) =>
        previous.filter((person) => person.candidate_id !== candidateId)
      );
      setCandidates((previous) =>
        previous.filter((candidate) => candidate.id !== candidateId)
      );

      setMessage("Candidate removed from shortlist.");
    } catch (err) {
      setPeopleError(
        err instanceof Error
          ? err.message
          : "Unable to remove candidate."
      );
    } finally {
      setRemovingId("");
    }
  }

  const selectedList = shortlists.find((list) => list.id === selectedId);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-extrabold text-white shadow-md shadow-indigo-200">
              R
            </div>
            <div>
              <p className="text-base font-bold">Rotto Recruiter</p>
              <p className="text-xs text-slate-400">
                Talent Acquisition Platform
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-3 text-sm">
            <Link href="/" className="hidden text-slate-500 hover:text-indigo-600 sm:block">
              Dashboard
            </Link>
            <Link href="/search" className="hidden text-slate-500 hover:text-indigo-600 sm:block">
              Candidate Search
            </Link>
            <span className="rounded-xl bg-indigo-50 px-4 py-2.5 font-semibold text-indigo-700">
              Shortlists
            </span>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium text-indigo-600">
            Dashboard / Shortlists
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Shortlist Management
          </h1>
          <p className="mt-3 text-slate-500">
            Organize your talent pipeline and manage shortlisted candidates.
          </p>
        </div>

        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-8 text-white shadow-lg shadow-indigo-100">
          <div className="relative z-10">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold">
              Talent Pipeline
            </span>
            <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
              Build your next great team.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-indigo-100">
              Keep your candidate selections organized in dedicated
              shortlists for faster hiring decisions.
            </p>
          </div>
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </section>

        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            {error === "Please sign in first." && (
              <Link href="/login" className="ml-2 font-bold underline">
                Sign in
              </Link>
            )}
          </div>
        )}

        {message && (
          <div role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <div className="grid items-start gap-7 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">Create a shortlist</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create a new list to organize candidates.
              </p>

              <form onSubmit={handleCreate} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="shortlist-name" className="mb-2 block text-sm font-semibold text-slate-700">
                    Shortlist name
                  </label>
                  <input
                    id="shortlist-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Senior Engineers"
                    maxLength={100}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? "Creating..." : "+ Create shortlist"}
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold">My Shortlists</h2>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {shortlists.length}
                </span>
              </div>

              {loading ? (
                <p className="text-sm text-slate-500">Loading shortlists...</p>
              ) : shortlists.length === 0 ? (
                <p className="text-sm leading-6 text-slate-500">
                  No shortlists yet. Create your first shortlist above.
                </p>
              ) : (
                <div className="space-y-2">
                  {shortlists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(list.id);
                        setMessage("");
                      }}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        selectedId === list.id
                          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                          : "border-transparent bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <p className="truncate text-sm font-semibold">
                        {list.name}
                      </p>
                      <p className="mt-1 text-xs opacity-70">
                        Created {new Date(list.created_at).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </aside>

          <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-xl font-bold">
                  {selectedList?.name || "Shortlisted Candidates"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {people.length} candidate{people.length !== 1 ? "s" : ""} in this shortlist
                </p>
              </div>
              <Link
                href="/search"
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                + Find candidates
              </Link>
            </div>

            {peopleError && (
              <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {peopleError}
              </div>
            )}

            {peopleLoading ? (
              <p className="py-10 text-center text-sm text-slate-500">
                Loading shortlisted candidates...
              </p>
            ) : !selectedId ? (
              <div className="py-12 text-center text-sm text-slate-500">
                Create or select a shortlist to view candidates.
              </div>
            ) : people.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl text-indigo-600">
                  ☆
                </div>
                <h3 className="mt-5 text-lg font-bold">Your shortlist is empty</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Explore candidates and add them from their profile page.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {people.map((person) => {
                  const candidate = candidates.find(
                    (item) => item.id === person.candidate_id
                  );

                  return (
                    <article
                      key={person.candidate_id}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-indigo-200 hover:shadow-sm sm:flex-row sm:items-center"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 font-bold text-indigo-700">
                          {initials(candidate?.name || "Candidate")}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-bold">
                            {candidate?.name || person.candidate_id}
                          </h3>
                          <p className="mt-1 truncate text-sm text-slate-500">
                            {candidate?.headline || "Candidate profile"}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">
                            {formatLocation(candidate?.location ?? null)}
                            {" · "}
                            {candidate?.years_experience != null
                              ? `${candidate.years_experience} years experience`
                              : "Experience not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <Link
                          href={`/candidates/${encodeURIComponent(person.candidate_id)}`}
                          className="rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleRemove(person.candidate_id)}
                          disabled={Boolean(removingId)}
                          className="rounded-xl border border-red-100 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {removingId === person.candidate_id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <footer className="mt-12 border-t border-slate-200 py-7 text-center text-xs text-slate-400">
          ©  2026 Rotto Recruiter · Talent Acquisition Platform
        </footer>
      </div>
    </main>
  );
}

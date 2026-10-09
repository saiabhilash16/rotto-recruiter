
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left branding panel */}
        <section className="relative hidden overflow-hidden bg-indigo-700 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-[500px] w-[500px] rounded-full bg-violet-400/20 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-extrabold text-indigo-700 shadow-lg">
              R
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Rotto Recruiter
              </h2>
              <p className="text-xs text-indigo-200">
                Talent Acquisition Platform
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-indigo-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Your recruitment workspace
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
              Great teams
              <br />
              start with
              <br />
              <span className="text-indigo-200">
                great talent.
              </span>
            </h1>

            <p className="mt-7 max-w-md text-lg leading-8 text-indigo-100">
              Discover qualified candidates, review detailed
              profiles, and build shortlists from one
              streamlined workspace.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>
                </div>
                <h3 className="font-semibold">
                  Smart Search
                </h3>
                <p className="mt-2 text-sm leading-6 text-indigo-100">
                  Find candidates using targeted filters.
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                  >
                    <path d="M8 4h9a2 2 0 0 1 2 2v14l-6-4-6 4V6a2 2 0 0 1 1-2Z" />
                  </svg>
                </div>
                <h3 className="font-semibold">
                  Easy Shortlisting
                </h3>
                <p className="mt-2 text-sm leading-6 text-indigo-100">
                  Keep promising candidates organized.
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-sm text-indigo-200">
            © {new Date().getFullYear()} Rotto Recruiter
          </p>
        </section>

        {/* Right login form */}
        <section className="flex min-h-screen flex-col bg-white">
          <div className="flex items-center justify-between px-6 py-7 sm:px-10 lg:justify-end">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
                R
              </div>
              <span className="font-bold text-slate-900">
                Rotto Recruiter
              </span>
            </div>

            <span className="text-xs font-medium text-slate-400">
              RECRUITER PORTAL
            </span>
          </div>

          <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
            <div className="w-full max-w-md">
              <div className="mb-9">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-7 w-7"
                  >
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2"
                    />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Welcome back
                </h1>

                <p className="mt-3 text-base leading-7 text-slate-500">
                  Sign in to your recruiter account to
                  continue managing your talent pipeline.
                </p>
              </div>

              <form
                onSubmit={handleLogin}
                className="space-y-6"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Work email
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="2"
                        />
                        <path d="m3 7 9 6 9-6" />
                      </svg>
                    </div>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      disabled={loading}
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="recruiter@company.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <rect
                          x="4"
                          y="10"
                          width="16"
                          height="11"
                          rx="2"
                        />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      </svg>
                    </div>

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword ? "text" : "password"
                      }
                      autoComplete="current-password"
                      required
                      disabled={loading}
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-14 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                  >
                    <span className="font-bold text-red-600">
                      !
                    </span>
                    <p className="text-sm leading-6 text-red-700">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-indigo-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to dashboard
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-9 border-t border-slate-100 pt-7">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4 text-emerald-600"
                  >
                    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Secure recruiter sign-in
                </div>
              </div>

              <p className="mt-8 text-center text-sm text-slate-500">
                Looking for candidates?{" "}
                <Link
                  href="/search"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Explore candidate search
                </Link>
              </p>
            </div>
          </div>

          <div className="px-6 py-6 text-center text-xs text-slate-400">
            Rotto Recruiter · Talent Management Workspace
          </div>
        </section>
      </div>
    </main>
  );
}

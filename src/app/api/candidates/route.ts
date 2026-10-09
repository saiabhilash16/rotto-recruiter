
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { unstable_rethrow } from "next/navigation";


export async function GET(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      return NextResponse.json(
        { error: "Supabase configuration missing" },
        { status: 500 }
      );
    }

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // This GET handler does not refresh cookies.
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = request.nextUrl.searchParams;

    const search = params.get("q")?.trim() ?? "";
    const location = params.get("location")?.trim() ?? "";
    const title = params.get("title")?.trim() ?? "";
    const minExperience = params.get("minExperience") ?? "";

    if ([search, location, title].some(v => v.length > 100)) {
      return NextResponse.json(
        { error: "Search filter is too long" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("candidates")
      .select(
        "id, name, headline, location, years_experience, skills, avatar_url"
      );

    const clean = (value: string) =>
      value.replace(/[%_,().\\]/g, " ").trim();

    if (search) {
      const term = clean(search);

      if (term) {
        query = query.or(
          `name.ilike.%${term}%,headline.ilike.%${term}%`
        );
      }
    }

    if (location) {
      query = query.ilike("location", `%${clean(location)}%`);
    }

    if (title) {
      query = query.ilike("headline", `%${clean(title)}%`);
    }

    if (minExperience !== "") {
      const years = Number(minExperience);

      if (!Number.isFinite(years) || years < 0) {
        return NextResponse.json(
          { error: "Invalid experience filter" },
          { status: 400 }
        );
      }

      query = query.gte("years_experience", years);
    }

    const { data, error } = await query
      .order("id", { ascending: true })
      .limit(20);

    if (error) {
      console.error("Candidate search error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      candidates: data ?? [],
    });
  } catch (error) {
  unstable_rethrow(error);

  console.error("Candidate API error:", error);

    return NextResponse.json(
      { error: "Unable to search candidates" },
      { status: 500 }
    );
  }
}


import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

type Candidate = Record<string, unknown>;

const filePath = path.join(
  process.cwd(),
  "data",
  "full-stack-assessment-candidates.json"
);

async function main() {
  const candidates = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  ) as Candidate[];

  if (!Array.isArray(candidates)) {
    throw new Error("Expected an array of candidates");
  }

  console.log(`Found ${candidates.length} candidates`);

  const client = new Client({
    connectionString:
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  });

  await client.connect();

  try {
    await client.query("BEGIN");

    for (const candidate of candidates) {
      const id = String(candidate.id ?? "");

      if (!id) {
        throw new Error("Candidate is missing an ID");
      }

      const years =
        candidate.years_experience ??
        candidate.total_years_experience ??
        null;

      const location =
        typeof candidate.location === "string"
          ? candidate.location
          : candidate.location == null
            ? null
            : JSON.stringify(candidate.location);

      await client.query(
        `
        INSERT INTO public.candidates (
          id, name, headline, location,
          years_experience, skills, experience,
          education, avatar_url, raw_data
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6::jsonb, $7::jsonb, $8::jsonb,
          $9, $10::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          headline = EXCLUDED.headline,
          location = EXCLUDED.location,
          years_experience = EXCLUDED.years_experience,
          skills = EXCLUDED.skills,
          experience = EXCLUDED.experience,
          education = EXCLUDED.education,
          avatar_url = EXCLUDED.avatar_url,
          raw_data = EXCLUDED.raw_data
        `,
        [
          id,
          candidate.full_name ?? candidate.name ?? null,
          candidate.headline ?? null,
          location,
          years,
          JSON.stringify(candidate.skills ?? []),
          JSON.stringify(candidate.experience ?? []),
          JSON.stringify(candidate.education ?? []),
          candidate.avatar_url ?? null,
          JSON.stringify(candidate),
        ]
      );
    }

    await client.query("COMMIT");
    console.log(
      `Successfully imported ${candidates.length} candidates`
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

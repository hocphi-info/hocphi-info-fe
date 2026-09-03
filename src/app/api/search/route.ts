import { type NextRequest, NextResponse } from "next/server";

import { majors, schools } from "@/lib/mock-data";
import { sleep } from "@/lib/sleep";
import type { SearchHit } from "@/types/domain";

const MAX_HITS = 8;
const MIN_QUERY_LEN = 2;

// Strip Vietnamese diacritics + lowercase so "bach khoa" matches "Bách khoa".
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // combining diacritical marks
    .replace(/đ/g, "d")
    .trim();
}

// The only Route Handler that reads a query param, and the only one called from a
// Client Component (QuickSearch, in the browser).
export async function GET(request: NextRequest) {
  const q = normalize(request.nextUrl.searchParams.get("q") ?? "");

  if (q.length < MIN_QUERY_LEN) {
    return NextResponse.json<SearchHit[]>([]);
  }

  await sleep();

  const schoolHits: SearchHit[] = schools
    .filter((s) => normalize(`${s.name} ${s.shortName}`).includes(q))
    .map((s) => ({
      kind: "school",
      slug: s.slug,
      name: s.name,
      shortName: s.shortName,
    }));

  const majorHits: SearchHit[] = majors
    .filter((m) => normalize(m.name).includes(q))
    .map((m) => ({ kind: "major", slug: m.slug, name: m.name }));

  return NextResponse.json([...schoolHits, ...majorHits].slice(0, MAX_HITS));
}

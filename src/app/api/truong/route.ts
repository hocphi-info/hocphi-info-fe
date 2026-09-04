import { NextResponse } from "next/server";

import { getSchoolRows } from "@/lib/mock-data";
import { sleep } from "@/lib/sleep";

// See src/app/api/nganh/route.ts for the pattern. This one returns SchoolRow[]
// (per-school min/median/max already computed by the Week 1 helper).
export async function GET() {
  await sleep();
  return NextResponse.json(getSchoolRows());
}

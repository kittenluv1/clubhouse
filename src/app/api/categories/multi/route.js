import { clubListResponse } from "@/app/lib/server/handlers/clubList";

const MAX_CATEGORIES = 20;

export async function GET(req) {
  // searchParams values are already decoded; decoding again breaks on "%"
  const categories = (new URL(req.url).searchParams.get("list") ?? "")
    .split(",")
    .map((s) => s.trim().slice(0, 200))
    .filter(Boolean)
    .slice(0, MAX_CATEGORIES);

  if (categories.length === 0) {
    return Response.json({ orgList: [], currPage: 1, totalNumPages: 1 });
  }
  return clubListResponse(req, { categories });
}

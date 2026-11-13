import { clubListResponse } from "@/app/lib/server/handlers/clubList";

export async function GET(req) {
  const name = new URL(req.url).searchParams.get("name")?.slice(0, 200);
  return clubListResponse(req, { name });
}

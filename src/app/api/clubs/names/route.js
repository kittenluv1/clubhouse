import { supabaseServer } from "@/app/lib/server-db";
import { createClubsRepository } from "@/app/lib/server/repositories/clubs";
import { errorResponse } from "@/app/lib/server/route";

export async function GET(req) {
  try {
    const search = new URL(req.url).searchParams
      .get("search")
      ?.trim()
      .slice(0, 200);
    const clubs = await createClubsRepository(supabaseServer).listNames(search);
    return Response.json({ clubs });
  } catch (err) {
    return errorResponse(req, err);
  }
}

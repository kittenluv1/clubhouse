import { supabaseServer } from "@/app/lib/server-db";
import { createClubsRepository } from "@/app/lib/server/repositories/clubs";
import { errorResponse } from "@/app/lib/server/route";

const MAX_CATEGORIES = 16;

export async function GET(req) {
  try {
    const names = await createClubsRepository(supabaseServer).listCategoryNames();
    const categories = names.slice(0, MAX_CATEGORIES).map((name, index) => ({ id: index + 1, name }));
    return Response.json(categories);
  } catch (err) {
    return errorResponse(req, err);
  }
}

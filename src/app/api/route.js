import { fetchUclaClubs } from "@/app/lib/clubs/uclaSource";
import { supabaseServer } from "@/app/lib/server-db";
import { hasCronSecret } from "@/app/lib/server/cron";
import { createClubsRepository } from "@/app/lib/server/repositories/clubs";
import { errorResponse, jsonError } from "@/app/lib/server/route";

// Monthly Vercel cron job (see vercel.json): sync the club directory from
// UCLA. Vercel cron jobs only send GET requests.
export async function GET(req) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET is not set; refusing to run the club sync.");
    return jsonError(500, "Server configuration error");
  }
  if (!hasCronSecret(req, cronSecret)) return jsonError(401, "Unauthorized");

  try {
    const { clubs, regularCount, sportsCount } = await fetchUclaClubs();
    const repo = createClubsRepository(supabaseServer);
    for (const club of clubs) await repo.saveClub(club);

    return Response.json({
      totalClubs: clubs.length,
      regularClubs: regularCount,
      clubSports: sportsCount,
    });
  } catch (err) {
    return errorResponse(req, err);
  }
}

import { supabaseServer } from "@/app/lib/server-db";
import { errorResponse } from "@/app/lib/server/route";

export async function GET(req) {
  try {
    const { data, error } = await supabaseServer
      .from("interest_categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return Response.json(data);
  } catch (err) {
    return errorResponse(req, err);
  }
}

import { supabaseServer } from "@/app/lib/server-db";

export async function GET(req) {
  const search = req.nextUrl.searchParams.get("search")?.trim() || "";

  let query = supabaseServer
    .from("clubs")
    .select("OrganizationID, OrganizationName")
    .order("OrganizationName", { ascending: true });

  if (search) {
    query = query.ilike("OrganizationName", `%${search.slice(0, 200)}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching club names:", error);
    return Response.json({ error: "Failed to fetch clubs" }, { status: 500 });
  }

  return Response.json({ clubs: data || [] });
}
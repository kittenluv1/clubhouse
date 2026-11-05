import { supabaseServer } from "@/app/lib/server-db";
import { errorResponse } from "@/app/lib/server/route";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("interest_categories")
      .select(`
        name,
        icon_path,
        interests (
          name
        )
      `)
      .order("id", { ascending: true });
    
    if (error) throw error;

    const categories = (data ?? []).map((cat) => ({
      name: cat.name,
      iconPath: cat.icon_path,
    }));

    const groupedInterests = Object.fromEntries(
      (data ?? []).map((cat) => [
        cat.name,
        (cat.interests ?? []).map((i) => i.name).sort(),
      ]),
    );

    return Response.json({ categories, groupedInterests });
  } catch (err) {
    return errorResponse(req, err);
  }
}

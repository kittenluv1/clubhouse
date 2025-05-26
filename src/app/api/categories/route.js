import { supabase } from "../../lib/db";

export async function GET() {
  try {
    // grab both category fields from every club
    const { data, error } = await supabase
      .from("clubs")
      .select("Category1Name, Category2Name")
      .limit(1000); // adjust if you have more clubs

    if (error) {
      console.error("Supabase error fetching clubs:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    // flatten, dedupe & drop null/empty
    const set = new Set();
    data.forEach(({ Category1Name, Category2Name }) => {
      if (Category1Name) set.add(Category1Name);
      if (Category2Name) set.add(Category2Name);
    });

    // turn into an array of { id, name } objects, take first 20
    const categories = Array.from(set)
      .slice(0, 16)
      .map((name, idx) => ({ id: idx + 1, name }));

    return new Response(JSON.stringify(categories), { status: 200 });
  } catch (err) {
    console.error("Unexpected error in /api/categories:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

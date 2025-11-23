import { supabase } from "../../../lib/db";

export async function GET(req, { params }) {
  try {
    // Extract URL params and search params
    const raw = params.category;
    const category = decodeURIComponent(raw).trim();
    const searchParams = req.nextUrl.searchParams;
    const pageParam = searchParams.get("page");
    const sortType = searchParams.get("sort") || "rating";

    const pageNum = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = 10;
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1;

    // Configure sort priority based on sortType
    let sortConfig = [];
    if (sortType === "rating") {
      sortConfig = [
        { column: "average_satisfaction", ascending: false },
        { column: "total_num_reviews", ascending: false },
        { column: "OrganizationName", ascending: true },
      ];
    } else if (sortType === "reviews") {
      sortConfig = [
        { column: "total_num_reviews", ascending: false },
        { column: "average_satisfaction", ascending: false },
        { column: "OrganizationName", ascending: true },
      ];
    } else if (sortType === "alphabetical") {
      sortConfig = [
        { column: "OrganizationName", ascending: true },
        { column: "average_satisfaction", ascending: false },
        { column: "total_num_reviews", ascending: false },
      ];
    }

    // Build query with filter
    let query = supabase
      .from("clubs")
      .select("*", { count: "exact" })
      .or(`Category1Name.ilike.%${category}%,Category2Name.ilike.%${category}%`);

    // Apply all sorts from config
    for (const sort of sortConfig) {
      query = query.order(sort.column, { ascending: sort.ascending, nullsFirst: false });
    }
    // Always add ID as final tiebreaker
    query = query.order("OrganizationID", { ascending: true });

    // Apply pagination
    const { data, count, error } = await query.range(startIndex, endIndex);

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: "Database query failed" }), {
        status: 500,
      });
    }

    const totalNumPages = Math.ceil(count / pageSize);

    return new Response(
      JSON.stringify({
        orgList: data,
        currPage: pageNum,
        totalNumPages,
      }),
      { status: 200 },
    );
  } catch (err) {
    console.error("Error fetching data:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
    });
  }
}
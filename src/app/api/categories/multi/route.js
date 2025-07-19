import { supabase } from "../../../lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawList = searchParams.get("list");
    const pageParam = searchParams.get("page");
    const sortType = searchParams.get("sort") || "rating";

    const pageNum = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = 10;
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1;

    if (!rawList) {
      return new Response(
        JSON.stringify({ orgList: [], currPage: 1, totalNumPages: 1 }),
        { status: 200 },
      );
    }

    const categories = decodeURIComponent(rawList)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!categories.length) {
      return new Response(
        JSON.stringify({ orgList: [], currPage: 1, totalNumPages: 1 }),
        { status: 200 },
      );
    }

    // Build dynamic OR filters
    const filters = categories.flatMap((cat) => [
      `Category1Name.ilike.%${cat}%`,
      `Category2Name.ilike.%${cat}%`,
    ]);

    // Set sort field
    let sortBy = "average_satisfaction";
    let ascending = false;
    if (sortType === "reviews") {
      sortBy = "total_num_reviews";
    } else if (sortType === "alphabetical") {
      sortBy = "OrganizationName";
      ascending = true;
    }

    // Build query with consistent ordering
    let query = supabase
      .from("clubs")
      .select("*", { count: "exact" })
      .or(filters.join(","))
      .order(sortBy, { ascending, nullsFirst: false });

    // Add secondary sort by OrganizationName for consistency (except when already sorting alphabetically)
    if (sortType !== "alphabetical") {
      query = query.order("OrganizationName", { ascending: true });
    }
    // Always add ID as final tiebreaker (assuming you have an id column)
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
    console.error("Fetch error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
    });
  }
}
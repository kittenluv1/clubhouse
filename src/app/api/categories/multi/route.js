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
      .or(filters.join(","));

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
    console.error("Fetch error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
    });
  }
}
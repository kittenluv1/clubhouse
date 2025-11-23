import { supabase } from "../../lib/db";

export async function GET(req) {
  try {
    // get the page number, page param, and sort from URL
    const name = req.nextUrl.searchParams.get("name");
    const pageParam = req.nextUrl.searchParams.get("page");
    const sortType = req.nextUrl.searchParams.get("sort") || "rating";
    const pageNum = pageParam ? parseInt(pageParam, 10) : 1; // default display page is first page
    const pageSize = 10; // show only 10 cards per page
    const startIndex = (pageNum - 1) * pageSize; // calculate indices of 'data' to be returned (i.e. 10 per page)
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

    // Build query
    let query = supabase.from("clubs").select("*", { count: "exact" });

    // Apply all sorts from config
    for (const sort of sortConfig) {
      query = query.order(sort.column, { ascending: sort.ascending, nullsFirst: false });
    }
    // Always add ID as final tiebreaker
    query = query.order("OrganizationID", { ascending: true });

    // Apply search filter if provided
    if (name) {
      query = query.ilike("OrganizationName", `%${name}%`);
    }

    // Apply pagination
    const result = await query.range(startIndex, endIndex);
    
    const { data, count, error } = result;

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: "Database query failed" }), {
        status: 500,
      });
    }

    console.log("success");
    console.log(count, "total number of rows");

    const totalNumPages = Math.ceil(count / pageSize);

    return new Response(
      JSON.stringify(
        {
          orgList: data,
          currPage: pageNum,
          totalNumPages,
        },
        null,
        2,
      ),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch data",
      }),
      { status: 500 },
    );
  }
}
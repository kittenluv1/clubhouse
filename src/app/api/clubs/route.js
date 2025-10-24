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

    // Configure sorting with secondary sort for consistency
    let sortBy = "average_satisfaction";
    let ascending = false;
    if (sortType === "reviews") {
      sortBy = "total_num_reviews";
    } else if (sortType === "alphabetical") {
      sortBy = "OrganizationName";
      ascending = true; // alphabetic order needs to go in ascending order
    }

    // Build query with consistent ordering
    // let query = supabase
    //   .from("clubs")
    //   .select("*", { count: "exact" })
    //   .order(sortBy, { ascending, nullsFirst: false });

    let query = supabase
    .from('clubs')
    .select('*', { count: 'exact' });

    if (sortType === 'rating') {
      query = query
        .order('average_satisfaction', { ascending: false, nullsFirst: false })
        .order('total_num_reviews', { ascending: false });
    } else if (sortType === 'reviews') {
      query = query.order('total_num_reviews', { ascending: false });
    }

    // Add secondary sort by ID (or another unique field) for consistency
    // This ensures identical values in the primary sort column have predictable order
    if (sortType !== "alphabetical") {
      query = query.order("OrganizationName", { ascending: true });
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
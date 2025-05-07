import { supabase } from "@/app/lib/db";

export async function GET(req) {
  try {
    //Get the search query parameter and page number from the URL
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("q");  
    const pageParam = searchParams.get("page");  
    const pageNum = pageParam ? parseInt(pageParam, 10) : 1;  //Default to page 1
    const pageSize = 10;  

    //If no search query is provided, return an error
    if (!name) {
      return Response.json({ error: "Missing query parameter" }, { status: 400 });
    }

    //Calculate the range of data to fetch for pagination
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1;

    // get the sort type from URL
		const sortType = searchParams.get("sort");
		// default sort type
		let sortBy = "average_satisfaction"
		let ascending = false; // default is descending order

		if (sortType === "mostReviewed"){
			sortBy = "total_num_reviews";
		}
		// alphabetic order needs to go in ascending order
		else if (sortType === "alpha") {
			sortBy = "OrganizationName";
			ascending = true;
		}

    //Fetch the total count of matching clubs (for pagination)
    const { count, error: countError } = await supabase
      .from("clubs")
      .select("*", { count: "exact" })
      .ilike("OrganizationName", `%${name}%`)
      .order(sortBy, { ascending , nullFirst: false}) ;// sort based on user-chosen type

    if (countError) {
      console.error("Supabase error:", countError);
      return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
    }

    //Fetch the actual page of clubs with the search query and pagination
    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .ilike("OrganizationName", `%${name}%`)
      .order(sortBy, { ascending , nullFirst: false})// sort based on user-chosen type
      .range(startIndex, endIndex);  

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: "Database query failed" }), { status: 500 });
    }

    //Calculate the total number of pages
    const totalNumPages = Math.ceil(count / pageSize);

    //Return the search results along with pagination info
    return new Response(
      JSON.stringify({ orgList: data, currPage: pageNum, totalNumPages }, null, 2),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
  }
}

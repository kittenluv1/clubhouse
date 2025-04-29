import { supabase } from "../../lib/db";
import { supabaseServer } from "../../lib/server-db";

export async function GET(req) {
	try {
		// get the page number from URL
		const pageParam = req.nextUrl.searchParams.get("page");
		const pageNum = pageParam ? parseInt(pageParam, 10) : 1; // default display page is first page
		const pageSize = 10; // show only 10 cards per page

		// calculate indices of 'data' to be returned (i.e. 10 per page)
		const startIndex = (pageNum - 1) * pageSize;
		const endIndex = startIndex + pageSize - 1;

		// get the sort type from URL
		const sortType = req.nextUrl.searchParams.get("sort") || "Highest Rating";
		// default sort type
		let sortBy = "average_satisfaction"
		let ascending = false; // default is descending order

		if (sortType === "reviews"){
			sortBy = "total_num_reviews";
		}
		// alphabetic order needs to go in ascending order
		else if (sortType === "alphabetical") {
			sortBy = "OrganizationName";
			ascending = true;
		}

		const { data, count, error } = await supabase
		.from("clubs")
		.select("*", { count: "exact" }) // gets how many rows were fetched (used for total page count!)
		.order(sortBy, { ascending, nullsFirst: false }) // sort based on user-chosen type
		.range(startIndex, endIndex)

		if (error) {
			console.error("Supabase error:", error);
			return new Response(
			  JSON.stringify({ error: "Database query failed" }), 
			  { status: 500 }
			);
		} else {
			console.log("success")
			console.log(count, "total number of rows")
			// console.log(data)
		}
		
		// round up to nearest whole number; accounts for last page having < 10 items
		const totalNumPages = Math.ceil(count / pageSize);

	// returns the club data, current page number, and total number of pages for search
	  return new Response(JSON.stringify({ orgList: data, currPage: pageNum, totalNumPages }, null, 2), { status: 200 });

	} catch (error) {
	  console.error("Error fetching data:", error);
	  return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
	}
  }


  	
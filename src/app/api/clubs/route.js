import { supabase } from "../../lib/db";
import { supabaseServer } from "../../lib/server-db";

export async function GET(req) {
	try {
		const { data, error } = await supabase
		.from("clubs")
		.select("*")
		.limit(50); //temporary limit

		
		if (error) {
			console.error("Supabase error:", error);
			return new Response(
			  JSON.stringify({ error: "Database query failed" }), 
			  { status: 500 }
			);
		} else {
			console.log("success")
			// console.log(data)
		}

	  return new Response(JSON.stringify({ orgList: data }, null, 2), { status: 200 });

	} catch (error) {
	  console.error("Error fetching data:", error);
	  return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
	}
  }


  	
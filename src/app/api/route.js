import { supabase } from "../lib/db";
import { supabaseServer } from "../lib/server-db";

export async function GET(req) {
	const url = new URL(req.url);
	const name = url.pathname.split("/").pop(); // Extract the last segment of the path (the id)
	console.log("Club name search:", name);

	try {
		let data, error;

		// If there's an "id" provided, fetch specific data for that ID
		if (name && name !== "") {
		// Fetch a single club by id
		({ data, error } = await supabase
			// .from('clubs')
			// .select('*')
			// .eq('id', id) // Use the ID to filter for a specific club
			// .single());
			.from("clubs")
			.select("*")
			.ilike("OrganizationName", `%${name}%`)); // case-insensitive partial match
		} else {
		// If no id, fetch all clubs
		({ data, error } = await supabase
			.from('clubs')
			.select('*'));
		}

		
		if (error) {
			console.error("Fetch error:", error)
			throw new Error(`Response status: ${data.status}`);
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


  	
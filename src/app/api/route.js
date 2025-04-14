import { supabase } from "../lib/db";
import { supabaseServer } from "../lib/server-db";

export async function GET(req) {
	const url = new URL(req.url);
	const name = url.pathname.split("/").pop(); // Extract the last segment of the path (the id)
	console.log("Club name search:", name);

	try {
		let data, error;

		// ({ data, error } = await supabase
		// 	.from('clubs')
		// 	.select('*'));

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


		// const { data, error } = await supabase
		// .from('clubs')
		// .select('*') // or specific columns: 'id, name, created_at'
		
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


  	//   const response = await fetch("https://sa.ucla.edu/RCO/Public/SearchOrganizations", {
	// 	method: "POST",
	//   });

  	//   const response = await fetch("https://sa.ucla.edu/RCO/Public/SearchOrganizations", {
	// 	method: "POST",
	//   });
		// // make data into the correct format for supabase
		// const orgList = data.orgList;

		// // Sanitize a single object by removing null characters
		// function sanitizeObject(obj) {
		// 	const sanitizedObj = {};
		// 	for (const key in obj) {
		// 	if (typeof obj[key] === "string") {
		// 		// Remove null characters from strings
		// 		sanitizedObj[key] = obj[key].replace(/\u0000/g, "");
		// 	} else {
		// 		sanitizedObj[key] = obj[key];
		// 	}
		// 	}
		// 	return sanitizedObj;
		// }
		
		// // Sanitize the entire orgList array
		// const sanitizedOrgList = orgList.map(sanitizeObject);


	// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	// if (!supabaseUrl || !supabaseKey) {
	// 	console.error("Supabase URL or Service Role Key is missing.");
	// 	return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
	// }


  		// // Insert data into the Supabase database
		// const { error } = await supabase.from("clubs").insert(sanitizedOrgList);

		// if (error) {
		// console.error("Error inserting data into Supabase:", error);
		// 	return new Response(JSON.stringify({ error: "Failed to insert data into database" }), { status: 500 });
		// }
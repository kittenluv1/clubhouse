import { createClient } from '@supabase/supabase-js';

export async function GET(req) {

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !supabaseKey) {
		console.error("Supabase URL or Service Role Key is missing.");
		return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
	}
	
	const supabase = createClient(supabaseUrl, supabaseKey);

	try {
	  const response = await fetch("https://sa.ucla.edu/RCO/Public/SearchOrganizations", {
		method: "POST",
	  });
  
	  if (!response.ok) {
		throw new Error(`Response status: ${response.status}`);
	  }
  
	  const data = await response.json();
	  const orgList = data.orgList;

		// // Insert data into the Supabase database
		// const { error } = await supabase.from("clubs").insert(orgList);

		// if (error) {
		// console.error("Error inserting data into Supabase:", error);
		// 	return new Response(JSON.stringify({ error: "Failed to insert data into database" }), { status: 500 });
		// }

	  return new Response(JSON.stringify(data, null, 2), { status: 200 });
	} catch (error) {
	  console.error("Error fetching data:", error);
	  return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
	}
  }
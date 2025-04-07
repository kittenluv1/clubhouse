export async function GET(req) {
	try {
	  const response = await fetch("https://sa.ucla.edu/RCO/Public/SearchOrganizations", {
		method: "POST",
	  });
  
	  if (!response.ok) {
		throw new Error(`Response status: ${response.status}`);
	  }
  
	  const data = await response.json();
	  return new Response(JSON.stringify(data), { status: 200 });
	} catch (error) {
	  console.error("Error fetching data:", error);
	  return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
	}
  }
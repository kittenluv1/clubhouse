import { supabaseServer } from "../lib/server-db.js";

export async function GET(req) {
  if (!supabaseServer) {
    console.error("supabaseServerServer client is not initialized.");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500 },
    );
  }

  try {
    // API TO GET CLUB SPORTS DATA - IMPLEMENT IN THE FUTURE
    //   const response = await fetch("https://sa.ucla.edu/RCO/Public/SearchOrganizations", {
    //   "headers": {
    //     "content-type": `application/json`,
    //   },
    //   "body": "{\"catValueStringText\":\"All Categories\",\"searchString\":\"\",\"catValueString\":-1}",
    //   "method": "POST",
    // })

    const response = await fetch(
      "https://sa.ucla.edu/RCO/Public/SearchOrganizations",
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();

    const orgList = data.orgList;

    // Sanitize a single object by removing null characters
    function sanitizeObject(obj) {
      const sanitizedObj = {};
      for (const key in obj) {
        if (typeof obj[key] === "string") {
          // Remove null characters from strings
          sanitizedObj[key] = obj[key].replace(/\u0000/g, "");
        } else {
          sanitizedObj[key] = obj[key];
        }
      }
      return sanitizedObj;
    }

    // Sanitize the entire orgList array
    const sanitizedOrgList = orgList.map(sanitizeObject);

    // Insert data into the Supabase database
    const { error } = await supabaseServer
      .from("clubs")
      .upsert(sanitizedOrgList, { onConflict: "OrganizationID" });

    if (error) {
      console.error("Error inserting data into Supabase:", error);
      return new Response(
        JSON.stringify({ error: "Failed to insert data into database" }),
        { status: 500 },
      );
    }

    return new Response(JSON.stringify(data, null, 2), { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
    });
  }
}

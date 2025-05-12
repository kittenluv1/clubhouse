import { supabase } from "../../../../lib/db";  // Adjust import path as needed

export async function GET(request, context) {
    // Get the name directly from the route params
    const { params } = context;
    const name = params.name;
    
    console.log("Club name search:", name);
  
    try {
      // Search for clubs with a name that partially matches the search term
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("OrganizationName", name);
  
      if (error) {
        console.error("Supabase error:", error);
        return Response.json({ error: "Database query failed" }, { status: 500 });
      }
  
      console.log("Search results:", data.length, "clubs found");
      return Response.json({ orgList: data });
    } catch (error) {
      console.error("Error fetching data:", error);
      return Response.json({ error: "Failed to fetch data" }, { status: 500 });
    }
  }
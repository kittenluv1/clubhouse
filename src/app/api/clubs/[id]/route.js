import { supabase } from "@/app/lib/db";

export async function GET(request, context) {
  // await context params before using
  const resolvedParams = await context.params;
  const encodedClubId = resolvedParams.id;

  if (!encodedClubId) {
    console.error("API Error: ID parameter is missing from the URL.");
    return Response.json({ error: "ID parameter is missing" }, { status: 400 });
  }

  let decodedClubName;
  try {
    // Assuming the 'id' parameter from the URL is the club name that needs decoding
    decodedClubName = decodeURIComponent(encodedClubId);
  } catch (e) {
    console.error(
      "API Error: Failed to decode ID parameter:",
      encodedClubId,
      e,
    );
    return Response.json(
      { error: "Invalid ID parameter encoding" },
      { status: 400 },
    );
  }

  console.log("Decoded club name for search:", decodedClubName);

  try {
    // Search for clubs with a name that partially matches the search term
    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .eq("OrganizationName", encodedClubId);

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
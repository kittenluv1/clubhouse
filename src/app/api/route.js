import { supabaseServer } from "../lib/server-db.js";

export async function GET(req) {
  if (!supabaseServer) {
    console.error("supabaseServer client is not initialized.");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500 },
    );
  }

  try {
    // Fetch regular clubs
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

    // Fetch club sports
    const clubSportsResponse = await fetch(
      "https://sa.ucla.edu/RCO/Public/SearchOrganizations",
      {
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          catValueStringText: "All Categories",
          searchString: "",
          catValueString: -1,
        }),
        method: "POST",
      },
    );

    if (!clubSportsResponse.ok) {
      throw new Error(`Club sports response status: ${clubSportsResponse.status}`);
    }

    const clubSportsData = await clubSportsResponse.json();
    const clubSportsOrgList = clubSportsData.clubSportsOrgList || [];

    // Map club sports to match regular clubs in Supabase
    const mappedClubSports = clubSportsOrgList.map(sport => ({
      OrganizationID: sport.id,
      OrganizationName: sport.name,
      OrganizationDescription: sport.description,
      OrganizationEmail: sport.program_email_address,
      OrganizationWebSite: sport.links?.find(link => link.name && link.url.includes("uclaclubsports.com"))?.url || null,
      Category1Name: "Club Sports",
      Category2Name: sport.identification,
      AdvisorName: null,
      Sig1Name: null,
      Sig2Name: null,
      Sig3Name: null,
      MemberType: null,
      SocialMediaLink: sport.links?.find(link => link.name && (link.name.includes("Instagram") || link.name.includes("Facebook")))?.url || null
    }));

    const combinedOrgList = [...orgList, ...mappedClubSports];

    // Sanitize a single object by removing null characters and null fields
    function sanitizeObject(obj) {
      const sanitizedObj = {};
      for (const key in obj) {
        if (obj[key] === null) {
          continue;
        }
        if (typeof obj[key] === "string") {
          sanitizedObj[key] = obj[key].replace(/\u0000/g, "");
        } else {
          sanitizedObj[key] = obj[key];
        }
      }
      return sanitizedObj;
    }

    const sanitizedOrgList = combinedOrgList.map(sanitizeObject);

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

    return new Response(
      JSON.stringify({
        totalClubs: sanitizedOrgList.length,
        regularClubs: orgList.length,
        clubSports: clubSportsOrgList.length
      }, null, 2),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
    });
  }
}
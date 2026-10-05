// Fetches the club directory from UCLA Student Affairs (SOLE) and shapes it
// into rows for the clubs table. Regular clubs already use the table's column
// names; club sports come back in a different shape and are mapped here.

const SEARCH_URL = "https://sa.ucla.edu/RCO/Public/SearchOrganizations";

/**
 * @param {any} sport an entry of clubSportsOrgList
 * @returns {Record<string, unknown>}
 */
export function mapClubSport(sport) {
  const links = sport.links ?? [];
  const website = links.find((link) => link.name && link.url.includes("uclaclubsports.com"));
  const social = links.find((link) => link.name && (link.name.includes("Instagram") || link.name.includes("Facebook")));

  return {
    OrganizationID: sport.id,
    OrganizationName: sport.name,
    OrganizationDescription: sport.description,
    OrganizationEmail: sport.program_email_address,
    OrganizationWebSite: website?.url ?? null,
    Category1Name: "Club Sports",
    Category2Name: sport.identification,
    AdvisorName: null,
    Sig1Name: null,
    Sig2Name: null,
    Sig3Name: null,
    MemberType: null,
    SocialMediaLink: social?.url ?? null,
  };
}

/**
 * Drop null fields (so a sync never blanks stored values) and remove NUL
 * characters, which Postgres text columns reject.
 * @param {Record<string, unknown>} club
 */
export function sanitizeClub(club) {
  return Object.fromEntries(
    Object.entries(club)
      .filter(([, value]) => value !== null)
      .map(([key, value]) => [key, typeof value === "string" ? value.replace(/\u0000/g, "") : value]),
  );
}

async function search(init) {
  const response = await fetch(SEARCH_URL, { method: "POST", ...init });
  if (!response.ok) throw new Error(`UCLA club search responded ${response.status}`);
  return response.json();
}

/**
 * @returns {Promise<{ clubs: Record<string, unknown>[], regularCount: number, sportsCount: number }>}
 */
export async function fetchUclaClubs() {
  const { orgList = [] } = await search();
  const { clubSportsOrgList = [] } = await search({
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ catValueStringText: "All Categories", searchString: "", catValueString: -1 }),
  });

  return {
    clubs: [...orgList, ...clubSportsOrgList.map(mapClubSport)].map(sanitizeClub),
    regularCount: orgList.length,
    sportsCount: clubSportsOrgList.length,
  };
}

import { mapClubSport, sanitizeClub } from "@/app/lib/clubs/uclaSource";

describe("mapClubSport", () => {
  const sport = {
    id: "V3Q2-L6L95",
    name: "Archery",
    description: "Beginner friendly.",
    program_email_address: "archery@ucla.edu",
    identification: "Archery",
    links: [
      { name: "Website", url: "https://uclaclubsports.com/sports/archery" },
      { name: "Facebook", url: "https://facebook.com/archery" },
    ],
  };

  it("maps a club sport onto the clubs table columns", () => {
    expect(mapClubSport(sport)).toEqual({
      OrganizationID: "V3Q2-L6L95",
      OrganizationName: "Archery",
      OrganizationDescription: "Beginner friendly.",
      OrganizationEmail: "archery@ucla.edu",
      OrganizationWebSite: "https://uclaclubsports.com/sports/archery",
      Category1Name: "Club Sports",
      Category2Name: "Archery",
      AdvisorName: null,
      Sig1Name: null,
      Sig2Name: null,
      Sig3Name: null,
      MemberType: null,
      SocialMediaLink: "https://facebook.com/archery",
    });
  });

  it("leaves links empty when the sport has none", () => {
    const mapped = mapClubSport({ ...sport, links: undefined });
    expect(mapped.OrganizationWebSite).toBeNull();
    expect(mapped.SocialMediaLink).toBeNull();
  });
});

describe("sanitizeClub", () => {
  it("drops null fields and strips NUL characters from strings", () => {
    expect(sanitizeClub({ a: "x\u0000y", b: null, c: 3 })).toEqual({
      a: "xy",
      c: 3,
    });
  });

  it("drops blank strings so a sync never wipes a stored description", () => {
    expect(
      sanitizeClub({
        OrganizationID: "1",
        OrganizationDescription: "  ",
        OrganizationEmail: "",
        OrganizationName: "A",
      }),
    ).toEqual({ OrganizationID: "1", OrganizationName: "A" });
  });
});

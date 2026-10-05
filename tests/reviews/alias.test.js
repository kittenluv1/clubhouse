import { randomAlias, ALIAS_ADJECTIVES, ALIAS_NOUNS } from "@/app/lib/reviews/alias";

describe("randomAlias", () => {
  it("joins an adjective and a noun behind an @", () => {
    expect(randomAlias(() => 0)).toBe(`@${ALIAS_ADJECTIVES[0]}${ALIAS_NOUNS[0]}`);
  });

  it("can pick the last adjective and noun", () => {
    const alias = randomAlias(() => 0.9999);
    expect(alias).toBe(`@${ALIAS_ADJECTIVES.at(-1)}${ALIAS_NOUNS.at(-1)}`);
  });
});

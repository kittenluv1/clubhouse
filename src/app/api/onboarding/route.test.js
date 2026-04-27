/**
 * @jest-environment node
 */

import { GET, POST, PATCH } from "./route";

jest.mock("@/app/lib/server-db", () => ({
    createAuthenticatedClient: jest.fn(),
}));

import { createAuthenticatedClient } from "@/app/lib/server-db";

const MOCK_USER = { id: "user-123" };

function makeClient({
    user = MOCK_USER,
    authError = null,
    profileData = null,
    profileError = null,
    deleteError = null,
    interestsError = null,
} = {}) {
    // Stable mock references so tests can inspect calls without re-invoking client.from()
    const mocks = {
        profileUpdate: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: profileError }),
        }),
        profileSelect: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: profileData, error: profileError }),
            }),
        }),
        interestsDeleteEq: jest.fn().mockResolvedValue({ error: deleteError }),
        interestsInsert: jest.fn().mockResolvedValue({ error: interestsError }),
    };
    mocks.interestsDelete = jest.fn().mockReturnValue({ eq: mocks.interestsDeleteEq });

    const client = {
        auth: {
            getUser: jest.fn().mockResolvedValue({ data: { user }, error: authError }),
        },
        from: jest.fn((table) => {
            if (table === "profiles") {
                return { select: mocks.profileSelect, update: mocks.profileUpdate };
            }
            if (table === "user_interests") {
                return { delete: mocks.interestsDelete, insert: mocks.interestsInsert };
            }
        }),
        _mocks: mocks,
    };
    return client;
}

function makeRequest(method, body) {
    return new Request(`http://localhost/api/onboarding`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
}

beforeEach(() => {
    jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------

describe("GET /api/onboarding", () => {
    test("returns 401 when not authenticated", async () => {
        createAuthenticatedClient.mockResolvedValue(makeClient({ user: null, authError: new Error("no session") }));
        const res = await GET();
        expect(res.status).toBe(401);
    });

    test("returns onboarding_completed: false when not yet done", async () => {
        createAuthenticatedClient.mockResolvedValue(
            makeClient({ profileData: { onboarding_completed: false } })
        );
        const res = await GET();
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.onboarding_completed).toBe(false);
    });

    test("returns onboarding_completed: true when already done", async () => {
        createAuthenticatedClient.mockResolvedValue(
            makeClient({ profileData: { onboarding_completed: true } })
        );
        const res = await GET();
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.onboarding_completed).toBe(true);
    });

    test("returns 500 when profile fetch fails", async () => {
        createAuthenticatedClient.mockResolvedValue(
            makeClient({ profileError: new Error("db error") })
        );
        const res = await GET();
        expect(res.status).toBe(500);
    });
});

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------

describe("POST /api/onboarding", () => {
    test("returns 401 when not authenticated", async () => {
        createAuthenticatedClient.mockResolvedValue(makeClient({ user: null, authError: new Error("no session") }));
        const res = await POST(makeRequest("POST", {}));
        expect(res.status).toBe(401);
    });

    test("saves majors, minors, and clubs to profile and marks onboarding complete", async () => {
        const client = makeClient();
        createAuthenticatedClient.mockResolvedValue(client);

        const res = await POST(makeRequest("POST", {
            majors: ["Computer Science"],
            minors: ["Math"],
            currentClubs: ["Chess Club"],
            broadCategories: [],
            subcategories: [],
        }));

        expect(res.status).toBe(200);
        const updateArg = client._mocks.profileUpdate.mock.calls[0]?.[0];
        expect(updateArg).toMatchObject({
            onboarding_completed: true,
            majors: ["Computer Science"],
            minors: ["Math"],
            current_clubs: ["Chess Club"],
        });
    });

    test("saves only subcategories to user_interests table (broad categories are not persisted)", async () => {
        const client = makeClient();
        createAuthenticatedClient.mockResolvedValue(client);

        const res = await POST(makeRequest("POST", {
            broadCategories: ["Arts & Media", "Health & Wellness"],
            subcategories: ["Dance"],
        }));

        expect(res.status).toBe(200);
        const insertCall = client._mocks.interestsInsert.mock.calls[0]?.[0];
        expect(insertCall).toEqual([{ user_id: MOCK_USER.id, category: "Dance" }]);
        const categories = insertCall.map((r) => r.category);
        expect(categories).not.toContain("Arts & Media");
        expect(categories).not.toContain("Health & Wellness");
    });

    test("deduplicates subcategories that appear more than once", async () => {
        const client = makeClient();
        createAuthenticatedClient.mockResolvedValue(client);

        await POST(makeRequest("POST", {
            broadCategories: ["Arts & Media"],
            subcategories: ["Dance", "Dance"],
        }));

        const insertCall = client._mocks.interestsInsert.mock.calls[0]?.[0];
        const categories = insertCall.map((r) => r.category);
        expect(categories.filter((c) => c === "Dance")).toHaveLength(1);
    });

    test("skips interest insert when no interests provided", async () => {
        const client = makeClient();
        createAuthenticatedClient.mockResolvedValue(client);

        await POST(makeRequest("POST", { broadCategories: [], subcategories: [] }));

        // delete should not be called either since there's nothing to replace
        const interestsFrom = client.from.mock.calls.filter(([t]) => t === "user_interests");
        expect(interestsFrom).toHaveLength(0);
    });

    test("returns 500 when profile update fails", async () => {
        createAuthenticatedClient.mockResolvedValue(
            makeClient({ profileError: new Error("db error") })
        );
        const res = await POST(makeRequest("POST", {}));
        expect(res.status).toBe(500);
    });

    test("returns 500 when interests insert fails", async () => {
        createAuthenticatedClient.mockResolvedValue(
            makeClient({ interestsError: new Error("insert failed") })
        );
        const res = await POST(makeRequest("POST", {
            subcategories: ["Dance"],
        }));
        expect(res.status).toBe(500);
    });
});

// ---------------------------------------------------------------------------
// PATCH
// ---------------------------------------------------------------------------

describe("PATCH /api/onboarding", () => {
    test("returns 401 when not authenticated", async () => {
        createAuthenticatedClient.mockResolvedValue(makeClient({ user: null, authError: new Error("no session") }));
        const res = await PATCH(makeRequest("PATCH", {}));
        expect(res.status).toBe(401);
    });

    test("updates profile without setting onboarding_completed", async () => {
        const client = makeClient();
        createAuthenticatedClient.mockResolvedValue(client);

        const res = await PATCH(makeRequest("PATCH", {
            majors: ["Biology"],
            minors: [],
            currentClubs: [],
        }));

        expect(res.status).toBe(200);
        const updateArg = client._mocks.profileUpdate.mock.calls[0]?.[0];
        expect(updateArg).not.toHaveProperty("onboarding_completed");
        expect(updateArg).toMatchObject({ majors: ["Biology"] });
    });

    test("replaces interests on update", async () => {
        const client = makeClient();
        createAuthenticatedClient.mockResolvedValue(client);

        const res = await PATCH(makeRequest("PATCH", {
            broadCategories: ["Health & Wellness"],
            subcategories: [],
        }));

        expect(res.status).toBe(200);
        // delete should be called before insert
        expect(client._mocks.interestsDeleteEq).toHaveBeenCalledWith("user_id", MOCK_USER.id);
    });

    test("returns 500 when profile update fails", async () => {
        createAuthenticatedClient.mockResolvedValue(
            makeClient({ profileError: new Error("db error") })
        );
        const res = await PATCH(makeRequest("PATCH", {}));
        expect(res.status).toBe(500);
    });

    test("returns 500 when delete of existing interests fails", async () => {
        createAuthenticatedClient.mockResolvedValue(
            makeClient({ deleteError: new Error("delete failed") })
        );
        const res = await PATCH(makeRequest("PATCH", {}));
        expect(res.status).toBe(500);
    });
});

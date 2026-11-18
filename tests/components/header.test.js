import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "@/app/components/header";
import { AuthProvider, useRequireAuth } from "@/app/context/AuthContext";

let mockAuthChangeCallback;
let mockPathname = "/profile";
const mockGetSession = jest.fn();
const mockSignOut = jest.fn();
const mockProfileSingle = jest.fn();
const mockRouter = { push: jest.fn(), replace: jest.fn() };

jest.mock("@/app/lib/db", () => ({
  supabase: {
    auth: {
      getSession: (...args) => mockGetSession(...args),
      onAuthStateChange: (callback) => {
        mockAuthChangeCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      },
      signOut: (...args) => mockSignOut(...args),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ single: (...args) => mockProfileSingle(...args) }),
      }),
    }),
  },
}));

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => mockRouter,
}));

jest.mock("@/app/components/search-bar", () => () => null);

function ProtectedPage() {
  useRequireAuth();
  return <div>Protected page</div>;
}

function renderHeaderOnProtectedPage() {
  return render(
    <AuthProvider>
      <Header />
      <ProtectedPage />
    </AuthProvider>,
  );
}

describe("Header sign out", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = "/profile";
    mockAuthChangeCallback = undefined;
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: "token",
          user: { id: "user-1", email: "user@example.com" },
        },
      },
    });
    mockSignOut.mockImplementation(async () => {
      mockAuthChangeCallback("SIGNED_OUT", null);
      return { error: null };
    });
    mockProfileSingle.mockResolvedValue({ data: { avatar_id: 1 }, error: null });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ profile: { avatar_id: 1 } }),
    });
  });

  async function clickSignOut() {
    await screen.findByRole("button", { name: "Sign out" });
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    const signOutButton = screen
      .getByText("Sign Out", { exact: true })
      .closest("button");
    await act(async () => {
      fireEvent.click(signOutButton);
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  it("ends at home after SIGNED_OUT and the auth redirect effect settle", async () => {
    renderHeaderOnProtectedPage();

    await clickSignOut();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/"));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace.mock.calls.at(-1)).toEqual(["/"]);
    expect(mockRouter.replace).not.toHaveBeenCalledWith(
      "/sign-in?returnUrl=%2Fprofile",
    );
  });

  it("does not navigate when sign out fails", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockSignOut.mockResolvedValue({ error: { message: "network error" } });
    renderHeaderOnProtectedPage();

    await clickSignOut();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/profile", "/review", "/admin"];

function isProtectedRoute(pathname) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Only check protected routes
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on the request (for downstream server components)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Re-create response so it carries the updated request cookies
          supabaseResponse = NextResponse.next({ request });
          // Set cookies on the response (sent back to browser)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not authenticated → redirect to sign-in with returnUrl
  if (!user) {
    const returnUrl = encodeURIComponent(pathname);
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/sign-in";
    signInUrl.search = `?returnUrl=${returnUrl}`;
    return NextResponse.redirect(signInUrl);
  }

  // Admin route but not admin → redirect to home
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/profile/:path*", "/review/:path*", "/admin/:path*"],
};

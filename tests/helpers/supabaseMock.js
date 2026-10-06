/**
 * Chainable fake for the Supabase query builder.
 *
 * Every call made on a query (`select`, `eq`, `or`, `order`, `single`, ...)
 * is recorded, and awaiting the query resolves to whatever `respond` returns
 * for it. Tests can then assert on the recorded calls instead of mirroring
 * the exact shape of the builder chain.
 *
 *   const db = createSupabaseMock({
 *     user: { id: "u1" },
 *     respond: ({ table }) => table === "clubs" ? { data: [club] } : { data: [] },
 *   });
 *   db.queries        // [{ table, calls: [{ method, args }] }, ...]
 *   db.callsTo("or")  // args of every `.or(...)` call across queries
 */
export function createSupabaseMock({
  user = null,
  authError = null,
  respond = () => ({ data: null, error: null }),
} = {}) {
  const queries = [];

  function from(table) {
    const query = { table, calls: [] };
    queries.push(query);

    const builder = new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === "then") {
            const result = { data: null, error: null, ...respond(query) };
            return (resolve, reject) =>
              Promise.resolve(result).then(resolve, reject);
          }
          return (...args) => {
            query.calls.push({ method: prop, args });
            return builder;
          };
        },
      },
    );
    return builder;
  }

  return {
    auth: {
      getUser: jest.fn(async () => ({ data: { user }, error: authError })),
    },
    from: jest.fn(from),
    queries,
    callsTo(method) {
      return queries.flatMap((q) =>
        q.calls.filter((c) => c.method === method).map((c) => c.args),
      );
    },
  };
}

/** Find the first recorded call of `method` on a query. */
export function findCall(query, method) {
  return query.calls.find((c) => c.method === method);
}

/** Build a minimal NextRequest-like object for route handler tests. */
export function makeRequest({
  url = "http://localhost/api",
  body,
  headers = {},
} = {}) {
  const parsed = new URL(url);
  return {
    url,
    nextUrl: parsed,
    headers: new Headers(headers),
    json: async () => {
      if (body === undefined)
        throw new SyntaxError("Unexpected end of JSON input");
      return body;
    },
  };
}

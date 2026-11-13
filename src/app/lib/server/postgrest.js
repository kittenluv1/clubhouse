// Helpers for building PostgREST filter strings from untrusted input.
//
// Filter strings passed to `.or()` are parsed by PostgREST: `,` separates
// conditions and `.`, `:`, `(` and `)` are syntax. Pasting user input into
// them lets the caller add conditions of their own, so every value goes
// through these helpers instead.

/**
 * Escape a term for use inside a LIKE/ILIKE pattern so it matches literally.
 * PostgREST also treats `*` as an alias for `%`; it has no escape, so drop it.
 * @param {string} term
 * @returns {string}
 */
export function escapeLike(term) {
  return term.replace(/\*/g, "").replace(/[\\%_]/g, "\\$&");
}

/**
 * Quote a value for a PostgREST filter string so reserved characters lose
 * their meaning.
 * @param {string} value
 * @returns {string}
 */
function quoteFilterValue(value) {
  return `"${value.replace(/[\\"]/g, "\\$&")}"`;
}

/**
 * Build an `.or()` filter matching rows where any column contains any term
 * (case-insensitive substring match).
 * @param {string[]} columns trusted column names
 * @param {string[]} terms untrusted search terms
 * @returns {string}
 */
export function ilikeAnyFilter(columns, terms) {
  return terms
    .map((term) => term.trim())
    .filter(Boolean)
    .flatMap((term) => {
      const value = quoteFilterValue(`%${escapeLike(term)}%`);
      return columns.map((column) => `${column}.ilike.${value}`);
    })
    .join(",");
}

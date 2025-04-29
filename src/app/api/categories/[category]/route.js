// app/api/categories/[category]/route.js   (or pages/api/categories/[category].js)

import { supabase } from '../../../lib/db'; // adjust as needed

export async function GET(request, { params }) {
  // 1) Pull page & pageSize out of the URL
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10));

  // 2) Decode the category path param
  const raw = params.category;
  const category = decodeURIComponent(raw).trim();

  // 3) Compute Supabase “range” (inclusive):
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    // 4) Run a single query that both fetches rows and returns a count:
    const { data, count, error } = await supabase
      .from('clubs')
      .select(
        `*`,
        { count: 'exact' }           // <-- tell Supabase you need the total count
      )
      .or(
        `Category1Name.ilike.%${category}%,Category2Name.ilike.%${category}%`
      )
      .range(from, to);             // <-- apply limit/offset in one go

    if (error) {
      console.error('Supabase error:', error);
      return new Response(
        JSON.stringify({ error: 'Database query failed' }),
        { status: 500 }
      );
    }

    // 5) Figure out how many pages there are
    const totalItems = count || 0;
    const totalNumPages = Math.max(1, Math.ceil(totalItems / pageSize));

    // 6) Return the shape your front end expects:
    return new Response(
      JSON.stringify({
        orgList: data,
        totalNumPages,
      }),
      { status: 200 }
    );

  } catch (err) {
    console.error('Error fetching data:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch data' }),
      { status: 500 }
    );
  }
}

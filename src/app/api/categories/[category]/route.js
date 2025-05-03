// app/api/categories/[category]/route.js   (or pages/api/categories/[category].js)
import { supabase } from '../../../lib/db'; // adjust as needed

export async function GET(request, { params }) {
  try {
    // 1) Pull page & pageSize out of the URL
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const sortType = searchParams.get("sort") || "Highest Rating";
    const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10));

    const raw = params.category; // 2) Decode the category path param
    const category = decodeURIComponent(raw).trim();

    const from = (page - 1) * pageSize; // 3) Compute Supabase “range” (inclusive):
    const to = from + pageSize - 1;     

    // default sort type
    let sortBy = "average_satisfaction"
    let ascending = false; // default is descending order
    if (sortType === "reviews"){
      sortBy = "total_num_reviews";
    }
    else if (sortType === "alphabetical") { 
      sortBy = "OrganizationName";
      ascending = true; // alphabetic order needs to go in ascending order
    }

    // 4) Run a single query that both fetches rows and returns a count:
    const { data, count, error } = await supabase
      .from('clubs')
      .select(`*`, { count: 'exact' })           // <-- tell Supabase you need the total count
      .or(`Category1Name.ilike.%${category}%,Category2Name.ilike.%${category}%`)
      .order(sortBy, { ascending, nullsFirst: false})
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

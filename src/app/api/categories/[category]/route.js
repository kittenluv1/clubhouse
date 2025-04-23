import { supabase } from '../../../lib/db'; // adjust path if needed

export async function GET(request, { params }) {
  // 1) Extract & decode the category from the URL
  const raw = params.category;
  const category = decodeURIComponent(raw).trim();

  console.log('Club category search:', category);

  try {
    // 2) Query Supabase for clubs matching either Category1Name or Category2Name
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .or(
        `Category1Name.ilike.%${category}%,Category2Name.ilike.%${category}%`
      );

    if (error) {
      console.error('Supabase error:', error);
      return new Response(
        JSON.stringify({ error: 'Database query failed' }),
        { status: 500 }
      );
    }

    console.log('Search results:', data.length, 'clubs found');
    // 3) Return in the shape your front-end expects
    return new Response(
      JSON.stringify({ orgList: data }),
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

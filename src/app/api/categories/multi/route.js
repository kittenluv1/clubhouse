// app/api/categories/multi/route.js
import { supabase } from '../../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawList = searchParams.get('list');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (!rawList) {
    return new Response(JSON.stringify({ orgList: [], totalNumPages: 1 }), { status: 200 });
  }

  const categories = decodeURIComponent(rawList)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  console.log('[categories/multi] rawList:', rawList);
  console.log('[categories/multi] parsed:', categories);

  if (!categories.length) {
    return new Response(JSON.stringify({ orgList: [], totalNumPages: 1 }), { status: 200 });
  }

  // ✅ Correct way: flatten all fields into one array
  const filters = categories.flatMap(cat => [
    `Category1Name.ilike.%${cat}%`,
    `Category2Name.ilike.%${cat}%`,
  ]);

  try {
    const { data, count, error } = await supabase
      .from('clubs')
      .select('*', { count: 'exact' })
      .or(filters.join(',')) // ✅ correct flat OR
      .range(from, to);

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: 'Database query failed' }), { status: 500 });
    }

    const totalItems = count || 0;
    const totalNumPages = Math.max(1, Math.ceil(totalItems / pageSize));

    return new Response(
      JSON.stringify({ orgList: data, totalNumPages }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Fetch error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch data' }),
      { status: 500 }
    );
  }
}

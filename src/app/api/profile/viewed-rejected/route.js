import { createAuthenticatedClient } from "../../../lib/server-db";

export async function POST(req) {
  try {
    const supabase = await createAuthenticatedClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - please sign in" }),
        { status: 401 }
      );
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ last_viewed_rejected_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating last_viewed_rejected_at:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update viewed timestamp' }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in viewed-rejected API:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update viewed timestamp' }),
      { status: 500 }
    );
  }
}

// POST (create like), DELETE (unlike)
import { supabaseServer } from "../../lib/db"; 


export async function POST(request, {params: {clubid}}) {
  try {
    const { data: sessionData, error: sessionError } = await supabaseServer.auth.getSession();

    if (sessionError || !sessionData.session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const userId = sessionData.session.user.id;

    const { data, error } = await supabaseServer
      .from("likes")
      .insert([{ clubid, userid: userId }]);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "Like added", like: data[0] }), { status: 201 });
  } catch (err) {
    console.error("Unexpected error in POST /api/likes/[clubid]:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

export async function DELETE(request, {params: {clubid}}) {
  try {
    const { data: sessionData, error: sessionError } = await supabaseServer.auth.getSession();

    if (sessionError || !sessionData.session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const userId = sessionData.session.user.id;

    const { data, error } = await supabaseServer
      .from("likes")
      .delete()
      .eq("clubid", clubid)
      .eq("userid", userId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "Like removed" }), { status: 200 });
  } catch (err) {
    console.error("Unexpected error in DELETE /api/likes/[clubid]:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}  

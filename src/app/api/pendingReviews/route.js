import { supabase } from "@/app/lib/db";

export async function GET(req) {
  const sortType = req.nextUrl.searchParams.get("sort");
  const orderBy = sortType === "newest" ? false : true;

  try {
    const { data, error } = await supabase
      .from("pending_reviews")
      .select("*")
      .order("created_at", { ascending: orderBy });

    // query has failed
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }
    return new Response(JSON.stringify({ pendingReviews: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // internal supabase error!
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    const { reviewID, approve } = await req.json();

    if (!reviewID || typeof approve !== "boolean") {
      return new Response(
        JSON.stringify({
          error: "Invalid request: issue with id or approve boolean",
        }),
        { status: 400 },
      );
    }

    // Approve flow: insert → delete
    if (approve) {
      const { data: review, error } = await supabase
        .from("pending_reviews")
        .select("*")
        .eq("id", reviewID)
        .single();

      if (error || !review) {
        throw new Error(error?.message || "Review not found");
      }

      const { error: insertError } = await supabase
        .from("reviews")
        .insert(review);

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    // Delete the pending review (always, regardless of approve or reject)
    const { error: deleteError } = await supabase
      .from("pending_reviews")
      .delete()
      .eq("id", reviewID);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return new Response(
      JSON.stringify({
        message: approve
          ? "Review approved and moved to reviews table"
          : "Review rejected and deleted from pending table",
      }),
      { status: 200 },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

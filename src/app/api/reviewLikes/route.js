import { supabase } from "@/app/lib/db";
import { createServerClient } from "@/app/lib/server-db";


export async function GET(req, context) {
    const params = await context.params;
    const userId = params.userId;
    const reviewId = params.reviewId;
    // merge profiles
    try {
        var reviewsLiked, reviewsLikedError;
        if (userId) { //Getting liked reviews by User that liked it
            const { data: likes, error: error } = await supabase
                .from("review_likes")
                .select("*")
                .eq("user_id", userId);
            reviewsLiked, reviewsLikedError = likes, error;
        } else if (reviewId) { // Getting likes from a certain review 
            const { data: likes, error: error } = await supabase
                .from("review_likes")
                .select("*")
                .eq("reviewId", reviewId);
            reviewsLiked, reviewsLikedError = likes, error;
        } else {
            console.error("API Error: user or review ID required. ");
            return Response.json({ error: "user/review ID parameter is missing" }, { status: 400 });
        }
        if (reviewsLikedError) {
            console.error("Supabase error:", reviewsLikedError);
            return Response.json({ error: "Database query for review likes failed" }, { status: 500 });
        }
        let reviewIds = reviewsLiked.map(review => review.id);
        return reviewIds;
    } catch {
        console.error("Error fetching data:", error);
        return Response.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

export async function POST(req) {
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const supabase = createServerClient(authHeader);

    try {
        const { userId, reviewId, timestamp, userLiked } = await req.json();

        if (userLiked) { // User liked a review
            const review = // Not sure if its repetitive to convert json -> const -> json
            {
                review_id: reviewId,
                user_id: userId,
                created_at: timestamp
            }
            const { error: insertError } = await supabase
                .from("reviews_likes")
                .insert(review);
            if (insertError) {
                throw new Error(insertError.message);
            }
        } else if (!userLiked) { // User unliked a review: (!userLiked) for clarity
            const { error: insertError } = await supabase
                .from("review_likes")
                .delete()
                .eq("review_id", reviewId)
                .eq("user_id", userId);
            if (insertError) {
                throw new Error(insertError.message);
            }
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
        });
    }
}
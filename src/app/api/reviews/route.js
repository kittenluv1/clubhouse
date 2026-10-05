import { randomAlias } from "@/app/lib/reviews/alias";
import { parseReviewInput } from "@/app/lib/reviews/schema";
import { HttpError, readJson, withUser } from "@/app/lib/server/route";

// New reviews wait in pending_reviews until an admin approves them.
export const POST = withUser(async (req, { supabase, user }) => {
  const parsed = parseReviewInput(await readJson(req));
  if (!parsed.success) throw new HttpError(400, parsed.error);

  const { data, error } = await supabase
    .from("pending_reviews")
    .insert({
      ...parsed.data,
      user_id: user.id,
      user_email: user.email,
      user_alias: randomAlias(),
    })
    .select()
    .single();

  if (error) throw error;

  return Response.json({ review: data }, { status: 201 });
});

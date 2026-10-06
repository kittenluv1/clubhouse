import { ownedReviewHandlers } from "@/app/lib/server/handlers/ownedReview";

const handlers = ownedReviewHandlers("approved");

export const GET = handlers.GET;
export const POST = handlers.POST;

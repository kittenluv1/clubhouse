import { ownedReviewHandlers } from "@/app/lib/server/handlers/ownedReview";

const handlers = ownedReviewHandlers("rejected");

export const GET = handlers.GET;
export const POST = handlers.POST;
export const DELETE = handlers.DELETE;

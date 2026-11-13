import { clubListResponse } from "@/app/lib/server/handlers/clubList";

export async function GET(req, { params }) {
  // Next.js already URL-decodes route params; decoding again breaks on "%"
  const { category } = await params;
  return clubListResponse(req, { categories: [category.trim().slice(0, 200)] });
}

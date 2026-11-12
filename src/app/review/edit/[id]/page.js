"use client";

import { useParams, useSearchParams } from "next/navigation";
import ReviewForm from "../../../components/ReviewForm";

export default function EditReviewPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const source =
    searchParams.get("source") === "approved" ? "approved" : "rejected";

  return <ReviewForm key={`${source}/${id}`} reviewId={id} source={source} />;
}

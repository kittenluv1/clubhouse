export async function toggleReviewLike(reviewId, isLiked) {
  const response = await fetch("/api/reviewLikes", {
    method: isLiked ? "POST" : "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ review_id: reviewId }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(data?.message || "Failed to update review like");
  }
}

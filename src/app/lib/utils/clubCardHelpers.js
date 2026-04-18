export const handleCategoryClick = (router, e, categoryName) => {

	e.preventDefault();
	e.stopPropagation();
	const encoded = encodeURIComponent(categoryName);
	router.push(`/clubs?categories=${encoded}#discover`);
};

export const renderRatingStars = (rating) => {
	const ratingStars = [];
	const intRating = Math.round(rating || 0);
	const ratingDecimal = (Math.round(rating * 10) / 10) - Math.floor(rating);
	for (let x = 0; x < 5; x++) {
		if (x < intRating) {
			if ((rating - ratingDecimal) == x && (ratingDecimal < 0.8) && (ratingDecimal > 0.2)) {
				ratingStars.push(<img
					key={x}
					src={"reviewStarHalf.svg"}
					className="mr-1"
				/>);
			} else {
				ratingStars.push(<img
					key={x}
					src={"reviewStarFilled.svg"}
					className="mr-1"
				/>);
			}

		} else {
			ratingStars.push(<img
				key={x}
				src={"reviewStarUnfilled.svg"}
				className="mr-1"
			/>);
		}

	}
	return ratingStars;
}
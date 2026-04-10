import { createAuthenticatedClient } from "@/app/lib/server-db";

export async function GET(req, { params }) {
	const { id } = await params;

	try {
		const supabase = await createAuthenticatedClient();

		const { data: review, error: reviewError } = await supabase
			.from('rejected_reviews')
			.select('*')
			.eq('id', id)
			.single();

		if (reviewError) {
			console.error('Error fetching rejected review:', reviewError);
			return new Response(
				JSON.stringify({ error: "Error fetching rejected review" }),
				{ status: 500 }
			);
		}

		return new Response(JSON.stringify({ review }), { status: 200 });
	} catch (error) {
		console.error('Unexpected error in rejected review API:', error);
		return new Response(
			JSON.stringify({ error: "Internal Server Error" }),
			{ status: 500 }
		);
	}
}

// move edited rejected review to pending reviews
export async function POST(req, { params }) {

	const { id } = await params;
	const body = await req.json();

	try {

		const supabase = await createAuthenticatedClient();

		// insert new review into pending reviews
		const { error: insertError } = await supabase
			.from('pending_reviews')
			.insert(body)
			.select()
			.single();

		if (insertError) {
			console.error('Error inserting into pending reviews:', insertError);
			return new Response(
				JSON.stringify({ error: "Error resubmitting rejected review" }),
				{ status: 500 }
			);
		}

		// delete from rejected reviews
		const { error: deleteError } = await supabase
			.from('rejected_reviews')
			.delete()
			.eq('id', id);

		if (deleteError) {
			console.error('Error deleting from rejected reviews:', deleteError);
			return new Response(
				JSON.stringify({ error: "Error cleaning up rejected review" }),
				{ status: 500 }
			);
		}

		return new Response(JSON.stringify(
			{ message: "Rejected review successfully resubmitted for approval" }
		), { status: 200 });

	} catch (error) {
		console.error('Unexpected error in resubmitting rejected review API:', error);
		return new Response(
			JSON.stringify({ error: "Internal Server Error" }),
			{ status: 500 }
		);
	}
}

export async function DELETE(req, { params }) {
	const { id } = await params;

	try {
		const supabase = await createAuthenticatedClient();
		const { error: deleteError } = await supabase
			.from('rejected_reviews')
			.delete()
			.eq('id', id);
		if (deleteError) {
			console.error('Error deleting rejected review:', deleteError);
			return new Response(
				JSON.stringify({ error: "Error deleting rejected review" }),
				{ status: 500 }
			);
		}
		return new Response(
			JSON.stringify({ message: "Rejected review deleted successfully" }),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Unexpected error in deleting rejected review API:', error);
		return new Response(
			JSON.stringify({ error: "Internal Server Error" }),
			{ status: 500 }
		);
	}
}
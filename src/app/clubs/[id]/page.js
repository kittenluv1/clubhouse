export default async function ClubPage({ params }) {
	const { id } = await params;
  
	return (
	  <div className="border p-4 mb-4 rounded shadow-md">
		<h1 className="text-4xl font-bold mb-4">Club Details</h1>
		<p className="text-lg">Details for club with ID: {id}</p>
	  </div>
	);
  }
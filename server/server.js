const express = require('express');
const app = express();

app.get("/api", async (req, res) => {
	try {
		const response = await fetch("https://sa.ucla.edu/RCO/Public/SearchOrganizations", {
			method: "POST",
		});

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const data = await response.json();
		res.json(data); // Send data to client
	} catch (error) {
		console.error("Error fetching data:", error);
		res.status(500).json({ error: "Failed to fetch data" });
	}
});

app.listen(5000, () => {console.log("Server started on port 5000")});
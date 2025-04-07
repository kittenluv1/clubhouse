const express = require('express');
const app = express();
const PORT=5001; 

app.get("/", (req, res) => { 
	res.send("API is running..."); 
}); 

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

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
  });
const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema({
	id: String,
	name: String,
	visuals: [
		{
			id: String,
			dim: String,
			src: String,
		},
	],
});

module.exports = mongoose.model("Campaign", CampaignSchema);

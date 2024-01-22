const mongoose = require("mongoose");

const visualSchema = new mongoose.Schema({
	id: String,
	description: String,
	status: {
		type: String,
		enum: ["personalized", "agnostic"],
		required: true,
	},
	personalized_for: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: function () {
			return this.status === "personalized";
		},
	},
	dim: String,
	src: String,
});

const Visual = mongoose.model("Visual", visualSchema);

const campaignSchema = new mongoose.Schema({
	name: String,
	logo_url: String,
	description: String,
	visuals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Visual" }],
});

const Campaign = mongoose.model("Campaign", campaignSchema);

module.exports = { Campaign, Visual };

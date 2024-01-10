const mongoose = require("mongoose");

const UserChoiceSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	campaignId: { type: String, required: true },
	visualId: { type: String, required: true },
});

// Create a compound index
UserChoiceSchema.index({ userId: 1, campaignId: 1 }, { unique: true });

const UserChoice = mongoose.model("UserChoice", UserChoiceSchema);

module.exports = UserChoice;

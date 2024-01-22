const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const UserSchema = new mongoose.Schema({
	newsLetterId: String,
	password: String,
	currentCampaigns: [
		{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
	],
	pastCampaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	try {
		const salt = await bcryptjs.genSalt(10);
		this.password = await bcryptjs.hash(this.password, salt);
		next();
	} catch (err) {
		next(err);
	}
});

const User = mongoose.model("User", UserSchema);

module.exports = User;

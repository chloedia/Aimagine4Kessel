const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const UserSchema = new mongoose.Schema({
	newsLetterId: String,
	password: String, // Store hashed passwords only
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (err) {
		next(err);
	}
});

const User = mongoose.model("User", UserSchema);

module.exports = User;

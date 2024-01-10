require("dotenv").config();
const mongoose = require("mongoose");
const Campaign = require("./models/campaignSchema.js");
const User = require("./models/userSchema.js");
const Choice = require("./models/userChoiceSchema.js");

const connectionString = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@aimagine.fym6ydv.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(connectionString, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const campaignsData = [
	{
		id: "netflix",
		name: "Netflix",
		visuals: [
			{
				id: "Choice 1",
				dim: "350 X 130",
				src: "path-to-visual1.png",
			},
			{
				id: "Choice 2",
				dim: "350 X 130",
				src: "path-to-visual2.png",
			},
			{
				id: "Choice 3",
				dim: "350 X 130",
				src: "path-to-visual3.png",
			},
		],
	},
	{
		id: "renault",
		name: "Renault",
		visuals: [
			{
				id: "Choice 1",
				dim: "350 X 130",
				src: "path-to-visual1.png",
			},
			{
				id: "Choice 2",
				dim: "350 X 130",
				src: "path-to-visual2.png",
			},
			{
				id: "Choice 3",
				dim: "350 X 130",
				src: "path-to-visual3.png",
			},
		],
	},
];

const usersData = [
	{
		newsLetterId: "newsletter1",
		password: "kesselAimagine_newsletter1",
	},
	{
		newsLetterId: "newsletter2",
		password: "kesselAimagine_newsletter2",
	},
	{
		newsLetterId: "newsletter3",
		password: "kesselAimagine_newsletter3",
	},
];

// Function to initialize data
const initDB = async () => {
	try {
		// Initialize Campaigns
		await Campaign.deleteMany({});
		await Campaign.insertMany(campaignsData);
		console.log("Campaigns initialized with sample data!");

		// Initialize Users
		await User.deleteMany({});
		for (const userData of usersData) {
			const user = new User(userData);
			await user.save();
		}
		console.log("Users initialized with sample data!");

		// Initialize Choice
		await Choice.deleteMany({});
		console.log("Choice initialized to empty");

		process.exit(0);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

db.once("open", initDB);

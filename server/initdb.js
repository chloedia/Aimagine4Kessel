require("dotenv").config();
const mongoose = require("mongoose");
const { Campaign, Visual } = require("./models/campaignSchema");
const bcrypt = require("bcryptjs");
const User = require("./models/userSchema");

const connectionString = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@aimagine.fym6ydv.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(connectionString, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const initDB = async () => {
	try {
		await User.deleteMany({});
		const usersData = [
			{
				newsLetterId: "Newsletter1",
				password: await bcrypt.hash("kesselAimagine_newsletter1", 10),
				currentCampaigns: [],
				currentCampaigns: [],
				pastCampaigns: [],
			},
			{
				newsLetterId: "Newsletter2",
				password: await bcrypt.hash("kesselAimagine_newsletter2", 10),
				currentCampaigns: [],
				pastCampaigns: [],
			},
			{
				newsLetterId: "Newsletter3",
				password: await bcrypt.hash("kesselAimagine_newsletter3", 10),
				currentCampaigns: [],
				pastCampaigns: [],
			},
		];
		const users = await User.insertMany(usersData);
		console.log("Users initialized with sample data!");

		// Initialize Visuals
		await Visual.deleteMany({});
		const visualsData = [
			{
				id: "Choice 1",
				description: "Visual 1 for Netflix Campaign",
				status: "personalized",
				personalized_for: users[0]._id,
				dim: "350 X 130",
				src: "/ads/Netflix_style1/index.html",
			},
			{
				id: "Choice 2",
				description: "Visual 2 for Netflix Campaign",
				status: "agnostic",
				dim: "350 X 130",
				src: "/ads/Netflix_style2/index.html",
			},
			{
				id: "Choice 3",
				description: "Visual 3 for Netflix Campaign",
				status: "agnostic",
				dim: "350 X 130",
				src: "/ads/Netflix_style3/index.html",
			},
			{
				id: "Choice 1",
				description: "Visual 1 for Peugeot Campaign",
				status: "personalized",
				personalized_for: users[0]._id,
				dim: "350 X 130",
				src: "/ads/Peugeot_style1/index.html",
			},
			{
				id: "Choice 2",
				description: "Visual 2 for Peugeot Campaign",
				status: "agnostic",
				dim: "350 X 130",
				src: "/ads/Peugeot_style2/index.html",
			},
			{
				id: "Choice 3",
				description: "Visual 3 for Peugeot Campaign",
				status: "agnostic",
				dim: "350 X 130",
				src: "/ads/Peugeot_style3/index.html",
			},
		];
		const visuals = await Visual.insertMany(visualsData);
		console.log("Visuals initialized with sample data!");

		// Initialize Campaigns
		await Campaign.deleteMany({});
		const campaignsData = [
			{
				name: "Netflix",
				logo_url:
					"https://assets.stickpng.com/images/580b57fcd9996e24bc43c529.png",
				description:
					"Campaign for netflix reviewing thir parental control features",
				visuals: visuals.slice(0, 3).map((visual) => visual._id),
			},
			{
				name: "Peugeot",
				logo_url:
					"https://logodownload.org/wp-content/uploads/2014/09/peugeot-logo-5.png",
				description: "Description for Peugeot Campaign",
				visuals: visuals
					.slice(3, visuals.length)
					.map((visual) => visual._id),
			},
		];
		const campaigns = await Campaign.insertMany(campaignsData);
		console.log("Campaigns initialized with sample data!");

		// Assign currentCampaigns to users
		const user1 = users.find((user) => user.newsLetterId === "Newsletter1");
		const user2 = users.find((user) => user.newsLetterId === "Newsletter2");
		const user3 = users.find((user) => user.newsLetterId === "Newsletter3");

		user1.currentCampaigns.push(campaigns[0]._id);
		user1.currentCampaigns.push(campaigns[1]._id);

		user2.currentCampaigns.push(campaigns[1]._id);

		user3.currentCampaigns.push(campaigns[0]._id);

		await Promise.all([user1.save(), user2.save(), user3.save()]);
		console.log("Current campaigns assigned to users!");

		process.exit(0);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

db.once("open", initDB);

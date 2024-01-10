require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./models/userSchema");
const Campaign = require("./models/campaignSchema");
const UserChoice = require("./models/userChoiceSchema");
// Express Setup
const app = express();
const PORT = process.env.PORT || 8080;

const corsOptions = {
	origin: "*", // Allow all origins. Adjust this to list specific origins in production.
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	allowedHeaders: ["Content-Type", "Authorization"],
	optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(cors());
app.use(bodyParser.json());

// Database Setup
const connectionString = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@aimagine.fym6ydv.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(connectionString, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function () {
	console.log("Connected to MongoDB Atlas!");
});

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

const verifyToken = (req, res, next) => {
	const token = req.headers.authorization?.split(" ")[1]; // Extract token from header

	if (!token) {
		return res
			.status(401)
			.json({ error: "Access denied. No token provided." });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		res.status(400).json({ error: "Invalid token." });
	}
};

// Routes
app.get("/", (req, res) => {
	res.send("Hello, World!");
});

// API Routes
app.post("/api/login", async (req, res) => {
	try {
		// Extract newsLetterId and password from request body
		const { newsLetterId, password } = req.body;
		// Find the user by newsLetterId
		const user = await User.findOne({ newsLetterId });
		if (!user) {
			return res.status(401).json({ error: "Invalid credentials" });
		}
		// Compare provided password with the stored hash
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Authentication successful
		// You might want to create a token or a session here
		// Create token payload (you can include anything you want here)
		const payload = {
			userId: user._id,
			newsLetterId: user.newsLetterId,
		};

		// Generate a token
		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: "2h", // Token expires in 1 hour
		});

		res.json({ message: "Login successful", token });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

app.get("/api/current-user", verifyToken, async (req, res) => {
	try {
		const user = await User.findById(req.user.userId).select(
			"newsLetterId"
		);
		res.json(user);
	} catch (err) {
		res.status(500).send("Server error");
	}
});

// Route to get all users
app.get("/api/users", async (req, res) => {
	try {
		const userIDs = await User.find({}, "newsLetterId");
		res.json(userIDs);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/campaigns", async (req, res) => {
	try {
		const campaigns = await Campaign.find({}).lean(); // Use .lean() for faster reads when you just need plain JSON objects
		res.json(campaigns);
	} catch (err) {
		console.error("Error fetching campaigns:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

app.get("/api/auth/validate", verifyToken, (req, res) => {
	res.json({ valid: true });
});

app.post("/api/user-choice", verifyToken, async (req, res) => {
	try {
		const { campaignId, visualId } = req.body;
		const userIdFromToken = req.user.userId;

		const filter = { userId: userIdFromToken, campaignId };
		const update = { visualId };

		// Upsert option will create a new document if one doesn't exist
		const options = { upsert: true, new: true, setDefaultsOnInsert: true };

		const updatedChoice = await UserChoice.findOneAndUpdate(
			filter,
			update,
			options
		);

		res.status(200).json(updatedChoice);
	} catch (err) {
		console.error("Error creating or updating user choice:", err);
		res.status(500).send("Server error");
	}
});

// Server Listening
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

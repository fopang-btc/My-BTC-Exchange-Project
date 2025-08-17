const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User model
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 10000 },
  portfolio: { type: Map, of: Number, default: {} },
});
const User = mongoose.model("User", UserSchema);

// Signup route
app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ error: "Username taken" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user._id }, "secretkey");
  res.json({
    token,
    user: { username, balance: user.balance, portfolio: user.portfolio },
  });
});

// Middleware for token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, "secretkey");
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Get prices
app.get("/api/prices", async (req, res) => {
  try {
    const ids =
      "bitcoin,ethereum,ripple,tether,binancecoin,solana,usd-coin,cardano,avalanche-2,tron,dogecoin,chainlink,the-open-network,matic-network,shiba-inu,litecoin,bitcoin-cash,polkadot,uniswap,near";
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "API error" });
  }
});

// Trade route
app.post("/api/trade", authMiddleware, async (req, res) => {
  const { coin, amount, action } = req.body;
  const user = await User.findById(req.userId);
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`
    );
    const data = await response.json();
    const price = data[coin].usd;
    const cost = price * amount;

    if (action === "buy") {
      if (user.balance < cost)
        return res.status(400).json({ error: "Insufficient balance" });
      user.balance -= cost;
      user.portfolio.set(coin, (user.portfolio.get(coin) || 0) + amount);
    } else if (action === "sell") {
      const holdings = user.portfolio.get(coin) || 0;
      if (holdings < amount)
        return res.status(400).json({ error: "Insufficient holdings" });
      user.balance += cost;
      user.portfolio.set(coin, holdings - amount);
    }
    await user.save();
    res.json({ user: { balance: user.balance, portfolio: user.portfolio } });
  } catch (err) {
    res.status(500).json({ error: "Trade error" });
  }
});

// Get user data
app.get("/api/user", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({
    username: user.username,
    balance: user.balance,
    portfolio: user.portfolio,
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));

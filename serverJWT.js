require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json()); // Middleware to parse JSON

const users = []; // Mock database

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// 1️⃣ Register Route (Signup)
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 1); // Hash password
    // const hashedPassword = await bcrypt.hash(password,100);
    // users.push({username,password:hashedPassword})
    users.push({ username, password: hashedPassword });
    res.json({ message: "User registered successfully!"  , hashedPassword });
});

// 2️⃣ Login Route
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username);
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    // const token = jwt.sign({username} , SECRET_KEY , {expiresIn:"200h"})
    res.json({ token });
});

// 3️⃣ Middleware to Verify JWT Token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "Access denied" });
          
    try {
        const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// 4️⃣ Protected Route (Only for Authenticated Users)
app.get("/profile", verifyToken, (req, res) => {
    res.json({ message: `Welcome ${req.user.username}, this is your profile!` });
});

// Start Server
app.listen(3000, () => console.log("Server running on port 3000"));

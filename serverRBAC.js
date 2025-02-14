require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());

const users = []; // Mock database

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// 1️⃣ Register User (with Role)
app.post("/register", async (req, res) => {
    const { username, password, role } = req.body;
    if (!role) return res.status(400).json({ message: "Role is required" });

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword, role });
    res.json({ message: "User registered successfully!" });
});

// 2️⃣ Login Route (Returns JWT Token)
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    // const user = users.find((u) =>  u.username === username);
    
    const user = users.find((u) => u.username === username);
    if (!user) return res.status(400).json({ message: "User not found" });
    
    //  const isMatch = await  bcrypt.compare(password, user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ username, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
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

// 4️⃣ Role-Based Access Middleware
const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: You do not have access" });
    }
    next();
};

// 5️⃣ User Routes
app.get("/user/profile", verifyToken, (req, res) => {
    res.json({ message: `Welcome ${req.user.username}, this is your profile!` });
});

// 6️⃣ Admin Routes
app.get("/admin/dashboard", verifyToken, checkRole(["admin"]), (req, res) => {
    res.json({ message: "Welcome Admin, this is your dashboard!" });
});

// 7️⃣ Moderator Routes
app.get("/moderator/reports", verifyToken, checkRole(["moderator"]), (req, res) => {
    res.json({ message: "Welcome Moderator, here are the reports." });
});

// Start Server
app.listen(3000, () => console.log("Server running on port 3000"));

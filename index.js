require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes     = require("./routes/authRoutes");
const byteRoutes     = require("./routes/byteRoutes");
const adminRoutes    = require("./routes/adminRoutes");
const progressRoutes = require("./routes/progressRoutes");

connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/bytes",    byteRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/progress", progressRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "CodeByte API is running 🚀" }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ── Helper ────────────────────────────────────────────────────────────────────
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// ── POST /api/auth/register ───────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    // Password is hashed by the pre-save hook in User model — do NOT hash here
    const user = await User.create({ name, email, password });

    res.status(201).json({ message: "Account created successfully." });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Uses the matchPassword method defined on the model
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful.",
      token,
      user: {
        id:   user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp:   user.xp,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user.id comes from the JWT payload (set by auth middleware)
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found." });

    res.json({ user });
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ error: "Failed to fetch user." });
  }
};

module.exports = { registerUser, loginUser, getMe };

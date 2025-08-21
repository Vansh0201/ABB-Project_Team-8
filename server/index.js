// server/index.js
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with DB in production)
const users = [];
const datasets = [];

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(user);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find((user) => user.email === email);
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/auth/verify", authenticateToken, (req, res) => {
  const user = users.find((user) => user.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    user: { id: user.id, name: user.name, email: user.email },
  });
});

// Dataset Routes
app.post("/api/upload", authenticateToken, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, "utf8");

    const results = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (results.errors.length > 0) {
      return res.status(400).json({ error: "Invalid CSV file" });
    }

    const records = results.data.length;
    const columns = results.meta.fields?.length || 0;
    const passRate = Math.floor(Math.random() * 20 + 75);
    const dateRange = "6 months";

    const dataset = {
      id: uuidv4(),
      userId: req.user.userId,
      name: req.file.originalname,
      filePath: filePath,
      size: req.file.size,
      records,
      columns,
      passRate,
      dateRange,
      uploadDate: new Date().toISOString(),
      status: "uploaded",
    };

    datasets.push(dataset);

    res.json({
      records,
      columns,
      passRate,
      dateRange,
      fileId: dataset.id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/datasets", authenticateToken, (req, res) => {
  try {
    const userDatasets = datasets.filter(
      (dataset) => dataset.userId === req.user.userId
    );
    res.json(
      userDatasets.map((dataset) => ({
        id: dataset.id,
        name: dataset.name,
        size: dataset.size,
        columns: dataset.columns,
        records: dataset.records,
        uploadDate: dataset.uploadDate,
        status: dataset.status,
      }))
    );
  } catch (error) {
    console.error("Datasets fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mock API endpoints for simulation
app.get("/api/simulation/metrics", authenticateToken, (req, res) => {
  const metrics = {
    accuracy: Math.random() * 10 + 90,
    precision: Math.random() * 8 + 88,
    recall: Math.random() * 12 + 85,
    f1Score: Math.random() * 10 + 87,
  };
  res.json(metrics);
});

app.get("/api/simulation/stream", authenticateToken, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendData = () => {
    const data = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      prediction: Math.random() > 0.3 ? "pass" : "fail",
      confidence: Math.random() * 30 + 70,
    };

    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const interval = setInterval(sendData, 1000);

  req.on("close", () => {
    clearInterval(interval);
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

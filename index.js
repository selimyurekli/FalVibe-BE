const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");
require("dotenv").config();
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const tarotRoutes = require("./routes/tarot");
const fortuneRoutes = require("./routes/fortune");
const palmRoutes = require("./routes/palm");
const dreamRoutes = require("./routes/dream");
const readingsRoutes = require("./routes/readings");
const astrologyRoutes = require("./routes/astrology");
const getUserData = require("./middleware/getUserData");
const checkWallet = require("./middleware/checkWallet");
const fileUploadMiddleware = require("./middleware/fileUpload");
const horoscopeCron = require("./cron/horoscopeCron");
const app = express();
const decrementWallet = require("./middleware/decrementWallet");

app.use(
  cors({
    origin: ["http://localhost:8081", "exp://192.168.56.1:8081"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Increase JSON payload limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static files from public directory
app.use(express.static("public"));
app.use("/sound", express.static("public/sound"));

const clerk = ClerkExpressWithAuth({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  jwtKey: process.env.CLERK_JWT_KEY,
});

// MongoDB Connection with better error handling and retry logic
const connectWithRetry = async () => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // IPv4 tercih et
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log("MongoDB connected successfully");

    // Log the available databases
    const result = await mongoose.connection.db.admin().listDatabases();
    console.log(
      "Available databases:",
      result.databases.map((db) => db.name)
    );

    // MongoDB bağlantısı başarılı olduktan sonra cron job'ı başlat
    console.log("Starting horoscope cron job...");
    horoscopeCron.cronJob.start();
    horoscopeCron.initialRun().catch((error) => {
      console.error("Error in initial horoscope run:", error);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.log("Retrying in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
};

// İlk bağlantıyı başlat
connectWithRetry();

// MongoDB event listeners
mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err);
  if (err.name === "MongoNetworkError") {
    console.log("Network error, attempting to reconnect...");
    setTimeout(connectWithRetry, 5000);
  }
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected, attempting to reconnect...");
  setTimeout(connectWithRetry, 5000);
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected successfully");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", clerk, getUserData, userRoutes);
app.use(
  "/api/tarot",
  clerk,
  getUserData,
  checkWallet("TAROT"),
  tarotRoutes,
  decrementWallet("TAROT")
);
app.use("/api/fortune", clerk, getUserData, fortuneRoutes);
app.use(
  "/api/palm",
  clerk,
  getUserData,
  checkWallet("PALM"),
  fileUploadMiddleware,
  decrementWallet("PALM"),
  palmRoutes
);
app.use(
  "/api/dream",
  clerk,
  getUserData,
  checkWallet("DREAM"),
  decrementWallet("DREAM"),
  dreamRoutes
);
app.use("/api/readings", clerk, getUserData, readingsRoutes);
app.use(
  "/api/astrology",
  clerk,
  getUserData,
  checkWallet("ASTROLOGY"),
  astrologyRoutes,
  decrementWallet("ASTROLOGY")
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Bir hata oluştu",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // MongoDB bağlantısı başarılı olduktan sonra cron job'ı başlat
  if (mongoose.connection.readyState === 1) {
    console.log("Starting horoscope cron job...");
    horoscopeCron.cronJob.start();
    horoscopeCron.initialRun().catch((error) => {
      console.error("Error in initial horoscope run:", error);
    });
  }
});

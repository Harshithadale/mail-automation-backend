import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./Config/db.js";

// Routes
import userRouter from "./Routes/UserRoute.js";
import campaignRoutes from "./Routes/CampaignRoute.js";
import simulateRoutes from "./Routes/SimulateRoute.js";
import trackroutes from './Routes/TrackRoutes.js'
import myuserroutes from './Routes/MyuserRoutes.js'
import ProfileRoutes from './Routes/ProfileRoute.js'
// App config
dotenv.config();
const app = express();
const port = process.env.PORT || 10000;

// Connect DB
connectDB();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: ['https://mail-automation-git-master-dale-harshithas-projects.vercel.app'], 
  credentials: true
}));

app.use(cookieParser());

// API Routes
app.use("/api/user", userRouter);          // Auth: register, login
app.use("/api/campaign", campaignRoutes);  // Campaign create, fetch
app.use("/api/simulate", simulateRoutes);  // Execute campaign
app.use("/api/track",trackroutes)
app.use("/api/myusers",myuserroutes)
app.use("/api/users",ProfileRoutes)

// Default route
app.get("/", (req, res) => {
  res.send("API Working 🎯");
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server started on port: ${port}`);
});

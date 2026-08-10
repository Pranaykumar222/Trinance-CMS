import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./routes";
import pool from "./config/db";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Prevent browser caching for all API responses
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Mount consolidated API router
app.use("/api", apiRouter);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Background Scheduler: runs every 10 seconds to publish due scheduled briefings
setInterval(async () => {
  try {
    const result = await pool.query(
      `UPDATE newsletters
       SET status = 'published', publish_date = NOW()
       WHERE status = 'scheduled' AND scheduled_for <= NOW()
       RETURNING id, title`
    );
    if (result.rowCount && result.rowCount > 0) {
      result.rows.forEach((row) => {
        console.log(`[Scheduler] Auto-published scheduled newsletter: "${row.title}" (ID: ${row.id})`);
      });
    }
  } catch (error) {
    console.error("[Scheduler] Error checking scheduled newsletters:", error);
  }
}, 10000);

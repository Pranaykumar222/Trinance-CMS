import { Client } from "pg";
import pool from "../config/db";
import fs from "fs";
import path from "path";
import { users, plans, newsletters, subscribers, auditLog } from "./seedData";

async function main() {
  const hasDatabaseUrl = !!process.env.DATABASE_URL;

  if (!hasDatabaseUrl) {
    console.log("Checking if database 'trinance_cms' exists...");
    const adminClient = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: "postgres",
    });

    try {
      await adminClient.connect();
      const res = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = 'trinance_cms'");
      if (res.rows.length === 0) {
        console.log("Database 'trinance_cms' does not exist. Creating it...");
        await adminClient.query("CREATE DATABASE trinance_cms");
        console.log("Database 'trinance_cms' created successfully.");
      } else {
        console.log("Database 'trinance_cms' already exists.");
      }
    } catch (err) {
      console.error("Error checking/creating database:", err);
    } finally {
      await adminClient.end();
    }
  } else {
    console.log("DATABASE_URL detected. Skipping local 'trinance_cms' database creation checks.");
  }

  console.log("Initializing database schema...");
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  await pool.query(schemaSql);
  console.log("Database schema initialized successfully.");

  // Check if database has already been seeded to avoid duplicate errors
  const userCheck = await pool.query("SELECT COUNT(*) FROM users");
  if (parseInt(userCheck.rows[0].count) > 0) {
    console.log("Database already seeded. Skipping data seeding.");
    process.exit(0);
  }

  console.log("Seeding users...");
  for (const user of users) {
    await pool.query(
      "INSERT INTO users (id, name, email, role, avatar_color, status, last_active) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [user.id, user.name, user.email, user.role, user.avatarColor, user.status, user.lastActive]
    );
  }

  console.log("Seeding plans...");
  for (const plan of plans) {
    await pool.query(
      "INSERT INTO plans (id, name, price, duration, benefits, active, subscribers) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [plan.id, plan.name, plan.price, plan.duration, plan.benefits, plan.active, plan.subscribers]
    );
  }

  console.log("Seeding newsletters...");
  for (const n of newsletters) {
    await pool.query(
      `INSERT INTO newsletters (
        id, title, subtitle, slug, category, template, author_id, cover_image, reading_time, status, visibility, blocks, created_at, updated_at, publish_date, scheduled_for, stats
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        n.id,
        n.title,
        n.subtitle,
        n.slug,
        n.category,
        n.template,
        n.authorId,
        n.coverImage,
        n.readingTime,
        n.status,
        n.visibility,
        JSON.stringify(n.blocks),
        n.createdAt,
        n.updatedAt,
        n.publishDate,
        n.scheduledFor,
        JSON.stringify(n.stats),
      ]
    );
  }

  console.log("Seeding subscribers...");
  for (const sub of subscribers) {
    await pool.query(
      `INSERT INTO subscribers (
        id, name, email, plan, status, renewal_date, lifetime_spend, joined_date, avatar_color, location, payments, activity, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        sub.id,
        sub.name,
        sub.email,
        sub.plan,
        sub.status,
        sub.renewalDate,
        sub.lifetimeSpend,
        sub.joinedDate,
        sub.avatarColor,
        sub.location,
        JSON.stringify(sub.payments),
        JSON.stringify(sub.activity),
        sub.notes,
      ]
    );
  }

  console.log("Seeding audit log...");
  for (const audit of auditLog) {
    await pool.query(
      "INSERT INTO audit_log (id, actor_id, action, target, date) VALUES ($1, $2, $3, $4, $5)",
      [audit.id, audit.actorId, audit.action, audit.target, audit.date]
    );
  }

  console.log("Database seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});

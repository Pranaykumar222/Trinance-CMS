import { Request, Response } from "express";
import pool from "../config/db";

export const getAudits = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM audit_log ORDER BY date DESC");
    const logs = result.rows.map((row) => ({
      id: row.id,
      actorId: row.actor_id,
      action: row.action,
      target: row.target,
      date: row.date,
    }));
    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Failed to fetch audit log" });
  }
};

export const createAudit = async (req: Request, res: Response) => {
  const log = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO audit_log (id, actor_id, action, target, date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [log.id, log.actorId, log.action, log.target, log.date || new Date().toISOString()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating audit log entry:", error);
    res.status(500).json({ error: "Failed to create audit log entry" });
  }
};

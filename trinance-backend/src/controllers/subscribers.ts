import { Request, Response } from "express";
import pool from "../config/db";

export const getSubscribers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM subscribers ORDER BY joined_date DESC");
    const subscribers = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      plan: row.plan,
      status: row.status,
      renewalDate: row.renewal_date,
      lifetimeSpend: parseFloat(row.lifetime_spend),
      joinedDate: row.joined_date,
      avatarColor: row.avatar_color,
      location: row.location,
      payments: row.payments,
      activity: row.activity,
      notes: row.notes,
    }));
    res.json(subscribers);
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
};

export const updateSubscriber = async (req: Request, res: Response) => {
  const { id } = req.params;
  const s = req.body;
  try {
    const result = await pool.query(
      `UPDATE subscribers SET
        name = $1, email = $2, plan = $3, status = $4, renewal_date = $5,
        lifetime_spend = $6, joined_date = $7, avatar_color = $8, location = $9,
        payments = $10, activity = $11, notes = $12
      WHERE id = $13 RETURNING *`,
      [
        s.name,
        s.email,
        s.plan,
        s.status,
        s.renewalDate,
        s.lifetimeSpend,
        s.joinedDate,
        s.avatarColor,
        s.location,
        JSON.stringify(s.payments),
        JSON.stringify(s.activity),
        s.notes,
        id,
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating subscriber:", error);
    res.status(500).json({ error: "Failed to update subscriber" });
  }
};

export const deleteSubscriber = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM subscribers WHERE id = $1", [id]);
    res.json({ message: "Subscriber deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    res.status(500).json({ error: "Failed to delete subscriber" });
  }
};

import { Request, Response } from "express";
import pool from "../config/db";

export const getPlans = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM plans ORDER BY price ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const p = req.body;
  try {
    const result = await pool.query(
      "UPDATE plans SET name = $1, price = $2, duration = $3, benefits = $4, active = $5, subscribers = $6 WHERE id = $7 RETURNING *",
      [p.name, p.price, p.duration, p.benefits, p.active, p.subscribers, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({ error: "Failed to update plan" });
  }
};

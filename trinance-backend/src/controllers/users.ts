import { Request, Response } from "express";
import pool from "../config/db";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY name ASC");
    const users = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      avatarColor: row.avatar_color,
      status: row.status,
      lastActive: row.last_active,
    }));
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const u = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (id, name, email, role, avatar_color, status, last_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [u.id, u.name, u.email, u.role, u.avatarColor, u.status, u.lastActive]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const u = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2, role = $3, avatar_color = $4, status = $5, last_active = $6 WHERE id = $7 RETURNING *",
      [u.name, u.email, u.role, u.avatarColor, u.status, u.lastActive, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

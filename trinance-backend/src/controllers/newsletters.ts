import { Request, Response } from "express";
import pool from "../config/db";

export const getNewsletters = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM newsletters ORDER BY updated_at DESC"
    );
    const newsletters = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      slug: row.slug,
      category: row.category,
      template: row.template,
      authorId: row.author_id,
      coverImage: row.cover_image,
      readingTime: row.reading_time,
      status: row.status,
      visibility: row.visibility,
      blocks: row.blocks,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishDate: row.publish_date,
      scheduledFor: row.scheduled_for,
      stats: row.stats,
    }));
    res.json(newsletters);
  } catch (error) {
    console.error("Error fetching newsletters:", error);
    res.status(500).json({ error: "Failed to fetch newsletters" });
  }
};

export const getPublishedNewsletters = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM newsletters WHERE status = 'published' ORDER BY publish_date DESC"
    );
    const newsletters = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      slug: row.slug,
      category: row.category,
      template: row.template,
      authorId: row.author_id,
      coverImage: row.cover_image,
      readingTime: row.reading_time,
      status: row.status,
      visibility: row.visibility,
      blocks: row.blocks,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishDate: row.publish_date,
      scheduledFor: row.scheduled_for,
      stats: row.stats,
    }));
    res.json(newsletters);
  } catch (error) {
    console.error("Error fetching published newsletters:", error);
    res.status(500).json({ error: "Failed to fetch published newsletters" });
  }
};

export const getNewsletterByIdOrSlug = async (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM newsletters WHERE id = $1 OR slug = $1",
      [idOrSlug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Newsletter not found" });
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      slug: row.slug,
      category: row.category,
      template: row.template,
      authorId: row.author_id,
      coverImage: row.cover_image,
      readingTime: row.reading_time,
      status: row.status,
      visibility: row.visibility,
      blocks: row.blocks,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishDate: row.publish_date,
      scheduledFor: row.scheduled_for,
      stats: row.stats,
    });
  } catch (error) {
    console.error("Error fetching single newsletter:", error);
    res.status(500).json({ error: "Failed to fetch newsletter" });
  }
};

export const createNewsletter = async (req: Request, res: Response) => {
  const n = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO newsletters (
        id, title, subtitle, slug, category, template, author_id, cover_image, reading_time, status, visibility, blocks, created_at, updated_at, publish_date, scheduled_for, stats
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        n.id,
        n.title,
        n.subtitle || "",
        n.slug,
        n.category,
        n.template,
        n.authorId,
        n.coverImage || "",
        n.readingTime || 1,
        n.status,
        n.visibility,
        JSON.stringify(n.blocks || []),
        n.createdAt || new Date().toISOString(),
        n.updatedAt || new Date().toISOString(),
        n.publishDate || null,
        n.scheduledFor || null,
        JSON.stringify(n.stats || { opens: 0, clicks: 0, openRate: 0, clickRate: 0, reads: 0 }),
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating newsletter:", error);
    res.status(500).json({ error: "Failed to create newsletter" });
  }
};

export const updateNewsletter = async (req: Request, res: Response) => {
  const { id } = req.params;
  const n = req.body;
  try {
    const result = await pool.query(
      `UPDATE newsletters SET
        title = $1, subtitle = $2, slug = $3, category = $4, template = $5, author_id = $6,
        cover_image = $7, reading_time = $8, status = $9, visibility = $10, blocks = $11,
        updated_at = $12, publish_date = $13, scheduled_for = $14
      WHERE id = $15
      RETURNING *`,
      [
        n.title,
        n.subtitle || "",
        n.slug,
        n.category,
        n.template,
        n.authorId,
        n.coverImage || "",
        n.readingTime || 1,
        n.status,
        n.visibility,
        JSON.stringify(n.blocks || []),
        new Date().toISOString(),
        n.publishDate || null,
        n.scheduledFor || null,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Newsletter not found to update" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating newsletter:", error);
    res.status(500).json({ error: "Failed to update newsletter" });
  }
};

export const deleteNewsletter = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM newsletters WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Newsletter not found to delete" });
    }
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting newsletter:", error);
    res.status(500).json({ error: "Failed to delete newsletter" });
  }
};

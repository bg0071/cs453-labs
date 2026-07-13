import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;

const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.PGHOST ?? "127.0.0.1",
  port: Number(process.env.PGPORT ?? 5433),
  database: process.env.PGDATABASE ?? "lab05",
  user: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD ?? "postgres"
});

function parseItemId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function validateItemBody(body, { partial = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      error: "The request body must be a JSON object."
    };
  }

  const hasName = Object.hasOwn(body, "name");
  const hasQuantity = Object.hasOwn(body, "quantity");

  if (partial && !hasName && !hasQuantity) {
    return {
      error: "Provide at least one field: name or quantity."
    };
  }

  if (!partial && (!hasName || !hasQuantity)) {
    return {
      error: "Both name and quantity are required."
    };
  }

  const item = {};

  if (hasName) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return {
        error: "Name must be a non-empty string."
      };
    }

    item.name = body.name.trim();
  }

  if (hasQuantity) {
    if (!Number.isInteger(body.quantity) || body.quantity < 0) {
      return {
        error: "Quantity must be a non-negative integer."
      };
    }

    item.quantity = body.quantity;
  }

  return { item };
}

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use(cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ]
  }));

  app.get("/health", async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok" });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).json({
        status: "error",
        message: "Database connection failed."
      });
    }
  });

  // Starter route: return every item from the database.
  app.get("/api/items", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, name, quantity
        FROM items
        ORDER BY id ASC
      `);

      res.json({ items: result.rows });
    } catch (error) {
      console.error("Failed to load items:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load items."
      });
    }
  });

  // Starter route: create one item so the client can demonstrate a write.
  app.post("/api/items", async (req, res) => {
    const { item, error } = validateItemBody(req.body);

    if (error) {
      return res.status(400).json({
        error: "Bad Request",
        message: error
      });
    }

    try {
      const result = await pool.query(
        `
          INSERT INTO items (name, quantity)
          VALUES ($1, $2)
          RETURNING id, name, quantity
        `,
        [item.name, item.quantity]
      );

      res.status(201).json({
        item: result.rows[0]
      });
    } catch (error) {
      console.error("Failed to add item:", error);

      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to add item."
      });
    }
  });

  // TODO: Return one item by ID.
  app.get("/api/items/:id", async (req, res) => {
    const id = parseItemId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Item ID must be a positive integer."
      });
    }

    try {
      const result = await pool.query(
        `
          SELECT id, name, quantity
          FROM items
          WHERE id = $1
        `,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: `Item ${id} does not exist.`
        });
      }

      res.json({
        item: result.rows[0]
      });
    } catch (error) {
      console.error("Failed to load item:", error);

      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load item."
      });
    }
  });

  // TODO: Replace one item by ID.
  app.put("/api/items/:id", async (req, res) => {
    const id = parseItemId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Item ID must be a positive integer."
      });
    }

    const { item, error } = validateItemBody(req.body);

    if (error) {
      return res.status(400).json({
        error: "Bad Request",
        message: error
      });
    }

    try {
      const result = await pool.query(
        `
          UPDATE items
          SET name = $1,
              quantity = $2
          WHERE id = $3
          RETURNING id, name, quantity
        `,
        [item.name, item.quantity, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: `Item ${id} does not exist.`
        });
      }

      res.json({
        item: result.rows[0]
      });
    } catch (error) {
      console.error("Failed to replace item:", error);

      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to replace item."
      });
    }
  });

  // TODO: Partially update one item by ID.
  app.patch("/api/items/:id", async (req, res) => {
    const id = parseItemId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Item ID must be a positive integer."
      });
    }

    const { item, error } = validateItemBody(req.body, {
      partial: true
    });

    if (error) {
      return res.status(400).json({
        error: "Bad Request",
        message: error
      });
    }

    const name = Object.hasOwn(item, "name")
      ? item.name
      : null;

    const quantity = Object.hasOwn(item, "quantity")
      ? item.quantity
      : null;

    try {
      const result = await pool.query(
        `
          UPDATE items
          SET name = COALESCE($1, name),
              quantity = COALESCE($2, quantity)
          WHERE id = $3
          RETURNING id, name, quantity
        `,
        [name, quantity, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: `Item ${id} does not exist.`
        });
      }

      res.json({
        item: result.rows[0]
      });
    } catch (error) {
      console.error("Failed to update item:", error);

      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to update item."
      });
    }
  });

  // TODO: Delete one item by ID.
  app.delete("/api/items/:id", async (req, res) => {
    const id = parseItemId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Item ID must be a positive integer."
      });
    }

    try {
      const result = await pool.query(
        `
          DELETE FROM items
          WHERE id = $1
          RETURNING id, name, quantity
        `,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: `Item ${id} does not exist.`
        });
      }

      res.json({
        item: result.rows[0],
        message: "Item deleted."
      });
    } catch (error) {
      console.error("Failed to delete item:", error);

      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to delete item."
      });
    }
  });

  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Request body contains invalid JSON."
      });
    }

    console.error("Unhandled server error:", error);

    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred."
    });
  });

  app.use((req, res) => {
    res.status(404).json({
      error: "Not Found",
      message: "Route does not exist."
    });
  });

  return app;
}

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity >= 0)
    )
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM items");

  if (rows[0].count === 0) {
    await pool.query(
      `
        INSERT INTO items (name, quantity)
        VALUES ($1, $2), ($3, $4), ($5, $6)
      `,
      ["Keyboard", 10, "Mouse", 5, "Monitor", 3]
    );
  }
}

const isMainModule = process.argv[1] === new URL(import.meta.url).pathname;

if (isMainModule) {
  const app = createApp();

  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Lab 5 API listening on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Server startup failed:", error);
      process.exit(1);
    });
}

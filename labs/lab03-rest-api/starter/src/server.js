import express from "express";

export function createApp() {
  const app = express();

  app.use(express.json());

  // Starter data. This data is stored in memory and will reset when the
  // server restarts.
  let nextId = 3;
  const items = [
    { id: 1, name: "keyboard", quantity: 10 },
    { id: 2, name: "mouse", quantity: 5 }
  ];

  function isValidItemInput(body) {
    return (
      typeof body.name === "string" &&
      body.name.trim() !== "" &&
      typeof body.quantity === "number" &&
      body.quantity >= 0
    );
  }

  function findItemById(id) {
    return items.find((item) => item.id === id);
  }

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/items", (req, res) => {
    res.json(items);
  });

  app.get("/items/:id", (req, res) => {
    const id = Number(req.params.id);
    const item = findItemById(id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(item);
  });

  app.post("/items", (req, res) => {
    if (!isValidItemInput(req.body)) {
      return res.status(400).json({ error: "Invalid item data" });
    }

    const newItem = {
      id: nextId,
      name: req.body.name,
      quantity: req.body.quantity
    };

    nextId += 1;
    items.push(newItem);

    res.status(201).json(newItem);
  });

  app.put("/items/:id", (req, res) => {
    const id = Number(req.params.id);
    const item = findItemById(id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (!isValidItemInput(req.body)) {
      return res.status(400).json({ error: "Invalid item data" });
    }

    item.name = req.body.name;
    item.quantity = req.body.quantity;

    res.json(item);
  });

  app.delete("/items/:id", (req, res) => {
    const id = Number(req.params.id);
    const itemIndex = items.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found" });
    }

    items.splice(itemIndex, 1);
    res.sendStatus(204);
  });

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}

const isMainModule = process.argv[1] === new URL(import.meta.url).pathname;

if (isMainModule) {
  const PORT = process.env.PORT || 3000;
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Lab 3 REST API listening on port ${PORT}`);
  });
}

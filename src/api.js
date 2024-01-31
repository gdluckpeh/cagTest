const express = require("express");
const awsServerlessExpress = require("aws-serverless-express");
const {
  insertOrUpdateItem,
  queryItemsByDateRange,
  aggregateItemsByCategory,
} = require("./database");

const app = express();

app.use(express.json());

app.post("/items", async (req, res) => {
  try {
    const { name, category, price } = req.body;
    const id = await insertOrUpdateItem({
      Name: name,
      Category: category,
      Price: price,
    });
    res.json({ id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/items/queryByDateRange", async (req, res) => {
  try {
    const { dt_from, dt_to } = req.body;
    const items = await queryItemsByDateRange(dt_from, dt_to);
    const total_price = items
      .reduce((sum, item) => sum + parseFloat(item.Price), 0)
      .toFixed(2);
    res.json({ items, total_price });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/items/aggregateByCategory", async (req, res) => {
  try {
    const { category } = req.body;
    const result = await aggregateItemsByCategory(category);
    res.json({ items: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const port = process.env.PORT || 3000; // Default to port 3000 if not specified
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const server = awsServerlessExpress.createServer(app);

module.exports = { server };

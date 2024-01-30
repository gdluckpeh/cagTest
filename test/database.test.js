const {
  insertOrUpdateItem,
  queryItemsByDateRange,
  aggregateItemsByCategory,
} = require("../src/database");

describe("Inventory Management Functions", () => {
  describe("insertOrUpdateItem", () => {
    test("should insert a new item and return the ID", async () => {
      const newItem = { name: "Pen", category: "Stationary", price: "2.75" };
      const result = await insertOrUpdateItem(newItem);
      expect(result).toBeDefined();
      expect(typeof result).toBe("number");
    });

    test("should update an existing item and return the ID", async () => {
      // Assuming an item with name 'Notebook' already exists
      const existingItem = {
        name: "Notebook",
        category: "Stationary",
        price: "6.00",
      };
      const result = await insertOrUpdateItem(existingItem);
      expect(result).toBeDefined();
      expect(typeof result).toBe("number");
    });
  });

  describe("queryItemsByDateRange", () => {
    test("should query items within the specified date range", async () => {
      const dtFrom = "2022-01-01 00:00:00";
      const dtTo = "2022-01-25 23:59:59";
      const result = await queryItemsByDateRange(dtFrom, dtTo);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("aggregateItemsByCategory", () => {
    test("should aggregate items by category and return the result", async () => {
      const category = "Stationary";
      const result = await aggregateItemsByCategory(category);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test('should return all categories when "all" is passed as the category', async () => {
      const result = await aggregateItemsByCategory("all");
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

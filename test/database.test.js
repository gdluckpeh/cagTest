const {
  insertOrUpdateItem,
  queryItemsByDateRange,
  aggregateItemsByCategory,
} = require("../src/database");

// Mocking AWS SDK
jest.mock("aws-sdk", () => {
  return {
    config: {
      update: jest.fn(),
    },
    DynamoDB: {
      DocumentClient: jest.fn(() => ({
        put: jest.fn().mockImplementation((params) => {
          if (params.Item && params.Item.Name === "existingItem") {
            return { Attributes: { ID: 123 } }; // to simulate update
          } else {
            return { promise: jest.fn() }; //to simulate insert
          }
        }),
        update: jest.fn().mockImplementation((params) => {
          // Simulating update
          return { promise: async () => ({ Attributes: { ID: 123 } }) };
        }),
        query: jest.fn().mockImplementation((params) => {
          // Simulating query
          if (
            params.KeyConditionExpression === "#Name = :name" &&
            params.ExpressionAttributeValues[":name"] === "existingItem"
          ) {
            return {
              promise: async () => ({
                Items: [
                  {
                    Price: "5.00",
                    ID: 111,
                    Category: "Stationary",
                    LastUpdatedDate: "2022-01-01T12:00:00.000Z",
                    Name: "existingItem",
                  },
                ],
              }),
            };
          } else {
            return { promise: async () => ({ Items: [] }) };
          }
        }),
        scan: jest.fn().mockImplementation((params) => {
          // Simulating scan
          if (
            params.FilterExpression ===
            "LastUpdatedDate BETWEEN :start_date AND :end_date"
          ) {
            return {
              promise: async () => ({
                Items: [
                  {
                    Price: "3.00",
                    ID: 112,
                    Category: "Gift",
                    LastUpdatedDate: "2022-01-01T12:00:00.000Z",
                    Name: "Key Chain",
                  },
                  {
                    Price: "5.50",
                    ID: 113,
                    Category: "Gift",
                    LastUpdatedDate: "2022-01-01T12:00:00.000Z",
                    Name: "Bag Cover",
                  },
                ],
              }),
            };
          } else {
            return { promise: async () => ({ Items: [] }) };
          }
        }),
      })),
    },
  };
});

describe("Inventory Management Functions", () => {
  describe("insertOrUpdateItem", () => {
    test("should insert a new item and return the ID", async () => {
      const newItem = { Name: "Pen", Category: "Stationary", Price: "2.75" };
      const result = await insertOrUpdateItem(newItem);
      expect(result).toBeDefined();
      expect(typeof result).toBe("number"); //returns an ID
    });

    test("should update an existing item and return the ID", async () => {
      const existingItem = {
        Name: "Notebook",
        Category: "Stationary",
        Price: "6.00",
      };
      const result = await insertOrUpdateItem(existingItem);
      console.log("result is: " + result);
      expect(result).toBeDefined();
      expect(typeof result).toBe("number"); //returns an ID
    });
  });

  describe("queryItemsByDateRange", () => {
    test("should query items within the specified date range", async () => {
      const dtFrom = "2022-01-01 00:00:00";
      const dtTo = "2024-01-31 23:59:59";
      const result = await queryItemsByDateRange(dtFrom, dtTo);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true); //returns an array of items
    });
  });

  describe("aggregateItemsByCategory", () => {
    test("should aggregate items by category and return the result", async () => {
      const category = "Stationary";
      const result = await aggregateItemsByCategory(category);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true); //returns an array of items
    });

    test('should return all categories when "all" is passed as the category', async () => {
      const result = await aggregateItemsByCategory("all");
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true); //returns an array of items
    });
  });
});

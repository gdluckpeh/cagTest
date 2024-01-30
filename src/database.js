const AWS = require("aws-sdk/clients/dynamodb");

const dynamoDB = new AWS.DocumentClient();
const tableName = "InventoryDatabase";

const insertOrUpdateItem = async (item) => {
  const { name, category, price } = item;

  // Check if the item already exists in the DynamoDB table
  const existingItem = await dynamoDB
    .get({
      TableName: tableName,
      Key: { name },
    })
    .promise();

  // If the item exists, update the price; otherwise, insert a new item
  if (existingItem.Item) {
    await dynamoDB
      .update({
        TableName: tableName,
        Key: { name },
        UpdateExpression:
          "SET price = :price, last_updated_dt = :last_updated_dt",
        ExpressionAttributeValues: {
          ":price": price,
          ":last_updated_dt": new Date().toISOString(),
        },
      })
      .promise();
  } else {
    const id = Math.floor(Math.random() * 100000); // to generate a random ID
    await dynamoDB
      .put({
        TableName: tableName,
        Item: {
          id,
          name,
          category,
          price,
          last_updated_dt: new Date().toISOString(),
        },
      })
      .promise();
    return id;
  }
};

const queryItemsByDateRange = async (dtFrom, dtTo) => {
  const params = {
    TableName: tableName,
    FilterExpression: "#last_updated_dt BETWEEN :start_date AND :end_date",
    ExpressionAttributeNames: {
      "#last_updated_dt": "last_updated_dt",
    },
    ExpressionAttributeValues: {
      ":start_date": dtFrom,
      ":end_date": dtTo,
    },
  };

  const result = await dynamoDB.scan(params).promise();
  return result.Items;
};

const aggregateItemsByCategory = async (category) => {
  const params = {
    TableName: tableName,
  };

  if (category !== "all") {
    params.FilterExpression = "#category = :category";
    params.ExpressionAttributeNames = { "#category": "category" };
    params.ExpressionAttributeValues = { ":category": category };
  }

  const result = await dynamoDB.scan(params).promise();

  const aggregatedResult = result.Items.reduce((acc, item) => {
    const category = item.category;
    const price = parseFloat(item.price);

    if (!acc[category]) {
      acc[category] = { total_price: price, count: 1 };
    } else {
      acc[category].total_price += price;
      acc[category].count += 1;
    }

    return acc;
  }, {});

  return Object.entries(aggregatedResult).map(
    ([category, { total_price, count }]) => ({
      category,
      total_price: total_price.toFixed(2),
      count,
    })
  );
};

module.exports = {
  insertOrUpdateItem,
  queryItemsByDateRange,
  aggregateItemsByCategory,
};

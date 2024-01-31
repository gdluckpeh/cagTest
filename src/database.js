const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const uuidToInt = (uuid) => {
  const hexString = uuid.replace(/-/g, "");
  const bigInt = BigInt(`0x${hexString}`);
  return Number(bigInt);
};

AWS.config.update({ region: "ap-southeast-1" }); //Singapore

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = "InventoryDatabase";

const insertOrUpdateItem = async (item) => {
  item.Price = parseFloat(item.Price).toFixed(2);
  try {
    const params = {
      TableName: tableName,
      Key: {
        Name: item.Name,
      },
      Item: {
        Name: item.Name,
        Category: item.Category,
        Price: item.Price,
        ID: uuidToInt(uuidv4()), // to ensure it is granular enough for uniqueness
        LastUpdatedDate: new Date().toISOString(),
      },
    };

    // Check if the item already exists
    const existingItem = await dynamoDB
      .query({
        TableName: tableName,
        KeyConditionExpression: "#Name = :name",
        ExpressionAttributeValues: {
          ":name": item.Name,
        },
        ExpressionAttributeNames: {
          "#Name": "Name",
        },
      })
      .promise();

    if (existingItem.Items.length > 0) {
      //if it exists, then update the item price and lastUpdatedDate only
      await dynamoDB
        .update({
          TableName: tableName,
          Key: {
            Name: item.Name,
          },
          UpdateExpression:
            "SET Price = :price, LastUpdatedDate = :lastUpdatedDate", //note that Category cant be updated here
          ExpressionAttributeNames: {
            "#Name": "Name",
          },
          ExpressionAttributeValues: {
            ":price": item.Price,
            ":lastUpdatedDate": new Date().toISOString(),
          },
          ConditionExpression: "attribute_exists(#Name)", // Check if the item with the specified name exists
        })
        .promise();

      return existingItem.Items[0].ID; // Return the ID of the existing item
    } else {
      // if it doesn't exist, insert a new item
      await dynamoDB.put(params).promise();
      return params.Item.ID; // Return the ID of the newly inserted item
    }
  } catch (error) {
    console.error("Error inserting/updating item: ", error);
    throw error;
  }
};

const queryItemsByDateRange = async (dtFrom, dtTo) => {
  try {
    const params = {
      TableName: tableName,
      FilterExpression: "LastUpdatedDate BETWEEN :start_date AND :end_date",
      ExpressionAttributeValues: {
        ":start_date": dtFrom,
        ":end_date": dtTo,
      },
    };
    console.log("inside here");
    const result = await dynamoDB.scan(params).promise();
    return result.Items;
  } catch (error) {
    console.error("Error querying items by date range: ", error);
    throw error;
  }
};

const aggregateItemsByCategory = async (category) => {
  try {
    const params = {
      TableName: tableName,
    };

    if (category !== "all") {
      params.FilterExpression = "Category = :category";
      params.ExpressionAttributeValues = { ":category": category }; //case sensitive
    }

    const result = await dynamoDB.scan(params).promise();

    const aggregatedResult = result.Items.reduce((acc, item) => {
      const category = item.Category;
      const price = parseFloat(item.Price);

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
  } catch (error) {
    console.error("Error aggregating items by category: ", error);
    throw error;
  }
};

module.exports = {
  insertOrUpdateItem,
  queryItemsByDateRange,
  aggregateItemsByCategory,
};

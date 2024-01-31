# Cag Test

### Hi, I'll be using AWS DynamoDB as a database, with the help of aws-sdk, and Javascript with ExpressJS as a node.js web application framework, with AWS Serverless Express, which is NodeJS-based API framework used for mimicking the routing capabilities of the ExpressJS framework. To start, make sure you have nodejs (preferably node.js 18) and AWS CLI installed:

## AWS CLI

1. Install AWS CLI:
   Install the AWS CLI on your machine from this link: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html under 'AWS CLI install and update instructions' section

## Nodejs

2. Download node.js (preferably version 18) from this website: https://nodejs.org/en/blog/release/v18.12.0.

### Next, we will configure AWS access and secret keys. Do note that this is not the best security practice, once this test is done, I will remove it (but rest assured that only minimal permissions are given). This is to connect to the AWS DynamoDB.

3. Type 'aws configure' on your terminal, where you will be running your code on.

4. a) Type 'AKIA6BGD7GBULSZOFSAV' as your AWS Access Key ID, click enter.

   b) Type 'f8jfYFE3hKZMo7I6jY7fH3tzsT1Ybc9tSpQTUKvT' as your AWS Secret Access Key, click enter.

   c) Type 'ap-southeast-1' as your Default region name, click enter.

   d) Type 'None' in your Default output format, click enter.

### Great, now we can connect to the database after all configurations is done! Next, we will use the 'curl' command to make HTTP requests to a local server running on 'http://localhost:3000'.

5. We can proceed by running 'npm install' on the same terminal, after cloning of the project.

6. Next, we will kick start the running of server by typing 'npm start'.

7. While the terminal is running, open another terminal, from here, we are going to do some testings based on the tasks:

7. a) run

   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{"name": "Pencil", "category": "Stationary", "price": "6.00"}' http://localhost:3000/items
   ```
   
   this should insert a new data into the DynamoDB and return you a newly inserted id.

   b) run

   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{"name": "Notebook", "category": "Stationary", "price": "5.5"}' http://localhost:3000/items
   ```
   
   this should return you an existing id, as well as to update the price. You may change the price.

   c) run

   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{"dt_from": "2022-01-01 10:00:00", "dt_to": "2024-02-01 23:59:59"}' http://localhost:3000/items/queryByDateRange
   
   ```
   
   this should return you an array with various items between these datetime.

   d) run

   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{"category": "all"}' http://localhost:3000/items/aggregateByCategory
   ```
   
   this should return you a list containing everything.

   e) run

   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{"category": “Stationary”}' http://localhost:3000/items/aggregateByCategory
   ```
   
   this should return you a list containing only the Category: Stationary.

### Do note that the words inside the commands are case-sensitive (sorry, not much time to make it case-insensitive). Do also note that the time provided is in terms of UTC.

## Unit Tests

9. In case all the above fails, we still have our unit tests.

10. To execute, please run 'npm test', this will returned the mock results from Dynamo DB.

11. These are the test cases ran through Jest:

- should insert a new item and return the ID;
- should update an existing item and return the ID;
- should query items within the specified date range;
- should aggregate items by category and return the result;
- should return all categories when "all" is passed as the category.

### P.S. I'm using 'Name' as the partition key in DynamoDB.

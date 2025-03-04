const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient();
const dynamo = DynamoDBDocumentClient.from(client);
const USERS_TABLE = process.env.USERS_TABLE;

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { username, password } = body;

        if (!username || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Username and password are required" }),
            };
        }

        // Fetch user from DynamoDB
        const getParams = new GetCommand({
            TableName: USERS_TABLE,
            Key: { username }
        });

        const result = await dynamo.send(getParams);

        // **Fix: Check if user exists before accessing password**
        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "User does not exist" }),
            };
        }

        // Check password (Consider hashing instead of plain-text comparison)
        if (result.Item.password !== password) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: "Invalid credentials" }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Successfully logged in" }),
        };
    } catch (error) {
        console.error("Error in Login", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error in Login" }),
        };
    }
};

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

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

        // Check if user exists
        const getParams = new GetCommand({
            TableName: USERS_TABLE,
            Key: { username }
        });

        const userExists = await dynamo.send(getParams);
        if (userExists.Item) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "User already exists" }),
            };
        }

        // Store user
        const putParams = new PutCommand({
            TableName: USERS_TABLE,
            Item: { username, password } // Ideally, hash password before storing
        });

        await dynamo.send(putParams);
        return {
            statusCode: 201,
            body: JSON.stringify({ message: "User created successfully" }),
        };
    } catch (err) {
        console.error("Error in Signup", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error in Signup" }),
        };
    }
};

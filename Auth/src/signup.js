const aws = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE;


exports.handler = async (event) => {
    try {
        const  body = JSON.parse(event.body);
        const {username, password} = body;

        if (!username || !password) {
            return {
                status: 400,
                body: JSON.stringify({
                    message: "Username or password is required",
                }),
            }
        }
        // check if user exits
        const getParams = {
            TableName: username,
            Key: {username}
        }

        const userExists = await dynamodb.get(getParams).promise()
        if (userExists.Item) {
            return {
                status: 400,
                body: JSON.stringify({
                    message: "User already exists",
                })
            }
        }

        // hash the pass before storing

        const putParams = {
            TableName: USERS_TABLE,
            Item: {username, password}
        }
        await dynamodb.put(putParams).promise()
        return {
            status: 200,
            body: JSON.stringify({
                message: "User created successfully"
            })
        }
    }catch(err) {
        console.error("Error in Signup",err)
        return {
            status: 400,
            body: JSON.stringify({
                message: "Error in Signup",

            })
        }
    }
}
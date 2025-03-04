const aws = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE;


exports.handler = async  (event) => {
    try {
        const body = JSON.parse(event.body);
        const {username, password} = body;

        if (!username || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Username or password are required',
                })
            }
        }
        const params = {
            TableName: USERS_TABLE,
            Key: {username}
        }
        const result = await dynamodb.get(params).promise();
        if (!result) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'User does not exist',
                })
            }
        }

        if (result.Item.password !== password) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: 'Passwords do not match',
                })
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Successfully logged in',
            })
        }
    }catch (error) {
        console.error(error)
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Failed to log in',
            })
        }
    }
}
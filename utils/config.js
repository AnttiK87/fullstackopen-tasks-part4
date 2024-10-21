// For managing environment variables

// Get variables from dotenv file
require('dotenv').config()

// Set the server port
const PORT = process.env.PORT

// Set the MongoDB URI and use different URI for testing
const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

// Exports
module.exports = {
  MONGODB_URI,
  PORT
}
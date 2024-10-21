// Model for users that are added to the db

// Dependencies
const mongoose = require('mongoose')

// "Blueprints" for user in the db and settings for validation
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    unique: true // username must be unique
  },
  name: String,
  passwordHash: String,
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ],
})

// Editing how user data is returned as JSON
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

// Creating the User model using the schema
const User = mongoose.model('User', userSchema)

// Exports
module.exports = User
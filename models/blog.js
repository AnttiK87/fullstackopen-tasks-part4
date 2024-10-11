const mongoose = require('mongoose')

// define model and validation for items in db
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
      },
    author: {
        type: String,
        required: true
      },
    url: {
        type: String,
        required: true
      },
    likes:{
        type: Number,
        default: 0 // Asettaa likes-arvoksi oletuksena 0
      }
})

// customize the JSON representation, don't show id and version
blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


// export the blog model
module.exports = mongoose.model('Blog', blogSchema)
const mongoose = require('mongoose')

const ideaSchema = new mongoose.Schema({
  text: String,
  bin: String
})

module.exports = mongoose.model('Idea', ideaSchema)

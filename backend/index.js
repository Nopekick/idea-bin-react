const app = require('express')()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const Idea = require('./idea.js')
const cors = require('cors')

app.use(bodyParser.json())
app.use(cors())

mongoose.set('debug', true);
mongoose.Promise = Promise
mongoose.connect(" < >", { useNewUrlParser: true })


app.get("/:bin", function(req, res, next){
  Idea.find({bin: req.params.bin}).then((ideas)=>{
    console.log(ideas)
    res.json({ideas})
  }).catch((err)=>{
    res.send('Error in creating idea', err)
  })
})

app.post("/:bin", function(req, res, next){
  Idea.create(req.body).then((idea)=>{
    console.log(idea)
    res.json({idea})
  }).catch((err)=>{
    res.send('Error in creating idea', err)
  })
})

app.delete("/:idea_id", function(req, res, next){
  Idea.findOneAndDelete({_id: req.params.idea_id}).catch((err)=>{
    console.log(err)
  })

})

app.get('/', function(req, res, next){
  res.send('Nothing here')
})


app.listen(8080, ()=>{
  console.log('server running on port 8080')
})

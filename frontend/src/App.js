import React, { Component } from 'react';
import './App.css';
import {withRouter} from 'react-router-dom';
import axios from 'axios';
import uuid from 'uuidv4';
import aesjs from 'aes-js';
import crypto from 'crypto'

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      typed: '',
      ideas: [],
      error: ''
    }

    this.url = props.location.pathname
    this.bin = this.url.split('/')[1]
    this.encryptionKey = this.url.split('/')[2]

    this.handleSubmit = this.handleSubmit.bind(this)
  }

componentDidMount(){
    setTimeout(this.init, 2500)
}

init = () => {
      if(!uuid.is(this.bin)){
          const genbin = uuid()
          const genencryptionKey = aesjs.utils.hex.fromBytes(window.crypto.getRandomValues(new Uint8Array(32)));

          this.props.history.push(`/${genbin}/${genencryptionKey}`)
          this.url = this.props.location.pathname
          this.bin = this.url.split('/')[1]
          this.encryptionKey = this.url.split('/')[2]
          this.componentDidMount()

      } else {

        axios.get(`http://localhost:8080/${this.bin}`).then(({data})=>{
          let ekey = aesjs.utils.hex.toBytes(this.encryptionKey);
          let ideas = data.ideas.map(({text, _id})=>{
              let encryptedBytes = aesjs.utils.hex.toBytes(text);
              let aesCtr = new aesjs.ModeOfOperation.ctr(ekey, new aesjs.Counter(5));
              let decryptedBytes = aesCtr.decrypt(encryptedBytes);
              let decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
              return {
                text: decryptedText,
                _id
              }
          })
          this.setState({ideas})
        }).catch((err)=>{
          console.log(err)
        })

      }
  }

async handleSubmit(e){
  e.preventDefault();
  let ekey = aesjs.utils.hex.toBytes(this.encryptionKey);

  let idea = this.state.typed

  if(idea.length === 0){
    return
  }

  let textBytes = aesjs.utils.utf8.toBytes(idea);
  let aesCtr = new aesjs.ModeOfOperation.ctr(ekey, new aesjs.Counter(5));
  let encryptedBytes = aesCtr.encrypt(textBytes);
  let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
  let obj = {
    bin: this.bin,
    text: encryptedHex
  }

  await axios.post(`http://localhost:8080/${this.bin}`, obj).then(({data})=>{
    obj.text = idea
    obj._id = data.idea._id
  })

  let ideas = this.state.ideas.slice()
  ideas.push(obj)
  this.setState({typed: '', ideas})
}

handleDelete = (e, id) => {
  e.preventDefault();
  console.log(id)
  axios.delete(`http://localhost:8080/${id}`)
  let newIdeas = this.state.ideas.filter((idea)=>{
    return idea._id !== id
  })
  this.setState({ideas: newIdeas})
}

  render() {
    let ideas = this.state.ideas.map((idea)=>{
      let {_id, text} = idea
      return <div className="idea" key={_id}>
            <p> {text} </p><button className='x'  onClick={(e)=>{this.handleDelete(e, _id)}}> X </button>
      </div>
    })

    return (
      <div id='main'>
        <h1> Idea Bin React </h1>
        <form onSubmit={this.handleSubmit}>
          <input autoComplete="off" id="input" type='text' name='typed' placeholder=' Your idea' value={this.state.typed}
            onChange={(e)=> {this.setState({[e.target.name]: e.target.value}) }}  />
            <button type='submit'> Add </button>
        </form>
        {this.state.ideas.length===0 ?
          <div id="explanation">
              <p> Idea Bin is an easy way to keep track of your ideas while keeping them private.</p>
              <p> Feel free to bookmark this page so that you can quickly jot down your ideas as they come to you. </p>
              <p>  If you're curious: the URL consists of the id of your "bin" and your aes256 key.
                Both of these things are in the hash—that way they're never sent to our servers. </p>
              <p> Of course, you don't have to take my word for it; you should check yourself by reviewing the source code at
              </p>
        </div>
        :  (<div id="ideas">
          {ideas}
        </div>)
        }
      </div>
    );
  }
}

export default withRouter(App);

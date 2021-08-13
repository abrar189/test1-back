'use strict'

require('dotenv').config();
const express = require ('express');
const cors =require ('cors');
const server =express();
const PORT= process.env.PORT
const mongoose=require('mongoose');
const { default: axios } = require('axios');
server.use(cors());
server.use(express.json());
mongoose.connect(process.env.MONGODB,{ useNewUrlParser: true, useUnifiedTopology: true });

// http://localhost:3006
server.get('/', (req,res)=>{
    res.send('hiiiiiii')
})



const colorSchema = new mongoose.Schema({
    title: String,
    imageUrl:String,
  });
  
  const userSchema = new mongoose.Schema({
   email: String,
   colorData:[colorSchema],
  });
  
  const userModel = mongoose.model('user', userSchema);

  function seedUser(){
      let userData =new userModel ({
          email:'algourabrar@gmail.com',
          colorData: [{
            "title": "dutch teal",
            "imageUrl": "http://www.colourlovers.com/img/1693A5/100/100/dutch_teal.png",

          },
        {
            "title": "heart of gold",
            "imageUrl": "http://www.colourlovers.com/img/FBB829/100/100/heart_of_gold.png",

        }]
      })
      userData.save();

  }
//   seedUser();

// http://localhost:3006/DBdata?email
server.get('/DBdata',getfromDB);
function getfromDB(req,res){
    let email =req.query.email
    userModel.find({email:email},(error,userData)=>{
        if(error){
            res.send(error)
        }else{
            res.send(userData[0].colorData)
        }
    })
}

// https://ltuc-asac-api.herokuapp.com/allColorData
// http://localhost:3006/apiData
let memory={};
server.get('/apiData',getapiData)
async function getapiData(req,res){
    const url ='https://ltuc-asac-api.herokuapp.com/allColorData'
    if(memory["apidata"] !== undefined){
        res.send(memory["apidata"])
    }else{
        const apiData= await axios.get(url);
        const apiMap=apiData.data.map(item=>{
            return new Dataobj(item);
        })
        memory["apidata"]=apiMap;
        res.send(apiMap)
    }

}

class Dataobj{
    constructor(data){
        this.title=data.title;
        this.imageUrl=data.imageUrl;
    }
}


// http://localhost:3006/addtofav
server.post('/addtofav', Addfav)
async function Addfav(req,res){
    let{ email,title,imageUrl}  =req.body
    userModel.find({email:email},(error,userData)=>{
        if(error){
            res.send(error)
        }else{
            const newfav ={
                title:title,
                imageUrl:imageUrl
            }
           userData[0].colorData.push(newfav)
        } 
        userData[0].save();
        res.send(userData[0])
    })
}

// http://localhost:3006/deletecolor?email=
server.delete('/deletecolor/:idx',deleteData)
function deleteData(req,res){
    let idx =req.params.idx;
    let email=req.query.email
    userModel.findOne({email:email},(error,userData)=>{
        if(error){
            res.send(error)
        }else{
            userData.colorData.splice(idx,1);
            userData.save();
            res.send(userData.colorData)
        }
    })
}

// http://localhost:3006/update
server.put('/update/:idx',updateData)
function updateData(req,res){
    let idx =req.params.idx;
    let{ email,title,imageUrl} =req.body;
    userModel.findOne({email:email},(error,userData)=>{
        if(error){
            res.send(error)
        }else{
            userData.colorData.splice(idx,1,{
                title:title,
                imageUrl:imageUrl
            });
            userData.save();
            res.send(userData.colorData)
        }
    })

}

  server.listen(PORT,()=>{
    console.log(`listen to ${PORT}`);
})


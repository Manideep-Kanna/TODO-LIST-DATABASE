//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require('mongoose');
const _=require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect('mongodb://localhost:27017/todoDB');

mongoose.connect('mongodb+srv://admin-manideep:1234@cluster0.4qtfb.mongodb.net/todoDB')

const taskSchema={
  name:String
};

const Task=new mongoose.model('Task',taskSchema);

const task1=new Task({
  name:"Task 1"
});

const task2=new Task({
  name:"Task 2"
});

const task3=new Task({
  name:"Task 3"
});


const defaultTasks=[task1,task2,task3];

const listSchema={
  name:String,
  tasks:[taskSchema]
}



const List=new mongoose.model('List',listSchema);


app.get("/", function(req, res) {

  // const day = date.getDate();

  Task.find({},(err,tasks)=>{
    if(err){
      console.log(err);
    }
    else{
      if(tasks.length===0){

        Task.insertMany(defaultTasks,(err)=>{
          if(err){
            console.log(err);
          }
          else{
            console.log("Successfully inserted values");
          }
        });

        res.redirect('/');
      }
      else{
        res.render("list", {listTitle: "Today", tasks: tasks});
      }
      
    }
  });



});

app.post("/", function(req, res){

  const TaskName=req.body.newTask;
  const listName=req.body.list;
  console.log(listName);

  const newTask = new Task({
    name: TaskName
   });

  if(listName==="Today"){
    newTask.save();
    res.redirect('/');
  }
  else{
    List.findOne({name:listName},(err,foundList)=>{
      if(err){
        console.log(err);
      }
      else{
        foundList.tasks.push(newTask);
        foundList.save();
        res.redirect('/'+listName);
      }
    })
  }
});

app.get("/about", function(req, res){
  res.render("about");
});


app.post('/delete',(req,res)=>{
  const checkTaskId=req.body.checkbox;
  const listName=req.body.list;
  if(listName==="Today"){
    Task.findByIdAndRemove(checkTaskId,(err)=>{
      if(err){
        console.log(err);
      }
      else{
        res.redirect('/');
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{tasks:{_id:checkTaskId}}},(err,foundList)=>{
      if(!err){
        res.redirect('/'+listName);
      }
    })

  }
});

app.get("/:customListType",(req,res)=>{
  const customListName=req.params.customListType;
  List.findOne({name:customListName},(err,foundList)=>{
    if(err){
      console.log(err);
    }
    else{
      if(!foundList){
        let list=new List({
          name:customListName,
          tasks:defaultTasks
        });
        list.save();
        res.redirect('/'+customListName);
      }
      else{
        res.render("list", {listTitle: foundList.name, tasks: foundList.tasks});
      }
    }
  })
})

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});

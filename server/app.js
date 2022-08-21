const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User");
const UserRoutes = require("./routers/User");

const bcrypt = require("bcrypt")
const saltRounds = 10;

const app = express();

app.use(cors());
app.options("*", cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



mongoose.connect("mongodb://localhost:27017/Poolit" , {useNewUrlParser: true} ); //local
const db = mongoose.connection;
db.on("error" , (error) => console.log(error));
db.once("open" , () => {
  console.log("Connect to DB");


});


app.use("/users" ,UserRoutes);

app.get("/" ,function(req, res){
    
});


let port = process.env.PORT || 4000;

app.listen(port , function(){
    console.log("Server has started on port " , port);
})
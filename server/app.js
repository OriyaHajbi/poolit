const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');

const User = require("./models/User");
const UserRoutes = require("./routers/User");
const EventRoutes = require("./routers/Event");

const bcrypt = require("bcrypt")
const saltRounds = 10;

const MONGODB_URI = "mongodb://localhost:27017/Poolit";

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
app.use(cookieParser());
app.use(cors());
app.options("*", cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'PoolitSecret', resave: false, saveUninitialized: false, store: store }))



mongoose.connect(MONGODB_URI, { useNewUrlParser: true }); //local
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => {
  console.log("Connect to DB");
  User.find({}, async function (err, foundUser) {
    if (foundUser.length === 0) {

      bcrypt.hash("manager", saltRounds, function (err, hash) {
        const yotam = new User({
          username: "yotam@poolit.com",
          password: hash,
          isCoach: true,
          swimmingStyle: ["Front crawl", "Breaststroke", "Backstroke", "Butterfly"],
          workDays: [2, 5],
          workHours: [16, 20]
        });
        yotam.save();
      }
      )
      bcrypt.hash("manager", saltRounds, function (err, hash) {
        const yoni = new User({
          username: "yoni@poolit.com",
          password: hash,
          isCoach: true,
          swimmingStyle: ["Breaststroke", "Butterfly"],
          workDays: [3, 4, 5],
          workHours: [8, 15]
        });
        yoni.save();
      }
      )
      bcrypt.hash("manager", saltRounds, function (err, hash) {
        const joni = new User({
          username: "joni@poolit.com",
          password: hash,
          isCoach: true,
          swimmingStyle: ["Front crawl", "Breaststroke", "Backstroke", "Butterfly"],
          workDays: [1, 3, 5],
          workHours: [10, 19]
        });
        joni.save();
      }
      )

    }
  })

});


app.use("/users", UserRoutes);
app.use("/event", EventRoutes);

app.get("/", function (req, res) {

});


let port = process.env.PORT || 4000;

app.listen(port, function () {
  console.log("Server has started on port ", port);
})
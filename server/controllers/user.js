const User = require("../models/User");
const {validationResult} = require("express-validator");

const bcrypt = require("bcrypt")
const saltRounds = 10;

exports.postNewUser = async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.send(errors);
    }

    User.findOne({username: email} , function (err , foundUser){
        if (foundUser){
            return res.send("User Exist");
        }else{
            bcrypt.hash(password, saltRounds, function (error, hash) {
                const user = new User({
                    username: email,
                    password: hash,
                    isCoach: false
                });
                user.save();
                return res.send(user);
            })
        }
    })
}

exports.postUserLogin = async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;
    User.findOne({username: email} , function (err , foundUser){
        if (!foundUser){
            return res.send("User doesn't exist");
        }else{
            bcrypt.compare(password, foundUser.password, function (error, result) {
                if (result === true) {
                    return res.json(foundUser);
                } else {
                    return res.json("incorrect password");
                }
            })
        }
    })
}
const User = require("../models/User");
const { validationResult } = require("express-validator");

const bcrypt = require("bcrypt")
const saltRounds = 10;

exports.postNewUser = async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;
    const isCoach = req.body.isCoach;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.send(errors);
    }

    User.findOne({ username: email }, function (err, foundUser) {
        if (foundUser) {
            return res.send("User Exist");
        } else {
            bcrypt.hash(password, saltRounds, function (error, hash) {
                const user = new User({
                    username: email,
                    password: hash,
                    isCoach: isCoach
                });
                user.save();
                return res.send(user);
            })
        }
    })
}

exports.getUserLogin = async (req, res) => {

    console.log(req.session.isLoggedIn);
    return res.json("req.session.isLoggedIn");

}

exports.postUserLogout = async (req, res) => {
    req.session.destroy((err) => {
        console.log(err);
        return res.json("session deleted");
    });
}



exports.postUserLogin = async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ username: email }, function (err, foundUser) {
        if (!foundUser) {
            return res.send("User doesn't exist");
        } else {
            bcrypt.compare(password, foundUser.password, function (error, result) {
                if (result === true) {
                    req.session.isLoggedIn = true;
                    req.session.user = foundUser;
                    console.log(req.session);
                    return res.json(foundUser);
                } else {
                    return res.json("incorrect password");
                }
            })
        }
    })
}

exports.getCoachList = async (req, res) => {
    const isCoach = req.query.isCoach;

    User.find({ isCoach: isCoach }, function (err, foundCoach) {
        if (!foundCoach) {
            return res.json("No Coach")
        } else {
            return res.json(foundCoach);
        }
    })
} 
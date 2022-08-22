const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const {check} = require("express-validator");




//register new user
router.post("/register",check('email').isEmail() ,userController.postNewUser);

router.post("/login",check('email').isEmail() ,userController.postUserLogin);

router.get("/user" ,userController.getCoachList);

module.exports = router;
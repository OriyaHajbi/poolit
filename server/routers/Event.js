const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event");
const {check} = require("express-validator");


router.post("/addevent" ,eventController.addEvent);

router.get("/getevents" ,eventController.getEvents);

router.get("/getweekevents" ,eventController.getWeekEvents);


module.exports = router;
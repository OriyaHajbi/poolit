const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event");
const { check } = require("express-validator");
const isAuth = require("../middleware/is-auth");


router.post("/addevent", eventController.addEvent);

router.get("/getevents", eventController.getEvents);

router.get("/getweekevents", eventController.getWeekEvents);

router.post("/deleteevent", eventController.deleteEvent);

router.post("/updateevent", eventController.updateEvent);

module.exports = router;
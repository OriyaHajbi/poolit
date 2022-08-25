const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  
  username: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  days: {
    type: Number,
    min:1,
    max:5,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  lesson: {
    type: String,
    required: true,
  },
  style: {
    type: String,
    required: true,
  },
  coach: {
    type: String,
    required: true,
  },
  weekNumber: {
    type: String,
    required: true,
  }
  
});



module.exports = mongoose.model("Event", eventSchema);
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isCoach: {
    type: Boolean,
    required: true,
  },
  swimmingStyle: {
    type: Array,
    required: false,
  },
  workDays: {
    type: Array,
    required: false,
  },
  workHours: {
    type: Array,
    required: false,
  }
  
});



module.exports = mongoose.model("User", userSchema);
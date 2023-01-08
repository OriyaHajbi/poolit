const Event = require("../models/Event");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const fs = require('fs');

exports.deleteEvent = async (req, res) => {

    Event.findOneAndDelete({ username: req.body.id }, function (err, foundEvent) {
        if (foundEvent) {
            return res.json("Event deleted")
        } else {
            return res.json("Event doesn't deleted")
        }
    })
}

exports.updateEvent = async (req, res) => {
    const lesson = req.body.lesson;
    const style = req.body.style;
    const count = parseInt(req.body.count);
    const coach = req.body.coach;
    const text = req.body.text;
    const eventId = req.body.id;
    const start = req.body.start;
    const end = req.body.end;
    const days = req.body.resource;



    Event.find({ username: eventId }, (err, foundEvent) => {
        if (!foundEvent) {
            console.log("No Event Found");
        } else {
            User.findById({ _id: coach.split("@@")[0] }, function (err, foundCoach) {
                if (foundCoach) {
                    // console.log(foundCoach);
                    const dayRes = isCoachTeachingInDay(foundCoach, days);
                    if (dayRes) {
                        const numberRes = isCountAvailble(count, lesson);
                        if (numberRes) {
                            const hourRes = isCoachTeachingBetweenHours(foundCoach, start, end);
                            if (hourRes) {
                                const styleRes = isCoachKnowStyle(foundCoach, style);
                                if (styleRes) {
                                    const toUpdate = {
                                        lesson: lesson,
                                        style: style,
                                        countTrainees: count,
                                        coach: coach,
                                        text: text,
                                        start: new Date(start),
                                        end: new Date(end),
                                    };
                                    Event.findOneAndUpdate({ username: eventId }, toUpdate, function (error, eventUpdated) {
                                        if (eventUpdated) {
                                            console.log("Event updated");
                                        } else {
                                            console.log("Event not updated");
                                        }
                                    });
                                    return res.json("Event updated")
                                } else {
                                    return res.json("Event doesn't updated")
                                }
                            } else {
                                return res.json("Event doesn't updated")
                            }
                        } else {
                            return res.json("Event doesn't updated")
                        }
                    } else {
                        return res.json("Event doesn't updated")
                    }

                } else {
                    console.log("Coach doesn't found");
                }
            });
        }
    })
}


exports.getWeekEvents = async (req, res) => {
    const week = parseInt(req.query.week);
    // console.log("in server week is: " + week);

    if (!week || week < 1 || week > 53) {
        return res.json("Invalid input");
    }
    Event.find({ weekNumber: week }, function (err, foundEvents) {
        if (foundEvents.length === 0) {
            return res.json("Doesn't have events in this week");
        } else {
            const gant = JSON.stringify(foundEvents);
            fs.writeFile(`./gants/gantWeek${week}.json`, gant, function (err) {
                if (err) {
                    console.log(err);
                }
            });
            return res.json(foundEvents);
        }

    });
}

exports.getEvents = async (req, res) => {
    Event.find({}, function (err, foundEvents) {
        if (!foundEvents) {
            return res.json("No events");
        } else {
            return res.json(foundEvents);
        }
    });
}

exports.addEvent = async (req, res) => {
    const start = req.body.start;
    const weekNumber = req.body.weekNumber;
    const end = req.body.end;

    const id = req.body.id;
    const resource = req.body.resource;
    const text = req.body.text;
    const lesson = req.body.lesson;
    const style = req.body.style;
    const coach = req.body.coach;
    const countTrainees = parseInt(req.body.count);
    const coachId = coach.split("@@")[0];
    // console.log(`startHour: ${startHour}\nstartHourMinutes: ${startHourMinutes}\nendHour: ${endHour}\nendHourMinutes: ${endHourMinutes}\n`);
    //console.log(`start: ${start}\nend: ${end}\nid: ${id}\nresource: ${resource}\ntext: ${text}\nlesson: ${lesson}\nstyle: ${style}\ncoach: ${coachId}\n`);

    //check if is weekend
    if (parseInt(resource) > 5) {
        return res.json("The pool close in the weekend");
    }
    //check if entered all fields
    if (!coach || !style || !lesson || !countTrainees) {
        return res.json("Enter all fields");
    }


    var sos;
    User.findById(coachId, async (err, foundCoach) => {
        if (!foundCoach) {
            return res.json("Coach doesnt exist");
        } else {
            const numberRes = isCountAvailble(countTrainees, lesson);
            if (numberRes) {
                const timeAvailableRes = await isTimeAvailable(start, end, lesson);
                if (timeAvailableRes === 0) {
                    const coachTeachingRes = await isCoachTeachingNow(start, end, foundCoach);
                    if (coachTeachingRes) {
                        const styleRes = isCoachKnowStyle(foundCoach, style);
                        if (styleRes) {
                            const dayRes = isCoachTeachingInDay(foundCoach, resource);
                            if (dayRes) {
                                const hourRes = isCoachTeachingBetweenHours(foundCoach, start, end);
                                if (hourRes) {
                                    console.log("Event is correct");
                                    const event = new Event({
                                        username: id,
                                        id: id,
                                        start: new Date(start),
                                        end: new Date(end),
                                        days: parseInt(resource),
                                        text: text,
                                        lesson: lesson,
                                        style: style,
                                        coach: coach,
                                        weekNumber: parseInt(weekNumber),
                                        countTrainees: countTrainees
                                    });
                                    event.save();
                                    return res.json("ok");
                                } else {
                                    return res.json("Coach doent teach in this hours");
                                }
                            } else {
                                return res.json("Coach doent teach in this day");
                            }
                        } else {
                            return res.json("Coach doent teach this swimming style");
                        }
                    } else {
                        return res.json("Coach Teaching between this hours");
                    }
                } else {
                    return res.json("There is another lesson in the pool.");
                }
            } else {
                return res.json("The amount of trainees does not match the type of lesson.");
            }
        }
    })
}

async function isCoachTeachingNow(start, end, foundCoach) {
    const foundEvents = await Event.find({ start: { $gt: new Date(start), $lt: new Date(end) } });
    if (!foundEvents || foundEvents.length < 1) {
        return 1;
    }
    // console.log(foundEvents[0].coach.split("@@")[0]);
    // console.log(foundCoach._id.toString());

    const coachTeachId = foundEvents[0].coach.split("@@")[0];
    const newCoachId = foundCoach._id.toString();
    return coachTeachId === newCoachId ? 0 : 1;
}

async function isTimeAvailable(start, end, lesson) {
    var myRes;
    const foundEvents = await Event.find({ start: { $gt: new Date(start), $lt: new Date(end) } });
    const count = foundEvents.length
    if (count >= 2) {
        myRer = 0;
    } else if (count === 1) {
        if (foundEvents[0].lesson === "group" && lesson === "group") {
            myRes = 1;
        } else {
            myRes = 0;
        }
    } else {
        myRes = 0;
    }
    return myRes;
}
function isCountAvailble(countTrainees, lesson) {
    if (lesson === "group" && countTrainees >= 3 && countTrainees <= 7) {
        return 1;
    } else if (lesson === "private" && countTrainees === 1) {
        return 1;
    }
    return 0;
}
function isCoachKnowStyle(foundCoach, style) {
    for (var i = 0; i < foundCoach.swimmingStyle.length; i++) {
        if (style === foundCoach.swimmingStyle[i]) {
            return 1;
        }
    }
    return 0;
}
function isCoachTeachingInDay(foundCoach, day) {
    for (var i = 0; i < foundCoach.workDays.length; i++) {
        if (parseInt(day) === foundCoach.workDays[i]) {
            return 1;
        }
    }
    return 0;
}
function isCoachTeachingBetweenHours(foundCoach, start, end) {
    const startHour = parseInt(start.split("T")[1].split(":")[0]);
    const startHourMinutes = parseInt(start.split("T")[1].split(":")[1]);

    const endHour = parseInt(end.split("T")[1].split(":")[0]);
    const endHourMinutes = parseInt(end.split("T")[1].split(":")[1]);

    const coachStartHour = foundCoach.workHours[0];
    // console.log(new Date(2022, 11, 11, coachStartHour, 0, 0).getHours());
    const coachEndHour = foundCoach.workHours[1];

    if (startHour < coachStartHour || endHour > coachEndHour) {
        return 0;
    } else if (endHour === coachEndHour && endHourMinutes > 0) {
        return 0;
    }
    return 1;

}
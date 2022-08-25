const Event = require("../models/Event");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const fs = require('fs');



exports.getWeekEvents = async (req, res) => {
    const week = parseInt(req.query.week);
    // console.log("in server week is: " + week);

    if (!week || week < 0 || week > 60) {
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
    const coachId = coach.split("@@")[0];
    // console.log(`startHour: ${startHour}\nstartHourMinutes: ${startHourMinutes}\nendHour: ${endHour}\nendHourMinutes: ${endHourMinutes}\n`);
    //console.log(`start: ${start}\nend: ${end}\nid: ${id}\nresource: ${resource}\ntext: ${text}\nlesson: ${lesson}\nstyle: ${style}\ncoach: ${coachId}\n`);

    //check if is weekend
    if (parseInt(resource) > 5) {
        return res.json("The pool close in the weekend");
    }
    //check if entered all fields
    if (!coach || !style || !lesson) {
        return res.json("Enter all fields");
    }


    var sos;
    User.findById(coachId, async (err, foundCoach) => {
        if (!foundCoach) {
            return res.json("Coach doesnt exist");
        } else {
            const timeAvailableRes = await isTimeAvailable(start, end, res);
            if (timeAvailableRes === 0) {
                const styleRes = isCoachKnowStyle(foundCoach, style);
                if (styleRes) {
                    const dayRes = isCoachTeachingInDay(foundCoach, resource);
                    if (dayRes) {
                        const hourRes = isCoachTeachingBetweenHours(foundCoach, start, end);
                        if (hourRes) {
                            console.log("Event is correct");
                            const event = new Event({
                                username: id,
                                start: new Date(start),
                                end: new Date(end),
                                days: parseInt(resource),
                                text: text,
                                lesson: lesson,
                                style: style,
                                coach: coach,
                                weekNumber: weekNumber
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
                return res.json("There is another lesson in the pool.");
            }
        }
    })
}

async function isTimeAvailable(start, end, res) {
    var myRes;
    const foundEvents = await Event.find({ start: { $gt: new Date(start), $lt: new Date(end) } });
    myRes = foundEvents.length
    return myRes;
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
    const coachEndHour = foundCoach.workHours[1];

    if (startHour < coachStartHour || endHour > coachEndHour) {
        return 0;
    } else if (endHour === coachEndHour && endHourMinutes > 0) {
        return 0;
    }
    return 1;

}
import React, { Component } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotGantt, DayPilotNavigator } from "daypilot-pro-react";
import { ResourceGroups } from "./ResourceGroups";

const axios = require('axios').default;

class Calendar extends Component {

  constructor(props) {
    super(props);

    this.calendarRef = React.createRef();
    this.datePickerRef = React.createRef();
    this.addEventsToCalender();
    this.state = {
      timeRangeSelectedHandling: "Enabled",
      onTimeRangeSelected: async args => {
        const coaches = await this.getCoachList();
        const modal = await DayPilot.Modal.form([
          { name: "Trainees", id: "trainees", type: "select", options: coaches.map(element => { return { name: element.username.split("@")[0], id: element.username.split("@")[0] } }) },
          {
            name: "Swimming style", id: "style", type: "select", options: [
              { name: "Front crawl", id: "Front crawl" },
              { name: "Breaststroke", id: "Breaststroke" },
              { name: "Backstroke", id: "Backstroke" },
              { name: "Butterfly", id: "Butterfly" }]
          },
          {
            name: "Lesson", id: "lesson", type: "select", options: [
              { name: "Private", id: "private" },
              { name: "Group", id: "group" },
              { name: "Mix - private & group", id: "mix" }]
          },
          { name: "Coach", id: "coach", type: "select", options: coaches.map(element => { return { name: element.username.split("@")[0], id: element._id + "@@" + element.username.split("@")[0] } }) }
        ]);
        this.calendar.clearSelection();
        if (!modal.result) { return; }
        this.checkEventDetails(modal, args);
      },
      eventDeleteHandling: "Update",
      onEventClick: async args => {
        const coaches = await this.getCoachList();
        const modal = await DayPilot.Modal.form([
          {
            name: "Update Swimming style", id: "style", type: "select", options: [
              { name: "Front crawl", id: "Front crawl" },
              { name: "Breaststroke", id: "Breaststroke" },
              { name: "Backstroke", id: "Backstroke" },
              { name: "Butterfly", id: "Butterfly" }]
          },
          {
            name: "Update Lesson", id: "lesson", type: "select", options: [
              { name: "Private", id: "private" },
              { name: "Group", id: "group" },
              { name: "Mix - private & group", id: "mix" }]
          },
          { name: "Update Coach", id: "coach", type: "select", options: coaches.map(element => { return { name: element.username.split("@")[0], id: element._id } }) }

        ], { first: args.e.data.first, last: args.e.data.last, style: args.e.data.style, lesson: args.e.data.lesson, coach: args.e.data.coach });
        if (!modal.result) { return; }
        const e = args.e;
        e.data.text = modal.result.style + "-" + modal.result.lesson + "-" + modal.result.coach;
        e.data.start = args.e.data.start;
        e.data.end = modal.result.lesson === "private" ? new DayPilot.Date(args.e.data.start.value).addMinutes(45) : new DayPilot.Date(args.e.data.start.value).addMinutes(60)

        this.calendar.events.update(e);
      },
    };


  }

  get calendar() {
    return this.calendarRef.current.control;
  }

  get datePicker() {
    return this.datePickerRef.current.control;
  }

  componentDidMount() {
    const date = new Date();
    const today = date.getFullYear() + "-" + (date.getMonth() + 1 < 10 ? "0" : "") + (date.getMonth() + 1) + "-" + date.getDate();
    this.datePicker.select(today);
  }

  loadGroups() {
    const data = [
      {
        name: "Days", id: "days", days: [
          { name: "Sunday", id: "1" },
          { name: "Monday", id: "2" },
          { name: "Tuesday", id: "3" },
          { name: "Wednesday", id: "4" },
          { name: "Thursday", id: "5" },
        ]
      },
    ];
    return data;
  }

  groupChanged(group) {
    const columns = group.days;
    const events = [];
    this.calendar.update({ columns, events });
  }

  next() {
    const current = this.datePicker.selectionDay;
    const updated = current.addDays(7);
    this.datePicker.select(updated);
  }

  previous() {
    const current = this.datePicker.selectionDay;
    const updated = current.addDays(-7);
    this.datePicker.select(updated);
  }
  gant() {
    DayPilot.Modal.prompt("Please enter week number:",)
      .then(function (args) {
        if (args.result) {
          const params = { week: args.result };
          const URL = 'http://localhost:4000/event/getweekevents'; // for Local
          axios.get(URL, { params: params })
            .then((res) => {
              if (res.data === "Invalid input") {
                alert("Invalid input");
              } else if (res.data === "Doesn't have events in this week") {
                alert("Doesn't have events in this week");
              } else {
                console.log(res.data);

              }
            });
        }
      });
  }


  addEventsToCalender() {
    const URL = 'http://localhost:4000/event/getevents'; // for Local
    axios.get(URL)
      .then((res) => {
        if (res.data === "No events") {
          console.log("No Coach");
        } else {
          // console.log(res.data);
          res.data.forEach(element => {
            const start = new DayPilot.Date(new Date(element.start), true);
            const end = new DayPilot.Date(new Date(element.end), true);


            console.log(start);




            this.calendar.events.add({
              start: start.value,
              end: end.value,
              id: element.username,
              resource: String(element.days - 1),
              text: element.text,
              lesson: element.lesson,
              style: element.style,
              coach: element.coach,
            });
          });
        }
      });

  }

  checkEventDetails(modal, args) {
    const details = {
      weekNumber: args.start.weekNumber(),
      start: args.start,
      end: modal.result.lesson === "private" ? new DayPilot.Date(args.start.value).addMinutes(45) : new DayPilot.Date(args.start.value).addMinutes(60),
      id: DayPilot.guid(),
      resource: args.start.getDayOfWeek() + 1,
      text: modal.result.style + "-" + modal.result.lesson + "-" + modal.result.coach.split("@@")[1],
      lesson: modal.result.lesson,
      style: modal.result.style,
      coach: modal.result.coach
    }

    const URL = 'http://localhost:4000/event/addevent'; // for Local
    return axios.post(URL, details)
      .then((res) => {
        if (res.data === "No") {
          console.log("No");
        } else if (res.data === "ok") {
          this.calendar.events.add({
            start: details.start,
            end: details.end,
            id: details.id,
            resource: details.resource,
            text: details.text,
            lesson: details.lesson,
            style: details.style,
            coach: details.coach,
          });
          return res.data
        } else if (res.data === "Coach doent teach in this hours") {
          alert("Coach doent teach in this hours");
        } else if (res.data === "Coach doent teach in this day") {
          alert("Coach doent teach in this day");
        } else if (res.data === "Coach doent teach this swimming style") {
          alert("Coach doent teach this swimming style");
        } else if (res.data === "Coach doesnt exist") {
          alert("Coach doesnt exist");
        } else if (res.data === "The pool close in the weekend") {
          alert("The pool close in the weekend");
        } else if (res.data === "Enter all fields") {
          alert("Enter all fields");
        } else if (res.data === "There is another lesson in the pool.") {
          alert("There is another lesson in the pool.");
        }
      });
  }

  getCoachList() {
    const params = {
      isCoach: true,
    }
    const URL = 'http://localhost:4000/users/user'; // for Local
    return axios.get(URL, { params: params })
      .then((res) => {
        if (res.data === "No Coach") {
          console.log("No Coach");
        } else {
          return res.data
        }
      });
  }



  render() {

    return (
      <div className={"wrap"}>
        <div className={"calendar"}>
          <div className={"toolbar"}>
            <button onClick={ev => this.previous()}>Previous Week</button>
            <button onClick={ev => this.next()}>Next Week</button>
          </div>


          <DayPilotCalendar
            cellDuration={15}
            dayBeginsHour={8}
            dayEndsHour={20}
            viewType={"Week"}
            startDate={DayPilot.Date.today()}
            headerDateFormat={"dddd MMMM d, yyyy"}
            allowEventOverlap={false}
            eventMoveHandling={'Disabled'}
            eventArrangement={'Cascade'}
            {...this.state}
            ref={this.calendarRef}
          />
        </div>
        <div className={"left"}>
          <div className='right'>
            <button onClick={ev => this.gant()}>Extract Week Gant</button>
          </div>
          <DayPilotNavigator
            selectMode={"week"}
            showWeekNumbers={"true"}
            showMonths={1}
            skipMonths={1}
            onTimeRangeSelected={args => {
              this.calendar.update({
                startDate: args.day
              });
            }}
            ref={this.datePickerRef}
          />
        </div>
        <div className='gantt'>
          <DayPilotGantt
            days={30}
          />
        </div>
      </div>
    );
  }
}

export default Calendar;

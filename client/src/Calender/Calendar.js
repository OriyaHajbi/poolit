import React, { Component } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotGantt, DayPilotNavigator } from "daypilot-pro-react";
// import { ResourceGroups } from "./ResourceGroups";

const axios = require('axios').default;

class Calendar extends Component {

  constructor(props) {
    super(props);

    this.calendarRef = React.createRef();
    this.datePickerRef = React.createRef();
    this.ganttRef = React.createRef();
    this.addEventsToCalender();
    // this.checkIfUserLoggedIn();
    this.state = {
      startDayGantt: DayPilot.Date.today(),
      eventsWeekGantt: [],
      timeRangeSelectedHandling: "Enabled",
      onTimeRangeSelected: async args => {
        const coaches = await this.getCoachList();

        const modal = await DayPilot.Modal.form([
          {
            name: "Trainees", id: "trainees", type: "select", options: [
              { name: "1", id: "1" },
              { name: "3", id: "3" },
              { name: "4", id: "4" },
              { name: "5", id: "5" },
              { name: "6", id: "6" },
              { name: "7", id: "7" }
            ]
          },
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
              { name: "Group", id: "group" }]
          },
          { name: "Coach", id: "coach", type: "select", options: coaches.map(element => { return { name: element.username.split("@")[0], id: element._id + "@@" + element.username.split("@")[0] } }) }
        ]);
        this.calendar.clearSelection();
        if (!modal.result) { return; }
        this.checkEventDetails(modal, args);
      },
      eventDeleteHandling: "Update",
      onEventDeleted: async args => {
        console.log(args.e.data.id);
        this.deleteEventById(args.e.data.id);

      },
      onEventClick: async args => {
        const coaches = await this.getCoachList();
        const modal = await DayPilot.Modal.form([
          {
            name: "Update trainees", id: "trainees", type: "select", options: [
              { name: "1", id: "1" },
              { name: "3", id: "3" },
              { name: "4", id: "4" },
              { name: "5", id: "5" },
              { name: "6", id: "6" },
              { name: "7", id: "7" }
            ]
          },
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
              { name: "Group", id: "group" }]
          },
          { name: "Update Coach", id: "coach", type: "select", options: coaches.map(element => { return { name: element.username.split("@")[0], id: element._id + "@@" + element.username.split("@")[0] } }) }

        ], { style: args.e.data.style, lesson: args.e.data.lesson, coach: args.e.data.coach, trainees: args.e.data.countTrainees });
        if (!modal.result) { return; }
        // const e = args.e;
        this.checkUpdateDetails(modal, args);
        // e.data.text = modal.result.style + "-" + modal.result.lesson + "-" + modal.result.coach.split("@@")[1];
        // e.data.start = args.e.data.start;
        // e.data.end = modal.result.lesson === "private" ? new DayPilot.Date(args.e.data.start.value).addMinutes(45) : new DayPilot.Date(args.e.data.start.value).addMinutes(60)
        // this.calendar.events.update(e);
      },
    };
  }

  get calendar() {
    return this.calendarRef.current.control;
  }

  get datePicker() {
    return this.datePickerRef.current.control;
  }

  get gantt() {
    return this.ganttRef.current.control;
  }

  componentDidMount() {
    const date = new Date();
    const newDate = date.getFullYear() + "-" + (date.getMonth() + 1 < 10 ? "0" : "") + (date.getMonth() + 1) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());

    this.datePicker.select(newDate);
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

  checkUpdateDetails(modal, args) {
    const details = {
      text: modal.result.style + "-" + modal.result.lesson + "-" + modal.result.coach.split("@@")[1],
      lesson: modal.result.lesson,
      style: modal.result.style,
      coach: modal.result.coach,
      count: modal.result.trainees,
      id: args.e.data.id,
      start: args.e.data.start,
      end: modal.result.lesson === "private" ? new DayPilot.Date(args.e.data.start.value).addMinutes(45) : new DayPilot.Date(args.e.data.start.value).addMinutes(60),
      resource: args.e.data.start.getDayOfWeek() + 1,

    }

    const URL = 'http://localhost:4000/event/updateevent'; // for Local
    axios.post(URL, details)
      .then((res) => {
        if (res.data === "Event updated") {
          alert("Event updated");
          window.location.reload();
        } else {
          alert("Event doesn't updated");
        }
      });
  }

  deleteEventById(id) {
    const details = {
      id: id
    }
    const URL = 'http://localhost:4000/event/deleteevent'; // for Local
    axios.post(URL, details)
      .then((res) => {
        if (res.data === "Event deleted") {
          alert("Event deleted");
        } else {
          alert("Event doesn't deleted");
        }
      });
  }

  async gant() {
    const events = await DayPilot.Modal.prompt("Please enter week number:",)
      .then(function (args) {
        if (args.result) {
          const params = { week: args.result };
          const URL = 'http://localhost:4000/event/getweekevents'; // for Local
          return axios.get(URL, { params: params })
            .then((res) => {
              if (res.data === "Invalid input") {
                alert("Invalid input");
              } else if (res.data === "Doesn't have events in this week") {
                alert("Doesn't have events in this week");
              } else {
                // console.log(res.data);
                return res.data;
              }
            });
        }
      });
    console.log(events);
    if (!events || events.length < 1) {
      alert("no events in this week");
    } else {
      // console.log(events.length);
      // console.log(new DayPilot.Date(events[0].start).firstDayOfWeek("en-us"));
      this.setState(prevState => ({
        ...prevState,
        startDayGantt: new DayPilot.Date(events[0].start).firstDayOfWeek("en-us"),
        eventsWeekGantt: events
      }))
      console.log(events);
      console.log(this.gantt.tasks);
    }
  }

  // checkIfUserLoggedIn() {
  //   const URL = 'http://localhost:4000/users/login'; // for Local
  //   axios.get(URL)
  //     .then((res) => {
  //       console.log(res);
  //     });
  // }


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

            this.calendar.events.add({
              start: start.value,
              end: end.value,
              id: element.username,
              resource: String(element.days - 1),
              text: element.text,
              lesson: element.lesson,
              style: element.style,
              coach: element.coach,
              weekNumber: element.weekNumber,
              countTrainees: element.countTrainees,
              backColor: "#6df1f1",
              barColor: "#6df1f1"
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
      coach: modal.result.coach,
      count: modal.result.trainees
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
            backColor: "#6df1f1",
            barColor: "#6df1f1"
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
        } else if (res.data === "The amount of trainees does not match the type of lesson.") {
          alert("The amount of trainees does not match the type of lesson.");
        } else if (res.data === "Coach Teaching between this hours") {
          alert("Coach Teaching between this hours");
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
            <button className='btn btn-primary' onClick={ev => this.previous()}>Previous Week</button>
            <button className='btn btn-primary' onClick={ev => this.next()}>Next Week</button>
          </div>


          <DayPilotCalendar
            cellDuration={15}
            dayBeginsHour={8}
            dayEndsHour={20}
            eventDeleteHandling={"Disabled"}
            viewType={"Week"}
            eventRightClickHanding={"ContextMenu"}
            startDate={DayPilot.Date.today()}
            headerDateFormat={"dddd MMMM d, yyyy"}
            eventMoveHandling={'Disabled'}
            eventArrangement={'Cascade'}
            {...this.state}
            ref={this.calendarRef}
          />
        </div>
        <div className={"navigator"}>
          <div className={'right'}>
            <button className='btn btn-primary' onClick={ev => this.gant()}>Extract Week Gant</button>
          </div>
          <DayPilotNavigator
            selectMode={"week"}
            showWeekNumbers={"true"}
            onTimeRangeSelected={args => {
              this.calendar.update({
                startDate: args.day
              });
            }}
            ref={this.datePickerRef}
          />
        </div>
        <div className={'gantt'}>
          <DayPilotGantt
            startDate={this.state.startDayGantt}
            taskClickHandling={"Disabled"}
            taskMoveHandling={"Disabled"}
            taskResizeHandling={"Disabled"}
            days={"5"}
            cellWidth={parseInt(window.innerWidth / 5)}
            ref={this.ganttRef}
            tasks={this.state.eventsWeekGantt}
          />
        </div>
      </div>
    );
  }
}

export default Calendar;

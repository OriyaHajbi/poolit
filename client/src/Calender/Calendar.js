import React, {Component} from 'react';
import {DayPilot, DayPilotCalendar, DayPilotNavigator} from "daypilot-pro-react";
import {ResourceGroups} from "./ResourceGroups";
const axios = require('axios').default;

class Calendar extends Component {

  constructor(props) {
    super(props);
    
    this.calendarRef = React.createRef();
    this.datePickerRef = React.createRef();
    
    this.state = {
      viewType: "Resources",
      timeRangeSelectedHandling: "Enabled",
      onTimeRangeSelected: async args => {
        const coaches = await this.getCoachList();
        console.log(coaches);
        const modal = await DayPilot.Modal.form([
          {name:"Person" , id:"person" , type:"select" , options:coaches.map(element => { return {name:element.username.split("@")[0] , id:element.username.split("@")[0]}})},
          {name: "First Name", id: "first"},
          {name: "Last Name", id: "last"},
          {name: "Swimming style", id: "style" , type:"select" , options:[
            {name:"Front crawl" , id:"Front crawl"},
            {name:"Breaststroke" , id:"Breaststroke"},
            {name:"Backstroke" , id:"Backstroke"},
            {name:"Butterfly" , id:"Butterfly"}]},
          {name: "Lesson", id: "lesson" , type:"select" , options:[
            {name:"Private" , id:"private"},
            {name:"Group" , id:"group"},
            {name:"Mix - private & group" , id:"mix"}]},
          {name: "Coach", id: "coach" , type:"select" , options:coaches.map(element => { return {name:element.username.split("@")[0] , id:element.username.split("@")[0]}})}
        ]);
        this.calendar.clearSelection();
        if (!modal.result) { return; }
        this.calendar.events.add({
          start: args.start,
          end: modal.result.lesson === "private" ? new DayPilot.Date(args.start.value).addMinutes(45):new DayPilot.Date(args.start.value).addMinutes(60),
          id: DayPilot.guid(),
          resource: args.resource,
          text: modal.result.style + "-" + modal.result.lesson+"-"+modal.result.coach,
          first: modal.result.first,
          last: modal.result.last,
          lesson: modal.result.lesson,
          style: modal.result.style,
          coach:modal.result.coach
        });
        //console.log(this.calendar.events.list);
      },
      eventDeleteHandling: "Update",
      onEventClick: async args => {
        const coaches = await this.getCoachList();
        const modal = await DayPilot.Modal.form([
          {name: "Update First Name", id:"first"  },
          {name: "Update Last Name", id: "last"},
          {name: "Update Swimming style", id: "style" , type:"select" , options:[
            {name:"Front crawl" , id:"Front crawl"},
            {name:"Breaststroke" , id:"Breaststroke"},
            {name:"Backstroke" , id:"Backstroke"},
            {name:"Butterfly" , id:"Butterfly"}]},
          {name: "Update Lesson", id: "lesson" , type:"select" , options:[
            {name:"Private" , id:"private"},
            {name:"Group" , id:"group"},
            {name:"Mix - private & group" , id:"mix"}]},
          {name: "Update Coach", id: "coach" , type:"select" , options:coaches.map(element => { return {name:element.username.split("@")[0] , id:element.username.split("@")[0]}})}

        ], {first:args.e.data.first ,last:args.e.data.last ,style:args.e.data.style ,lesson:args.e.data.lesson, coach:args.e.data.coach});
        if (!modal.result) { return; }
        const e = args.e;
        e.data.text = modal.result.style + "-" + modal.result.lesson +"-"+modal.result.coach;
        e.data.start = args.e.data.start;
        e.data.end = modal.result.lesson === "private" ? new DayPilot.Date(args.e.data.start.value).addMinutes(45):new DayPilot.Date(args.e.data.start.value).addMinutes(60)
        
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
    const today = date.getFullYear() + "-" + (date.getMonth()+1 < 10 ? "0":"")+(date.getMonth()+1) + "-" + date.getDate();
    this.datePicker.select(today);
  }

  loadGroups() {
      const data = [
        { name: "Days", id: "days", resources: [
            {name: "Sunday", id: "D1"},
            {name: "Monday", id: "D2"},
            {name: "Tuesday", id: "D3"},
            {name: "Wednesday", id: "D4"},
            {name: "Thursday", id: "D5"},
            {name: "Friday", id: "D6"},
            {name: "Saturday", id: "D7"},
          ]
        },
        
      
      ];
      return data;
  }

  groupChanged(group) {

    const columns = group.resources;

    const events = [];

    this.calendar.update({columns, events});

  }

  next() {
    const current = this.datePicker.selectionDay;
    const updated = current.addDays(1);
    this.datePicker.select(updated);
  }

  previous() {
    const current = this.datePicker.selectionDay;
    const updated = current.addDays(-1);
    this.datePicker.select(updated);
  }

  getCoachList(){
      const params = {
        isCoach: true,
      }
      const URL = 'http://localhost:4000/users/user'; // for Local
      return axios.get(URL , {params: params})
      .then((res) => {
        if (res.data === "No Coach"){
          console.log("No Coach");
        }else{
          return res.data
        }
      });
    }

  render() {

    return (
      <div className={"wrap"}>   
        <div className={"calendar"}>
          <div className={"toolbar"}>    
            <ResourceGroups onChange={args => this.groupChanged(args.selected)} items={this.loadGroups()}></ResourceGroups>
            <span>Day:</span>
            <button onClick={ev => this.previous()}>Previous</button>
            <button onClick={ev => this.next()}>Next</button>
          </div>

          <DayPilotCalendar
            cellDuration={15}
            {...this.state}
            ref={this.calendarRef}
          />
        </div>
        <div className={"left"}>
          
          <DayPilotNavigator
            selectMode={"Week"}
            showMonths={1}
            skipMonths={1}
            onTimeRangeSelected={ args => {
              this.calendar.update({
                startDate: args.day
              });
            }}
            ref={this.datePickerRef}
          />
        </div>
      </div>
    );
  }
}

export default Calendar;

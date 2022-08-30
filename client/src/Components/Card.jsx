import React from 'react';
import {
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBCardImage,
    MDBRipple
} from 'mdb-react-ui-kit';

export default function Card(props) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

    return (
        <MDBCard>
            <MDBRipple className='header'>
                <MDBCardImage src={props.photo} fluid alt={props.coach.username.split("@")[0] + " photo"} />

            </MDBRipple>
            <MDBCardBody>
                <MDBCardTitle><h1>{props.coach.username.split("@")[0]}</h1></MDBCardTitle>
                <MDBCardText>
                    Swimming Style:<br />
                    {props.coach.swimmingStyle.map(style => { return style + " " })}<br />
                    Work Days:<br />
                    {props.coach.workDays.map(day => { return days[day - 1] + " " })}<br />
                    Work Hours:<br />
                    {props.coach.workHours[0] + ":00 - " + props.coach.workHours[1] + ":00"}
                </MDBCardText>
            </MDBCardBody>
        </MDBCard>
    );
}
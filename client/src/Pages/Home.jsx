import React, { useState } from "react";
import Card from "../Components/Card"
const axios = require('axios').default;

function Home() {
    const [coachs, setCoaches] = useState([]);
    if (coachs.length === 0) {
        getCoachList();
    }

    const photos = ["https://mir-s3-cdn-cf.behance.net/project_modules/disp/ea7a3c32163929.567197ac70bda.png",
        "https://thumbs.dreamstime.com/b/happy-smiling-geek-hipster-beard-man-cool-avatar-geek-man-avatar-104871313.jpg",
        "https://w7.pngwing.com/pngs/340/946/png-transparent-avatar-user-computer-icons-software-developer-avatar-child-face-heroes-thumbnail.png"];


    function getCoachList() {
        const params = {
            isCoach: true,
        }
        const URL = 'http://localhost:4000/users/user'; // for Local
        axios.get(URL, { params: params })
            .then((res) => {
                if (res.data === "No Coach") {
                    console.log("No Coach");
                } else {
                    setCoaches(res.data);
                }
            });
    }

    return <div className="">
        <div className="home-form card card-body center">
            <h1>Welcome to Poolit</h1>
            <h3>Meet our choachers</h3>
        </div>
        <div className="cards">
            {coachs.map((coach, index) => {
                return <div className="coach-card" key={coach.username}>
                    <Card coach={coach} photo={photos[index]} />
                </div>
            })}
        </div>
    </div>
}


export default Home;
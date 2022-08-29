import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const axios = require('axios').default;



function NavBar() {
    const navigate = useNavigate();
    const [isLogged, setLogged] = useState(false);



    useEffect(() => {
        setTimeout(() => {
            setLogged(localStorage.getItem('isLoggedIn') === "true");
        }, 100)
    });

    function login() {
        navigate("/login");
    }
    function register() {
        navigate("/register");
    }


    function logOut() {
        const URL = 'http://localhost:4000/users/logout'; // for Local
        axios.post(URL)
            .then((res) => {
                localStorage.setItem('isLoggedIn', 'false');
                setLogged(false);
                navigate("/login");
            });
    }

    return <div>
        <nav className="navbar">

            <span className="navbar-brand">Poolit <a href="/"><img src="photos/swimming-logo.ico" alt="Poolit Logo"></img></a></span>
            <div className="">
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item">

                        {!isLogged ? <span className="navbar-right "><button className="btn" onClick={login}>Login</button></span> : ""}
                        {!isLogged ? <span className="navbar-right "><button className="btn" onClick={register}>Register</button></span> : ""}
                        {isLogged ? <span className="navbar-right "><button className="btn" onClick={logOut}>Logout</button></span> : ""}
                    </li>
                </ul>
            </div>

        </nav>
    </div>
}




export default NavBar;
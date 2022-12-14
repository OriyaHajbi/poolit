import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const axios = require('axios').default;


function Login() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  function updateUser(event) {
    const { name, value } = event.target;

    setUser(prevValue => {
      return {
        ...prevValue,
        [name]: value
      }
    });
  }

  async function sendUserData() {

    const URL = 'http://localhost:4000/users/login'; // for Local


    axios.post(URL, {
      email: user.email,
      password: user.password,
    })
      .then((res) => {
        if (res.data === "User doesn't exist") {
          setError(res.data);
        } else if (res.data === "incorrect password") {
          setError(res.data);
        } else if (res.data.username) {
          localStorage.setItem('isLoggedIn', 'true');
          navigate("/main");
        } else {
          setError("invalid input");
        }
      });
  }

  return <div className="login-form">
    <div className="error">
      <p>{error}</p>
    </div>
    <div className="card card-body">
      <h3>Login</h3>
      <div className="form-group">
        <label>Email:</label>
        <input onChange={updateUser} type="email" name="email" id="email"></input>
      </div>
      <div className="form-group">
        <label>Password:</label>
        <input onChange={updateUser} type="password" name="password" id="password"></input>
      </div>
      <div className="text-center">
        <button onClick={sendUserData} className="btn btn-primary " type="submit">Login</button>
      </div>
    </div>
  </div>
}




export default Login;
import React , {useState} from "react";
import { useNavigate } from "react-router-dom";

const axios = require('axios').default;

function Register(){
    const navigate = useNavigate();
    const [checked, setChecked] = useState(false);  
    const [user , setUser] = useState({
        email: "",
        password: "",
        repassword: "",
        isCoach: checked
    });
    const [error , setError] = useState("");


    function updateUser(event){
        const { name, value } = event.target;

        setUser(prevValue => {
            return {
            ...prevValue,
            [name] : value
         }});
    }

async function sendUserData(){

    const URL = 'http://localhost:4000/users/register'; // for Local

  
    axios.post(URL, {
      email: user.email,
      password: user.password,
      repassword: user.repassword,
      isCoach: checked ? true: false
    })
    .then((res) => {
      if (res.data === "User Exist"){
        setError(res.data);
    }else if (res.data.username){
        navigate("/login");
    }else{
        setError("invalid input");
    }
    });
  }

    return  <div className="login-form">
                <div className="error">
                    <p>{error}</p>
                </div>   
                <div className="card card-body">
                    <h3>Register</h3>
                    <div className="form-group">
                        <label>Email:</label>
                        <input onChange={updateUser} type="email" name="email" id="email"></input>
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input onChange={updateUser} type="password" name="password" id="password"></input>
                    </div>
                    <div className="form-group">
                        <label>Re-password:</label>
                        <input onChange={updateUser} type="password" name="repassword" id="repassword"></input>
                    </div>
                    <div>
                        <label>Coach?</label>
                        <input type="checkbox"  onChange={e => { if (checked !== undefined)
                        setChecked(e.target.checked)}}   />
                    </div>
                    <div className="text-center">
                        <button className="btn btn-primary " type="submit" onClick={sendUserData}>Register</button>
                    </div>
                </div>
            </div>
}




export default Register;
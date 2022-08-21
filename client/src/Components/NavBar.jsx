import React from "react";



function NavBar(){

    return  <div>
                <nav className="navbar">
                
                    <span className="navbar-brand">Poolit <a href="/"><img src="photos/swimming-logo.ico" alt="Poolit Logo"></img></a></span>
                     <div className="">
                        <ul className="navbar-nav ml-auto">
                            <li className="nav-item">
                                <span className="ml-auto"><a href="/login">Login </a></span>
                                <span className="navbar-right "><a href="/register"> Register</a></span>
                            </li>
                        </ul>
                    </div>

                </nav>
            </div>
}




export default NavBar;
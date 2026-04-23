import React, { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets.js'
import { signup, loginUser, resetPass } from '../../config/firebase.js'

const Login = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (currState === "Sign up") {
      await signup(userName, email, password);
    } else {
      await loginUser(email, password);
    }
  };

  return (
    <div className='Login'>
      <img src={assets.logo_big} alt="Logo" className="logo" />

      <form onSubmit={onSubmitHandler} className='Login-form'>
        <h2>{currState}</h2>

        {currState === "Sign up" ? (
          <input
            onChange={(e) => setUserName(e.target.value)}
            value={userName}
            type="text"
            placeholder='Username'
            className="form-input"
            required
          />
        ) : null}

        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          placeholder='Email address'
          className="form-input"
          required
        />

        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          placeholder='Password'
          className="form-input"
          required
        />

        <button type='submit'>
          {currState === "Sign up" ? "Create account" : "Login now"}
        </button>

        <div className="login-term">
          <input type="checkbox" required />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        <div className="Login-forgot">
          {currState === "Sign up" ? (
            <p className='Login-toggle'>
              Already have an account{" "}
              <span onClick={() => setCurrState("Login")}>Login here</span>
            </p>
          ) : (
            <p className='Login-toggle'>
              Create an account{" "}
              <span onClick={() => setCurrState("Sign up")}>Click here</span>
            </p>
          )}
          {currState === "Login" ? (
            <p className='Login-toggle'>
              Forget Password ?{" "}
              <span onClick={() => resetPass(email)}>reset here</span>
            </p>
          ) : null}
        </div>
      </form>
    </div>
  )
}

export default Login
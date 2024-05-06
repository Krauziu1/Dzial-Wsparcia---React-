import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './LoginValidation';
import {validation} from "./LoginValidation";
import axios from "axios";
import { useEffect } from "react";




function Login() {
    const [values, setValues ] = useState( {
        email: '',
        password: ''
    })

    const navigate = useNavigate();
    const [errors, setErrors] = useState({})


    const handleInput = (event)=> {
        setValues(prev => ({...prev, [event.target.name]:[event.target.value]}))
    }
    axios.defaults.withCredentials= true;

    useEffect(() => {
        axios.get('http://localhost:8081')
        .then(res => {
          if(res.data.valid) {
            navigate('/');
            
    
          } else {
            navigate('/login')
          }
        })
        .catch(err => console.log(err))
    
      },[])

    const handleSubmit = (event) => {
        event.preventDefault();
    const validationErrors = validation(values);
    setErrors(validationErrors);
    if(validationErrors.email === "" && validationErrors.password === "") {
        axios.post('http://localhost:8081/login', values)
        .then(res => {
            if(res.data.Login) {
                navigate('/')
            }else {
                alert("No record")
            }
            // console.log(res);
        })
        // .catch(err => console.log(err));
    }
}


    return (
        <div className ="d-flex justify-content-center align-items-center bg-primary vh-100">
            <div className="bg-white p-3 rounded w-auto h-auto">
                <form action="" onSubmit={handleSubmit}  className="d-flex flex-column align-items-center">
                <h2> Logowanie </h2>
                    <div className="mb-3"> 
                        <label htmlFor="email"><strong>Email</strong></label>
                        <input type="email" placeholder="Wprowadź email" name="email"
                         onChange={handleInput} className="form-control rounded-0" />
                       {errors.email && <span className="text-danger"> {errors.email}</span>} 
                    </div>
                    <div className="mb-3"> 
                        <label htmlFor="password"><strong>Haslo</strong></label>
                        <input type="password" placeholder="Wprowadź hasło" name="password"
                         onChange={handleInput} className="form-control rounded-0" />
                         {errors.password && <span className="text-danger"> {errors.password}</span>} 
                    </div>
                    <button type="submit" className="btn btn-success w-30"><strong>Zaloguj się</strong></button>
                    <p className="mb-2"> Nie masz jeszcze konta?</p>
                    <Link to="/signup" className="btn btn-default border w-30 bg-light rounded-0 text-decoration-none"> <strong>Stwórz konto</strong></Link>
                </form>
            </div>
        </div>
    )
}

export default Login;

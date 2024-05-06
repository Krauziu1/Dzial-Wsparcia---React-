import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './SignupValidation'
import {validation} from './SignupValidation'
import axios from 'axios';
function Signup() {
    const [values, setValues ] = useState( {
        name:'',
        email: '',
        password: ''
        
    })
     const navigate = useNavigate();
     const [errors, setErrors] = useState({})

    const handleInput = (event)=> {
        setValues(prev => ({...prev, [event.target.name]:[event.target.value]}))
    }
     const handleSubmit =(event) => {
        event.preventDefault();
        setErrors(validation(values));
        if(errors.name ==="" && errors.email === "" && errors.password==="") {
        axios.post('http://localhost:8081/signup', values)
        .then(res => {
            // console.log(res);
             navigate('/login')
            })
        // .catch(err => console.log(err));
    }
}

  return (
    <div className ="d-flex justify-content-center align-items-center bg-primary vh-100">
    <div className="bg-white p-3 rounded w-auto h-auto">
        <h2> Rejestracja</h2>
        <form action="" onSubmit={handleSubmit} className="d-flex flex-column align-items-center">
            <div className="mb-3"> 
                <label htmlFor="name"><strong>Imie</strong></label>
                <input type="name" placeholder="Wprowadź Imie" name="name"
                  onChange={handleInput} className="form-control rounded-0" />
                  {errors.name && <span className="text-danger"> {errors.name}</span>}
            </div>
            <div className="mb-3"> 
                <label htmlFor="email"><strong>Email</strong></label>
                <input type="email" placeholder="Wprowadź email" name="email"
                  onChange={handleInput} className="form-control rounded-0" />
                  {errors.email && <span className="text-danger"> {errors.email}</span>}
            </div>
            <div className="mb-3"> 
                <label htmlFor="password"><strong>Hasło</strong></label>
                <input type="password" placeholder="Wprowadź hasło" name="password"
                  onChange={handleInput} className="form-control rounded-0" />
                  {errors.password && <span className="text-danger"> {errors.password}</span>}
            </div>
            <button type="submit" className="btn btn-success w-auto"><strong>Zarejestruj się</strong></button>
            <p> Masz już konto?</p>
            <Link to="/login" className="btn btn-default border w-30 bg-light rounded-0 text-decoration-none"> <strong>Zaloguj się</strong></Link>
            
        </form>
    </div>
</div>
  )
}

export default Signup
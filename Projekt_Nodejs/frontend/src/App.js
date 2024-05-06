import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Signup from './signup';
import Home from './Home';


function App() {
  return (

    <BrowserRouter>

    <Routes>
      <Route path='/' element={<Home/>}></Route>
      <Route path='/signup' element={<Signup/>}> </Route>
      <Route path='/login' element={<Login/>}> </Route>
    </Routes>
    </BrowserRouter>
  );
}

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HeaderComponent from './components/HeaderComponent';
import ListEmployeeComponent from './components/ListEmployeeComponent';
import EmployeeComponent from './components/EmployeeComponent';
import RegisterComponent from './components/RegisterComponent';
import LoginComponent from './components/LoginComponent';
import { isUserLoggedIn } from './services/AuthService';
import './App.css';

function App() {

  // Security Wrapper: Protects routes from unauthorized access
  function AuthenticatedRoute({ children }) {
    const isAuth = isUserLoggedIn();
    if (isAuth) {
      return children;
    }
    return <Navigate to="/" />
  }

  return (
    <BrowserRouter>
      <HeaderComponent />
      
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<LoginComponent />} />
        <Route path='/login' element={<LoginComponent />} />
        <Route path='/register' element={<RegisterComponent />} />
        
        {/* Protected Routes */}
        <Route path='/employees' element={
          <AuthenticatedRoute>
            <ListEmployeeComponent />
          </AuthenticatedRoute>
        } />
        
        <Route path='/add-employee' element={
          <AuthenticatedRoute>
            <EmployeeComponent />
          </AuthenticatedRoute>
        } />
        
        <Route path='/edit-employee/:id' element={
          <AuthenticatedRoute>
            <EmployeeComponent />
          </AuthenticatedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import React, { useState } from 'react';
import { loginAPICall, storeToken, saveLoggedInUser } from '../services/AuthService';
import { useNavigate, Link } from 'react-router-dom';

const LoginComponent = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        
        loginAPICall(usernameOrEmail, password).then((response) => {
            // 1. Get the JWT token from response
            const token = response.data.accessToken;
            
            // 2. Store token in localStorage
            storeToken(token);
            
            // 3. Save user info to sessionStorage (Hardcoding ROLE_ADMIN for testing the UI)
            saveLoggedInUser(usernameOrEmail, "ROLE_ADMIN");
            
            // 4. Redirect to employee list
            navigate('/employees');
        }).catch(error => {
            console.error(error);
            alert("Login Failed! Please check your credentials.");
        });
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white text-center">
                            <h2>Employee Management System</h2>
                            <p className="mb-0">Please Login</p>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleLogin}>
                                <div className="form-group mb-3">
                                    <label>Username or Email</label>
                                    <input type="text" className="form-control" 
                                        placeholder="Enter username or email" 
                                        value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} required />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Password</label>
                                    <input type="password" className="form-control" 
                                        placeholder="Enter password" 
                                        value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>
                                <div className="text-center">
                                    Don't have an account? <Link to="/register">Register here</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginComponent;

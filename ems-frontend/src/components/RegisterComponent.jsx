import React, { useState } from 'react';
import { registerAPICall } from '../services/AuthService';
import { useNavigate, Link } from 'react-router-dom';

const RegisterComponent = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();
        
        const registerObj = { username, email, password };
        
        registerAPICall(registerObj).then((response) => {
            console.log(response.data);
            alert("Registration Successful! You can now log in.");
            navigate('/login');
        }).catch(error => {
            console.error(error);
            alert("Registration Failed! Username or Email might already exist.");
        });
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-header bg-dark text-white text-center">
                            <h2>User Registration</h2>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleRegister}>
                                <div className="form-group mb-3">
                                    <label>Username</label>
                                    <input type="text" className="form-control" 
                                        placeholder="Enter username" 
                                        value={username} onChange={(e) => setUsername(e.target.value)} required />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Email</label>
                                    <input type="email" className="form-control" 
                                        placeholder="Enter email address" 
                                        value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Password</label>
                                    <input type="password" className="form-control" 
                                        placeholder="Enter password" 
                                        value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 mb-3">Register</button>
                                <div className="text-center">
                                    Already have an account? <Link to="/login">Login here</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterComponent;

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { isUserLoggedIn, logout } from '../services/AuthService';

const HeaderComponent = () => {
    const isAuth = isUserLoggedIn();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <header>
            <nav className="navbar navbar-expand-md navbar-dark bg-dark shadow px-3">
                <a className="navbar-brand" href="#">
                    DevSecOps EMS
                </a>
                
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav ms-auto">
                        {!isAuth && (
                            <>
                                <li className="nav-item">
                                    <NavLink to="/register" className="nav-link">Register</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/login" className="nav-link">Login</NavLink>
                                </li>
                            </>
                        )}
                        {isAuth && (
                            <>
                                <li className="nav-item">
                                    <NavLink to="/employees" className="nav-link">Employees</NavLink>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link btn btn-link" onClick={handleLogout}>Logout</button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>
        </header>
    );
}

export default HeaderComponent;

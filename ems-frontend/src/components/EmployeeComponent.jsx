import React, { useState, useEffect } from 'react';
import { createEmployee, getEmployee, updateEmployee } from '../services/EmployeeService';
import { useNavigate, useParams } from 'react-router-dom';

const EmployeeComponent = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [department, setDepartment] = useState('');
    const [designation, setDesignation] = useState('');
    const [salary, setSalary] = useState('');
    const [joiningDate, setJoiningDate] = useState('');

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if(id) {
            getEmployee(id).then((response) => {
                const emp = response.data;
                setFirstName(emp.firstName);
                setLastName(emp.lastName);
                setEmail(emp.email);
                setPhone(emp.phone || '');
                setDepartment(emp.department || '');
                setDesignation(emp.designation || '');
                setSalary(emp.salary || '');
                setJoiningDate(emp.joiningDate || '');
            }).catch(error => {
                console.error(error);
            });
        }
    }, [id]);

    const saveOrUpdateEmployee = (e) => {
        e.preventDefault();
        
        const employee = { firstName, lastName, email, phone, department, designation, salary, joiningDate, status: "ACTIVE" };

        if(id) {
            updateEmployee(id, employee).then((response) => {
                navigate('/employees');
            }).catch(error => console.error(error));
        } else {
            createEmployee(employee).then((response) => {
                navigate('/employees');
            }).catch(error => console.error(error));
        }
    }

    const pageTitle = () => {
        return <h2 className="text-center">{id ? 'Update Employee' : 'Add Employee'}</h2>
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow">
                        <div className="card-header bg-dark text-white">
                            {pageTitle()}
                        </div>
                        <div className="card-body">
                            <form onSubmit={saveOrUpdateEmployee}>
                                <div className="row">
                                    <div className="col-md-6 form-group mb-3">
                                        <label>First Name</label>
                                        <input type="text" className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                                    </div>
                                    <div className="col-md-6 form-group mb-3">
                                        <label>Last Name</label>
                                        <input type="text" className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 form-group mb-3">
                                        <label>Email</label>
                                        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                    <div className="col-md-6 form-group mb-3">
                                        <label>Phone</label>
                                        <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 form-group mb-3">
                                        <label>Department</label>
                                        <input type="text" className="form-control" value={department} onChange={(e) => setDepartment(e.target.value)} />
                                    </div>
                                    <div className="col-md-6 form-group mb-3">
                                        <label>Designation</label>
                                        <input type="text" className="form-control" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 form-group mb-3">
                                        <label>Salary</label>
                                        <input type="number" className="form-control" value={salary} onChange={(e) => setSalary(e.target.value)} />
                                    </div>
                                    <div className="col-md-6 form-group mb-3">
                                        <label>Joining Date</label>
                                        <input type="date" className="form-control" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} />
                                    </div>
                                </div>
                                
                                <button type="submit" className="btn btn-success w-100 mt-3">Submit</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployeeComponent;

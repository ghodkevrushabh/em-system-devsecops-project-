import React, { useEffect, useState } from 'react';
import { listEmployees, deleteEmployee } from '../services/EmployeeService';
import { useNavigate } from 'react-router-dom';
import { isAdminUser } from '../services/AuthService';

const ListEmployeeComponent = () => {
    const [employees, setEmployees] = useState([]);
    const navigate = useNavigate();
    const isAdmin = isAdminUser();

    useEffect(() => {
        getAllEmployees();
    }, []);

    const getAllEmployees = () => {
        listEmployees().then((response) => {
            setEmployees(response.data);
        }).catch(error => {
            console.error("Error fetching employees", error);
        });
    }

    const addNewEmployee = () => {
        navigate('/add-employee');
    }

    const updateEmployee = (id) => {
        navigate(`/edit-employee/${id}`);
    }

    const removeEmployee = (id) => {
        if(window.confirm("Are you sure you want to delete this employee?")){
            deleteEmployee(id).then((response) => {
                getAllEmployees();
            }).catch(error => {
                console.error("Error deleting employee", error);
            });
        }
    }

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Employee List</h2>
            
            {isAdmin && 
                <button className="btn btn-primary mb-3" onClick={addNewEmployee}>
                    Add Employee
                </button>
            }

            <div className="table-responsive shadow">
                <table className="table table-striped table-bordered mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Designation</th>
                            {isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {
                            employees.map(employee =>
                                <tr key={employee.empId}>
                                    <td>{employee.empId}</td>
                                    <td>{employee.firstName}</td>
                                    <td>{employee.lastName}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.department}</td>
                                    <td>{employee.designation}</td>
                                    {isAdmin && 
                                        <td>
                                            <button className="btn btn-info btn-sm me-2" onClick={() => updateEmployee(employee.empId)}>Update</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => removeEmployee(employee.empId)}>Delete</button>
                                        </td>
                                    }
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ListEmployeeComponent;

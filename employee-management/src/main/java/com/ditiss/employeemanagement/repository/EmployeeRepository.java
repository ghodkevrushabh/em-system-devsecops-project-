package com.ditiss.employeemanagement.repository;

import com.ditiss.employeemanagement.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    // JpaRepository gives us all CRUD operations for free!
}
